# Fizyon — v2 Compliance Audit & Test Report

> Document 13. Audits the **actual implementation** (`~/Desktop/Fizyon`) against the PRD package (docs 04/06/07/08/09/11/12).
> Date: 2026-06-26 · Method: full code audit (app.js/api.js/data.js/schema.sql/functions) + behavioral test pass (Playwright, demo mode) + design verification (v2 screenshots).
> Purpose: measure compliance, find the most non-compliant areas, decide patch-vs-rebuild, and produce the prioritized implementation backlog.

---

## 1. Executive summary

**Overall compliance ≈ 57%.** The product is a polished, working PWA with an **excellent security access-control core** and a **real on-device camera-CV engine**, but several **health-grade compliance gaps** and a **demo-flatters / cloud-under-delivers** split.

> ⚠️ **Single most important finding:** the app behaves very differently in **demo** vs **cloud (real)** mode. The demo looks complete and data-rich; the **real cloud product** hardcodes adherence/analytics to **0** and freezes gamification. Reviewers (and the founder) mostly see the demo. **Production is materially less functional than it appears.**

**Most non-compliant areas (severity-ranked):**
| # | Area | Severity | One-line |
|---|---|---|---|
| 1 | **Adherence & analytics in cloud** | 🔴 Critical | Hardcoded `adherence:0`, `history:[0…]` in cloud (`app.js:1223-1224`) → headline metric & all clinician charts non-functional in production |
| 2 | **KVKK data-subject rights** | 🔴 Critical | No consent withdrawal, no data export, no deletion/erasure anywhere (Epic 14) — mandatory for special-category health data |
| 3 | **"Verified" integrity** | 🔴 Critical | Manual `sim-verify` writes `verified:true` with **no camera** (`app.js:1137`); "verify once per move/day" not enforced → clinical-trust hole |
| 4 | **Data residency** | 🔴 Critical | DB in `ap-northeast-2` (Seoul) — KVKK/GDPR cross-border issue for TR patient health data |
| 5 | **Auth hardening** | 🟠 High | Email confirmation OFF; seeded test accounts (`login.doc`/`login.pat`, known password) still live; doctor license never verified |
| 6 | **Cloud offline reconciliation** | 🟠 High | No offline write queue; completions done offline are silently dropped (`.catch(()=>{})`, `app.js:757`) — violates PRD FR-32 |
| 7 | **Gamification is static** | 🟡 Medium | Streak/badges/journey-stage never computed or earned; only points update |
| 8 | **Re-engagement & messaging absent** | 🟡 Medium | No patient-facing no-shame welcome-back (Epic 9); patient↔doctor messaging is a "yakında" stub (Epic 12) |
| 9 | **"Record demo video" captures nothing** | 🟡 Medium | 3-2-1 countdown records no footage; flag only flips a label (`app.js:1037-1052`) — misleading capability |
| 10 | **Data model divergence vs PRD 09** | 🟡 Medium | No `verify_method`, `consent_record`, `move_signature`, programs/assignments/templates/media — underpins 1/2/3 |

**Strong areas (keep):** RLS security model (excellent), real MediaPipe camera CV, the patient daily loop, share-card, the v2 design system (corporate, cohesive).

---

## 2. Methodology & **bypass report** (what I tested, how)

**Tested by behavioral run (Playwright, fake camera):** both personas' core journeys end-to-end.
- ✅ **Bypassed via DEMO mode** (this is the legitimate bypass for user-action-gated flows): demo mode skips real signup/login/email-confirmation and seeds data locally, so I exercised doctor dashboard → patient detail → builder → protocol-apply, and patient today → session → player → **camera verify** (real MediaPipe ran: `TensorFlow Lite XNNPACK delegate` logged) → journey/share — **without needing real accounts**.
- **What demo bypass let me skip (and you should still verify live):** real email signup + KVKK consent gate, doctor↔patient share-code linking (cloud-only), Supabase RLS enforcement at runtime, realtime sync, push/email reminders.

**Tested by code audit (could NOT run live):** the sandbox has **no outbound internet from the shell** and **cannot resolve the Supabase Management API / `*.pages.dev`** from the browser. So:
- 🔒 **Could not bypass / must be done by you (live):** apply any DB migration (Management API unreachable from here); verify the live auth config (email-confirmation toggle, region, seeded-account deletion); confirm realtime RLS and push delivery on real devices. These are flagged per-item in §6/§7.
- DB schema, RLS, and the edge function were audited from the version-controlled source (`supabase/schema.sql`, `migrations/`, `functions/`), which memory confirms is what was deployed.

**Verified by screenshot (v2 live build, local server):** design-system compliance on both surfaces.

---

## 3. Compliance scorecard

| Dimension | Score | Notes |
|---|---|---|
| **Security — access control (RLS)** | **85%** | RLS deny-by-default on all 10 tables; security-definer helpers (no recursion); correct doctor→own-patients / patient→own scoping; audit_log; realtime honors RLS; anon key safe; camera frames never uploaded (verified); `esc()` on dynamic HTML. |
| **Security — compliance grade (KVKK)** | **35%** | No data-subject rights (withdraw/export/delete); data residency in Seoul; "verified" integrity hole; email-confirm OFF; seeded test accounts; license unverified. |
| **Data model vs PRD 09** | **45%** | Core entities exist but flat; missing `verify_method`, `consent_record`, `move_signature`/verifiability, programs/assignments/templates/`media`, achievement/share_event, adherence rollups, streak/grace logic. |
| **Architecture vs PRD 08** | **50%** | Real on-device MediaPipe CV ✅; but cloud has no offline queue; **no analytics/event taxonomy at all** (PRD 11 = 0%); exercise library 28 presets (PRD wanted 100+). PWA (not native) — acceptable per your platform call. |
| **Feature / user-story coverage (doc 04, 16 epics)** | **~49%** | See §4 per-epic register. |
| **Design system vs docs 06/07** | **85%** | v2: spruce + marigold + Hanken + Recovery Arc + corporate components ✅. Minor: reduced-motion not fully handled; a11y limited to one big-text toggle. |
| **OVERALL (weighted)** | **≈57%** | Strong skeleton + design; health-grade compliance & cloud data correctness are the deficits. |

---

## 4. Per-epic gap register (acceptance-criteria level)

Legend: ✅ full · ◐ partial · ✗ missing · **[R]** rebuild recommended · **[P]** patch sufficient

| Epic | Status | Key acceptance-criteria gaps (detailed) | Sev | Action |
|---|---|---|---|---|
| **1 Accounts/patient mgmt** | ◐ ~60% | No "clinic" entity/multi-clinician; **cloud `create-patient` creates a ghost local record, never persists** (`app.js:990-997`); doctor license collected but **never verified**; no patient edit/archive/delete. | 🟠 | [P] |
| **2 Library & authoring** | ◐ ~45% | **"Record video" captures nothing** (`app.js:1037-1052`); cloud-recorded exercise loses even the flag (no `video_url`); only 28 presets (PRD: 100+); can't author a true new library entry. | 🟡 | [P]+[R] media |
| **3 Movement sets/templates** | ◐ ~55% | 7 built-in protocols apply ✅; **clinician cannot create/save/share own templates**; protocol `verify` maps to a fixed string, not a movement-check config. | 🟡 | [P] |
| **4 Program assign/schedule/adapt** | ◐ ~55% | Assign+tune ✅; **no day-of-week / rest days / start-end dates / week-progression**; day label hardcoded "Salı" (`app.js:356`); no auto-progression. | 🟠 | [R] scheduling |
| **5 Onboarding/connection** | ◐ ~50% | Share-code link is **cloud-only**; **no "connect later" UI** despite the promise (`app.js:117`); demo lacks the whole invite feature. | 🟠 | [P] |
| **6 Daily loop** | ✅ ~85% | Solid. Gaps: **no loading/error/empty states** (throws if `patients[0]` undefined); "~10 dk"/day hardcoded. | 🟢 | [P] |
| **7 Camera verification** | ◐ ~70% | Real CV ✅. **"Verify once per move/day" NOT enforced**; **`sim-verify` writes `verified:true` with no camera** (`app.js:1137`); no calibration-timeout/abort UX; weak permission-denied recovery. | 🔴 | [P] integrity |
| **8 Adherence & analytics** | ◐ ~30% | **Cloud hardcodes `adherence:0`, `history:[0…]`** (`app.js:1223-1224`) → charts non-functional in prod; demo numbers static (never recomputed from sessions); trend chart uses `patients[0]` for the doctor. **No VWAR.** | 🔴 | [R] compute |
| **9 Re-engagement** | ✗ ~15% | **No patient-facing no-shame welcome-back** at all; only clinician auto-follow-up *config* with no runtime engine. | 🟡 | [R] |
| **10 Gamification** | ◐ ~35% | Points update ✅; **streak never incremented, badges never unlock, journeyStage never advances** (all static seed); weekly-goal bar reads 0% in demo; **no merciful/grace streak** (PRD requirement). | 🟡 | [P] logic |
| **11 Sharing** | ✅ ~65% | Card works ✅; **shared stats fabricated** (`days=week*7`, `moves=week*12`, `app.js:448/844`) — not from real activity. Condition correctly omitted ✅. | 🟡 | [P] |
| **12 Messaging/feedback** | ◐ ~50% | Feedback + 0-10 pain + doctor note ✅; **no real two-way messaging** ("yakında" stub `app.js:1072`); **no explicit too-easy/too-hard**; doctor note is a single overwrite, not a thread. | 🟡 | [P] |
| **13 Offline & sync** | ◐ ~35% | Demo offline ✅; **cloud has NO offline queue/reconciliation; completions dropped silently offline** (`app.js:757`); no IndexedDB/outbox. Violates FR-32. | 🟠 | [R] |
| **14 Privacy/KVKK** | ◐ ~45% | Consent gate at signup ✅; on-device camera + privacy copy true ✅; **NO consent withdrawal / export / deletion**; only demo "reset"; no granular/re-consent. | 🔴 | [R] rights |
| **15 Notifications** | ◐ ~45% | Settings persist ✅; **no client-side reminder scheduling** (only one test notification); quiet-hours display-only; push needs VAPID+backend (effectively off); SMS/email unwired. | 🟡 | [P]+infra |
| **16 Settings/a11y** | ◐ ~40% | Big-text toggle ✅ + ARIA roles; **no reduced-motion, no contrast/scale steps, no language toggle**; thin profile (no email/password change). | 🟡 | [P] |

---

## 5. Security & KVKK deep-dive (health-grade)

**What's genuinely strong (do not rebuild):**
- **RLS is the real backbone.** Every table `enable row level security` + deny-by-default; `is_patient_of_me()` / `my_doctor_id()` are `security definer … stable` with pinned `search_path` (no recursion, no injection). Policies correctly restrict doctor→own patients and patient→own rows (`schema.sql:158-245`).
- **Secrets hygiene:** client ships only the anon/publishable key (`config.js`); service-role lives only in the Edge Function env (`send-reminders/index.ts:17`). Repo secret scan = clean.
- **Camera data:** frames are processed in-page and **never uploaded** (no `MediaRecorder`/blob POST in the verify path); only a boolean result is logged. Privacy claim matches code.

**What must be fixed for health-grade compliance:**
1. **Data-subject rights (KVKK Arts. 11/7):** implement consent **withdrawal**, data **export**, and account+data **deletion**. Today: none. → new `consent_record` table + profile actions + an erasure path.
2. **Data residency:** recreate/move the Supabase project to **EU (Frankfurt)** or a TR-resident host; document the transfer basis. Seoul is non-compliant for TR health data.
3. **"Verified" integrity:** `verified` must mean *camera-attested*. Split into `verify_method ∈ {camera,manual,none}` so a clinician can trust the signal; keep the manual fallback but **label it honestly** (not `verified:true`).
4. **Auth hardening:** turn email confirmation **ON** (+ SMTP), **delete the seeded `login.doc`/`login.pat` accounts**, add a doctor-license verification step (even manual review), rotate all secrets pasted in chat.
5. **Reliability/integrity:** stop swallowing cloud-write failures silently (`.catch(()=>{})`) — surface errors and queue for retry (ties to offline reconciliation).

---

## 6. Data-model migration plan (additive, **backward-compatible with v1**)

> ⚠️ v1 and v2 **share the same Supabase project** (`nvqtfikmfrvwgedqluav`). All DB changes must be **additive** (new columns/tables with defaults) so v1 keeps working. No destructive restructure on the shared DB. A future full split (separate prod DB per version) is recommended before any breaking change.
> 🔒 **I cannot apply these from the sandbox** (Management API unreachable). I will WRITE the idempotent SQL; **you apply it** via the Supabase Management API/SQL editor.

Planned additive migration (`supabase/migrations/2026-06-26-v2-compliance.sql`):
- `completions.verify_method text default 'none'` (`'camera'|'manual'|'none'`) + backfill from `verified`.
- `completions.day date` (generated/derived) + a uniqueness path to enforce **one verified completion per (exercise, day)**.
- `gamification`: add `best_streak int`, `grace_tokens int default 2`, `last_active date`.
- New `consent_record` (id, patient_id, type, version, granted, granted_at, withdrawn_at) — withdrawable, audited.
- `exercises`: add `verifiability text default 'camera'` (`'camera'|'manual_only'`) + `schedule jsonb` (days-of-week) + `start_date`/`review_date`.
- New `program_template` (clinician-owned reusable programs).
- `move_signature` (per-exercise verification config: metric, thresholds) — moves the hardcoded `METRIC_BY_DEMO`/`THRESH` into data.
- Adherence: a `v_adherence` view (or scheduled rollup) computing real % + weekly history from `completions` → fixes the cloud-0 bug at the source.

---

## 7. Prioritized implementation backlog

**P0 — health/security/integrity (do first):**
1. **Fix cloud adherence/analytics** — compute `adherence` + 7-day `history` + trend from real `completions` (code: `buildPatient`/`buildCloudState` `app.js:1213-1256`); add VWAR. *(Claude: code ✅ — and a `v_adherence` view you apply.)*
2. **"Verified" integrity** — add `verify_method`; make `sim-verify`/`complete-noverify` record `manual`/`none` (honest); enforce **verify-once-per-move-per-day**. *(Claude: code ✅ + you apply the column.)*
3. **KVKK rights** — consent withdrawal + data export (JSON) + account/data deletion in profile. *(Claude: code ✅ + `consent_record` table you apply + an erasure RPC.)*
4. **Auth hardening / residency** — *(You: email-confirm ON + SMTP, delete seeded accounts, EU/TR region, rotate secrets. Claude: write the runbook.)*

**P1 — correctness/reliability:**
5. Cloud **offline outbox** (IndexedDB queue + retry; surface write failures). *(Claude: code ✅.)*
6. **Gamification logic** — compute streak (with grace), unlock badges, advance journey from real sessions. *(Claude: code ✅.)*
7. **Real share stats** from activity, not `week*N`. *(Claude: code ✅.)*
8. **Scheduling** — day-of-week + real "today" (drop hardcoded "Salı"); empty/loading/error states on patient screens. *(Claude: code ✅ + `schedule` column.)*

**P2 — completeness:**
9. Patient **re-engagement** welcome-back (no-shame). 10. **Connect-later** doctor-code UI + demo invite parity. 11. Real **video capture** (MediaRecorder→Storage) or honest relabel. 12. **Clinician-saved templates**. 13. Analytics/event taxonomy (PRD 11). 14. a11y depth (reduced-motion, contrast, scale). 15. Library expansion toward 100+.

**Split of labor:** Claude implements all **code** items on the `v2` branch and redeploys to `v2.fizyon.pages.dev`. Items needing the **live DB / auth console / hosting region / secret rotation** are yours — each is called out above and will be delivered as a copy-paste runbook + idempotent SQL.

---

### Next: implement P0 (code) → write the migration SQL + runbook → redeploy v2 → re-test.
