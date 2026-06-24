// Fizyon — scheduled reminder sender (Supabase Edge Function, Deno).
// Sends Web Push (VAPID) + optional email to patients who still have exercises
// left today and whose reminder time matches this run. Schedule it hourly.
//
// Deploy:   supabase functions deploy send-reminders --no-verify-jwt
// Secrets:  supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... \
//             VAPID_SUBJECT=mailto:you@fizyon.net RESEND_API_KEY=... \
//             SEND_FROM="Fizyon <hatirlatma@fizyon.net>"
// SERVICE_ROLE_KEY + SUPABASE_URL are injected automatically.
// Schedule + full setup steps: see REMINDERS.md
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "https://esm.sh/web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hatirlatma@fizyon.net";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SEND_FROM = Deno.env.get("SEND_FROM") ?? "Fizyon <hatirlatma@fizyon.net>";

if (VAPID_PUBLIC && VAPID_PRIVATE) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

// "18:00" etc. Compare against the function's run hour in Europe/Istanbul.
function currentHHMM(): string {
  const f = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false });
  const parts = f.formatToParts(new Date());
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  return `${hh}:00`;
}
function startOfTodayIstanbulISO(): string {
  const now = new Date();
  const d = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function sendPush(userId: string, payload: Record<string, unknown>) {
  const { data: subs } = await admin.from("push_subscriptions").select("endpoint,sub").eq("user_id", userId);
  for (const row of subs ?? []) {
    try {
      await webpush.sendNotification(row.sub as any, JSON.stringify(payload));
    } catch (err: any) {
      // 404/410 → subscription gone, clean it up
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
      }
    }
  }
}

async function sendEmail(userId: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  const { data: u } = await admin.auth.admin.getUserById(userId);
  const email = u?.user?.email;
  if (!email) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: SEND_FROM, to: email, subject, html }),
  }).catch(() => {});
}

Deno.serve(async (_req) => {
  const hhmm = currentHHMM();
  const todayISO = startOfTodayIstanbulISO();

  // patients with their reminder settings
  const { data: patients } = await admin
    .from("profiles")
    .select("id, full_name, notif_settings(times)")
    .eq("role", "patient");

  let sent = 0;
  for (const p of patients ?? []) {
    const times: string[] = (p as any).notif_settings?.times ?? [];
    if (!times.includes(hhmm)) continue; // not this patient's reminder hour

    // does the patient have any exercises, and are any still undone today?
    const { data: exs } = await admin.from("exercises").select("id").eq("patient_id", p.id);
    if (!exs || exs.length === 0) continue;
    const { data: comps } = await admin
      .from("completions").select("exercise_id").eq("patient_id", p.id).gte("done_at", todayISO);
    const doneToday = new Set((comps ?? []).map((c: any) => c.exercise_id));
    const remaining = exs.filter((e: any) => !doneToday.has(e.id)).length;
    if (remaining === 0) continue; // already finished today

    const first = ((p as any).full_name || "").split(" ")[0] || "Merhaba";
    const body = `${first}, bugünkü egzersizlerini bekliyoruz 💪 (${remaining} hareket kaldı)`;
    await sendPush(p.id, { title: "Fizyon hatırlatma", body, url: "/", tag: "fizyon-reminder" });
    await sendEmail(p.id, "Fizyon — bugünkü egzersizlerin", `<p>${body}</p><p><a href="https://fizyon.net">Uygulamayı aç</a></p>`);
    sent++;
  }

  return new Response(JSON.stringify({ ok: true, hhmm, sent }), { headers: { "Content-Type": "application/json" } });
});
