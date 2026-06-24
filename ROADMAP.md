# Fizyon — Build Roadmap

Each feature is built, then **tested with Playwright**, before the next. Status: ☐ todo · ◐ building · ☑ tested.

## Foundation
- ☑ Project scaffold, design tokens, logo
- ☑ App shell + client-side router + state/persistence
- ☑ Onboarding: role select + two register types + login (error prevention) — TESTED

## Doctor
- ☑ Patient list (home) with adherence — TESTED
- ☑ Patient detail + adherence chart — TESTED
- ☑ Program builder + preset library + config sheet (reps/time/note/verify, autosave) — TESTED
- ☑ Progress + analytics charts (patient-detail + Analiz tab: comparison + trend) — TESTED
- ☑ Notifications: general + patient-specific + **automatic follow-up rules** (inactive-days trigger + actions: notify/remind/call/message) — TESTED
- ☑ Appointments — editable (date/time sheet) — TESTED
- ☑ New-patient flow (create with validation → detail) — TESTED
- ☑ Doctor video recording (record-own: camera preview + simulated capture → custom exercise) — TESTED

## New (requested 2026-06-22)
- ☑ Bottom nav redesigned entirely (floating pill, active tab labelled) — TESTED
- ☑ Patient: physiotherapist name prominent on home — TESTED
- ☑ Shareable achievement card (generic, no condition; physio name + total moves + days; canvas PNG export + Web Share) — TESTED

## Patient
- ☑ Today (home) + doctor note + reminders — TESTED
- ☑ Exercise player (animated gray-body demo + timer) — TESTED
- ☑ Camera verification (MediaPipe pose + canvas skeleton + no-camera fallback) — TESTED
- ☑ "Couldn't do because…" feedback (sheet) — built
- ☑ Gamification (opt-in): points, streak, goal, journey stages, reward badges — TESTED

## Backend, legal & Play (2026-06-22)
- ☑ Supabase schema + Row-Level Security on all tables (applied + verified)
- ☑ Auto-provision triggers (profile on signup; notif/gamification on patient) — verified
- ☑ Real auth: email signup/login wired + tested against live DB (profile row created)
- ☑ KVKK consent gate (açık rıza) in onboarding; consent persisted server-side — TESTED
- ☑ Privacy Policy + Terms (KVKK/GDPR-aligned, lawyer-review flagged) hosted in-app
- ☑ Cloud data API layer (js/api.js)
- ☑ Google Play readiness: GOOGLE_PLAY.md, TWA scaffold (twa-manifest, assetlinks), SECURITY.md
- ☑ Demo is now its own button (welcome → "Demo olarak gez"); demo + cloud modes coexist
- ☑ Real login (email/password) → loads own cloud data — TESTED (doctor sees own patient + program via RLS)
- ☑ Register fully functional (email signup + consent + doctor-code linking) — TESTED (profile/link created)
- ☑ Core writes persist to cloud: add/delete exercise, completion, verify, feedback, notif, appointment, gamify, video
- ☐ Phone OTP (needs SMS provider), custom SMTP (built-in email rate-limited), custom domain for TWA, EU data residency, lawyer/VERBİS
- Note: condition/week not captured at patient self-signup (doctor sets clinical context); minor follow-up

## Starred backlog (2026-06-24) — all built & tested in demo (0 console errors)
- ☑ **Egzersiz animasyonları belirgin/canlı + sayı artırıldı**: yeni figür sistemi (ayakta/yatar/oturur/emekleme),
  her egzersiz çalışan uzvu **teal vurgular + animasyonu belirginleştirir**; 22 animasyon, **28 hazır hareket**,
  7 kategori (diz/bel/omuz/**boyun/kalça**/genel), 7 hazır protokol.
- ☑ **Kamera kanıtı harekete dayalı/tutarlı**: egzersize göre vücut sinyali (kalça/diz/kol/baş), torso boyuna
  normalize, ~1 sn kalibrasyon + EMA yumuşatma + histerezisli tekrar sayımı; denge/tutuş için stabilite kontrolü.
  (Gerçek cihazda eşik ince ayarı gerekebilir — kamerasız demoda doğrulandı.)
- ☑ **Doktor→hasta tam akış**: program/hareket **düzenleme** (eklendi), not, video; **Supabase Realtime** ile
  hastada **anlık görünme** (program/not/randevu değişince otomatik tazelenir + bildirim).
- ☑ **Push hatırlatma + e-posta/SMTP**: client push aboneliği + service worker push/tık olayları + `push_subscriptions`
  tablosu; saatlik **Edge Function** (`supabase/functions/send-reminders`, VAPID + Resend) — kurulum: REMINDERS.md.
  (VAPID/SMTP/Resend hesap anahtarları + cron kullanıcı tarafından girilecek.)
- ☑ **Randevu (link + iç slot)**: doktor profilinde **Randevular** ekranı — dış randevu bağlantısı (Calendly vb.)
  + iç **boş saat** sistemi; hasta uygulamadan açık saatlerden randevu alır. `appointment_slots` tablosu + RLS.

## Cross-cutting
- ☐ 3-tap navigation audit
- ☐ Accessibility pass (contrast, tap targets, reduced-motion)
- ☑ PWA install (manifest + service worker) — "downloadable"
- ☑ Security: RLS role isolation enforced at DB; on-device camera; audit log

## Test log
- 2026-06-21 (Playwright, 430×880): welcome, login (both roles), doctor patient list,
  patient detail + chart (fixed canvas sizing), register flow + inline validation +
  doctor-license reveal, patient "Bugün" home. 0 console errors. All passing.
- 2026-06-22 (Playwright): program builder + preset library + config sheet (verify toggle,
  persisted to localStorage), polished pill bottom-nav, exercise player + animated gray-body
  demo + timer, camera verify (no-camera fallback + sim-verify → marks done, awards points,
  syncs), gamification journey, doctor analytics (2 charts). Fixed: textarea font-family
  inherit, SW network-first to avoid stale cache. 0 console errors. Screenshots in tests/.
- 2026-06-24 (Playwright, 430×880): all 22 exercise demos render + animate + highlight correct limb;
  patient booking (slot → nextAppt updates); player animation + cue; camera fallback + sim-verify;
  doctor builder edit-exercise (10×3→15×3 persisted); 7 protocols (diz "önerilen"); 28 presets/7 cats;
  doctor Randevular screen (booking-url save + add-slot). 0 console errors/warnings.
