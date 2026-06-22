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

## Cross-cutting
- ☐ 3-tap navigation audit
- ☐ Accessibility pass (contrast, tap targets, reduced-motion)
- ☐ PWA install (manifest + service worker) — "downloadable"
- ☐ Security notes honored in demo (local-only, role isolation)

## Test log
- 2026-06-21 (Playwright, 430×880): welcome, login (both roles), doctor patient list,
  patient detail + chart (fixed canvas sizing), register flow + inline validation +
  doctor-license reveal, patient "Bugün" home. 0 console errors. All passing.
- 2026-06-22 (Playwright): program builder + preset library + config sheet (verify toggle,
  persisted to localStorage), polished pill bottom-nav, exercise player + animated gray-body
  demo + timer, camera verify (no-camera fallback + sim-verify → marks done, awards points,
  syncs), gamification journey, doctor analytics (2 charts). Fixed: textarea font-family
  inherit, SW network-first to avoid stale cache. 0 console errors. Screenshots in tests/.
