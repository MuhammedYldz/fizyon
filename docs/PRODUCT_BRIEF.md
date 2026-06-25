# Fizyon — Product Brief (source of truth)

> This brief and the per-feature specs in `docs/specs/` are the guide for the rebuild.
> Reference them in every audit, design, and implementation step. Build **web-first**
> (clinician = source of truth), then adapt each screen to mobile as a **first-class**
> target (the patient's primary surface).

## What this app is
A physiotherapy home-exercise-program (HEP) app. A physiotherapist prescribes a custom
program (exercises, sets/reps/hold, frequency-per-day, notes, optional camera proof). The
patient does it at home, optionally **proves each session on-device via camera pose
detection**, and the physiotherapist sees adherence + pain + feedback. Turkish-first.
Business model: B2B (physio pays), patient free.

## The two users (personas + emotional state)

### 1. The Physiotherapist — "Fzt." (clinician)
- **Surface:** WEB / desktop primary; mobile occasionally.
- **Context:** busy, time-poor, juggling many patients between appointments.
- **Emotional state:** pressed, slightly stressed, wants **speed and autonomy** — to
  triage who needs attention in seconds and act without friction.
- **Real goal:** patient **adherence, recovery, and happiness** (not "using the app").
- **Needs:** density, scanability, keyboard efficiency, fewer clicks, trustworthy data.

### 2. The Patient — recovering, often unwell
- **Surface:** MOBILE primary (phone, often one-handed, sometimes tired or in pain).
- **Context:** at home, low energy, possibly anxious about their injury/recovery.
- **Emotional state:** tired, stressed, unwell, low motivation; needs **calm
  reassurance** and an obvious next action — never pressure or clutter.
- **Real goal:** know **exactly what to do now**, do it, feel progress.
- **Needs:** large touch targets (≥44×44px), thumb-reachable primary actions, big
  legible type, one clear action per screen, gentle encouragement.

## Top 3 design priorities (what we optimize for)
1. **Trust & legibility.** Calm, clinical-but-warm, highly readable. WCAG AA contrast,
   16px+ body, generous spacing. No bold/brutalist/maximalist, no loud gradients, no
   alarming reds except true errors. Health software lives or dies on trust.
2. **Two-surface fit.** Physio/web = dense, fast, keyboard-friendly, scannable triage.
   Patient/mobile = calm, simple, one obvious action, thumb-reachable, big targets.
   The same design system scales between them — it is not two separate apps.
3. **Clarity of state & next action.** Every screen makes the answer obvious: for the
   physio "who needs me and why"; for the patient "what do I do now / am I done". Every
   screen has designed default / loading / empty / error / success states.

## Non-negotiable quality bar (applies to every screen)
- WCAG AA contrast; visible keyboard focus; full keyboard + screen-reader support (web).
- Every interactive element has hover / focus / active / disabled / loading feedback.
- Designed empty + error states (never a blank or a raw failure).
- No magic numbers — everything references design tokens (Step 2).
- No broken layouts at any width from 320px → 1440px+.
- Mobile primary actions in the thumb zone; ≥44×44px touch targets.
- Turkish-first copy; plain, active voice; the action's name stays consistent through a flow.

## Current state (baseline to rebuild)
Vanilla-JS SPA (`js/app.js` router + `screens`), Supabase backend (RLS), demo + cloud
modes, Chart.js, Tabler icons. A first design pass exists (Fraunces display + teal/coral)
but the brief treats the whole app as the **rough baseline to audit and rebuild
properly** — consistency, state coverage, ergonomics, and accessibility are not yet at
ship quality. There is **no redesign locked in** and landing-page work is out of scope here.

## Process (this rebuild)
- **Step 0 (this doc + `docs/specs/`):** lean per-feature specs. ← we are here.
- **Step 1:** adversarial audit with real screenshots at 1440×900 (web) and 390×844 (mobile).
- **Step 2:** design system (tokens + components in all states), steered toward **restraint**.
- **Step 3:** implement incrementally — shared primitives first, web then mobile, one screen per change.

## Feature / screen inventory → specs
Auth & onboarding → [`specs/auth-onboarding.md`](specs/auth-onboarding.md)

Doctor (web-primary):
- Patient list & triage → [`specs/doctor-patient-list.md`](specs/doctor-patient-list.md)
- Patient detail → [`specs/doctor-patient-detail.md`](specs/doctor-patient-detail.md)
- Program builder → [`specs/doctor-program-builder.md`](specs/doctor-program-builder.md)
- Analytics → [`specs/doctor-analytics.md`](specs/doctor-analytics.md)
- Notifications & follow-up → [`specs/doctor-notifications.md`](specs/doctor-notifications.md)
- Appointments → [`specs/doctor-appointments.md`](specs/doctor-appointments.md)
- Add patient & profile → [`specs/doctor-add-patient-profile.md`](specs/doctor-add-patient-profile.md)

Patient (mobile-primary):
- Today / home → [`specs/patient-today.md`](specs/patient-today.md)
- Exercise flow (player, camera verify, complete, feedback/pain) → [`specs/patient-exercise-flow.md`](specs/patient-exercise-flow.md)
- Progress (history, journey, achievement) → [`specs/patient-progress.md`](specs/patient-progress.md)
- Appointment booking & profile → [`specs/patient-booking-profile.md`](specs/patient-booking-profile.md)

Cross-cutting (states, auth modes, sync, i18n) → [`specs/system-cross-cutting.md`](specs/system-cross-cutting.md)
