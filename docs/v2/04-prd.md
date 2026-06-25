# PRD: Fizyon — Physiotherapy Home-Recovery Platform

> Document 04 — the core requirements. Read [00-vision-and-strategy.md](00-vision-and-strategy.md), [01-personas-and-jtbd.md](01-personas-and-jtbd.md), and [02-user-journeys.md](02-user-journeys.md) first for context.
> This PRD covers the **full product rebuild**. It is organized as **epics → user stories → acceptance criteria**, followed by a consolidated **numbered functional-requirements** list. Implementation phasing (what's MVP vs later) is in [10-roadmap-and-phasing.md](10-roadmap-and-phasing.md).

---

## 1. Introduction / Overview

Fizyon connects a **physiotherapist** (web/desktop, source of truth) with their **patients** (native mobile) across a 6–12 month recovery. The physiotherapist assigns and adapts a home-exercise program; the patient performs it at home and the phone's camera **verifies on-device, offline** that each assigned move was actually done — once per move, per day. Both sides see adherence and recovery accumulate over time. An opt-in gamification mode ("Oyunlaştır") and shareable progress support motivation.

The problem (adherence gap), the personas, and the journeys are detailed in docs 00–02. This document specifies *what the system must do*.

## 2. Goals

- **G1.** A physiotherapist can set up a new patient's full program in **under 5 minutes**.
- **G2.** A patient can see today's program at a glance and complete + verify it with **~1 minute of app friction** beyond the exercise itself.
- **G3.** Each assigned move is **verifiable once per day**, on-device and offline, with a reliable **manual fallback** so verification never blocks or shames.
- **G4.** Both sides can see **adherence and progress** over days/weeks/months across a long recovery.
- **G5.** The clinician can **adapt** any patient's program quickly (counts, swaps, custom recorded exercises) in response to feedback.
- **G6.** The product ships **100+ built-in exercises** with animations, grouped into reusable **movement sets / templates**.
- **G7.** Gamification is a **gentle, opt-in layer** that never alters the core loop or shames the patient.
- **G8.** Patients can **share milestones** (stats + clinician name) under their own control.
- **G9.** The product is **Turkish-first** and **KVKK-compliant**, with **on-device** handling of camera data.

## 3. User Stories (by epic)

> Acceptance criteria are written to be **verifiable**. For **web (clinician)** UI stories, "Verify in browser" = check rendered behavior in a desktop browser. For **mobile (patient)** UI stories, "Verify on device/simulator" = check on an actual device or emulator. Every story also implies typecheck/lint pass.

### EPIC 1 — Clinician accounts, clinic & patient management (web)

#### US-101: Physiotherapist sign-up & clinic profile
**Description:** As a physiotherapist, I want to create an account and clinic profile so I can start managing patients.
**Acceptance Criteria:**
- [ ] Sign-up with email + password (and/or phone), Turkish UI.
- [ ] Capture clinic name, therapist name, specialty; all but name/credentials optional at start.
- [ ] No payment required to reach the dashboard (free tier).
- [ ] Lands on dashboard with an empty-state CTA "Add your first patient" and a sample patient.
- [ ] Verify in browser.

#### US-102: Add a patient
**Description:** As a physiotherapist, I want to add a patient with minimal fields so setup is fast.
**Acceptance Criteria:**
- [ ] Required: patient name + an invite contact (phone/email). Optional: condition/area, recovery start date, notes.
- [ ] Patient is created in a "invited / not yet joined" state until they accept.
- [ ] Creating a patient takes ≤ 1 minute and ≤ 1 screen.
- [ ] Verify in browser.

#### US-103: Patient list triaged by attention
**Description:** As a physiotherapist, I want my patient list sorted by who needs attention so I can triage fast.
**Acceptance Criteria:**
- [ ] List shows, per patient: name, condition, this-week adherence signal, last-activity, unread feedback/pain flag.
- [ ] Default sort surfaces slipping/at-risk patients first (not alphabetical).
- [ ] Filter by status (on-track / slipping / inactive / new feedback).
- [ ] Verify in browser.

### EPIC 2 — Exercise library & authoring (web; recording = capture only)

#### US-201: Browse built-in exercise library
**Description:** As a physiotherapist, I want a library of 100+ exercises with animations so I can assign without creating content.
**Acceptance Criteria:**
- [ ] ≥ 100 built-in exercises, each with: name (TR), body area/category, animation/demo, default sets/reps, description/cues.
- [ ] Search and filter by body area, condition, equipment, difficulty.
- [ ] Verify in browser.

#### US-202: Record a custom exercise demo (no AI)
**Description:** As a physiotherapist, I want to record my own demo video for an exercise so the patient sees exactly what I mean.
**Acceptance Criteria:**
- [ ] Record/upload a video for a new or existing exercise (webcam or phone). **No verification AI involved — capture only.**
- [ ] Trim and set a thumbnail/preview.
- [ ] Set default sets, reps/occurrences, tempo, and text cues.
- [ ] Save as a personal exercise that appears alongside built-ins.
- [ ] Verify in browser (and on mobile that the video plays).

#### US-203: Edit exercise parameters
**Description:** As a physiotherapist, I want to set sets/reps/occurrences/tempo per exercise so the dosage is right.
**Acceptance Criteria:**
- [ ] Editable: sets, reps or hold-duration, occurrences/day, days of week, tempo, rest, notes.
- [ ] Defaults pre-filled from the exercise; all editable per assignment.
- [ ] Verify in browser.

### EPIC 3 — Movement sets / program templates

#### US-301: Use a built-in movement set
**Description:** As a physiotherapist, I want curated movement sets (e.g. "Shoulder Rehab — Phase 1") so I can assign a coherent program in one action.
**Acceptance Criteria:**
- [ ] Built-in sets group multiple exercises with sensible default dosing and ordering.
- [ ] Assigning a set adds all its exercises to a patient's program in one action, still individually editable.
- [ ] Verify in browser.

#### US-302: Save a program as a reusable template
**Description:** As a physiotherapist, I want to save a program I built as my own template so I don't rebuild it each time.
**Acceptance Criteria:**
- [ ] Save current program as a named personal template.
- [ ] Apply a personal template to any patient; edits to the patient's copy don't change the template.
- [ ] Verify in browser.

### EPIC 4 — Program assignment, scheduling & adaptation

#### US-401: Assign a program to a patient
**Description:** As a physiotherapist, I want to assign a scheduled program to a patient so they know what to do which days.
**Acceptance Criteria:**
- [ ] Program = ordered list of exercises, each with sets/reps/occurrences and a weekly schedule (which days).
- [ ] Set program start date and (optional) review/end date over a multi-month horizon.
- [ ] On save, the program syncs to the patient app.
- [ ] Full new-patient setup (US-102→US-401) achievable in **< 5 minutes** (timed acceptance).
- [ ] Verify in browser.

#### US-402: Adapt a program from patient feedback
**Description:** As a physiotherapist, I want to adjust an exercise when a patient reports pain/too-easy/too-hard so the plan stays correct.
**Acceptance Criteria:**
- [ ] Patient feedback (pain / too easy / too hard / comment) is visible on the patient and on the specific exercise.
- [ ] I can swap an exercise, change counts, or pause it in ≤ 2 actions.
- [ ] Change syncs to the patient and is logged in history.
- [ ] Verify in browser.

#### US-403: Patient or clinician adapts when allowed
**Description:** As a patient, within limits my physiotherapist sets, I want to adjust an exercise that's too hard so I can keep going safely.
**Acceptance Criteria:**
- [ ] Clinician controls whether/which adjustments a patient may self-make (e.g. reduce reps within a band, mark "couldn't do").
- [ ] Patient-side changes are surfaced to the clinician.
- [ ] Verify on device.

### EPIC 5 — Patient onboarding & connection to clinician

#### US-501: Join via clinician invite
**Description:** As a patient, I want to tap my therapist's invite and be connected automatically so I don't configure anything.
**Acceptance Criteria:**
- [ ] Invite link/SMS installs app and binds patient to the inviting clinician's account.
- [ ] Plain-Turkish consent + KVKK notice shown and recorded before any data/camera use. 🔒
- [ ] Patient reaches day-1 program within minutes.
- [ ] Verify on device.

#### US-502: One-time camera & privacy primer
**Description:** As a patient, I want to understand the camera is for confirming my form and stays on my phone, so I trust it.
**Acceptance Criteria:**
- [ ] Explains: occasional on-camera move check; runs on-device; no video is sent or stored; can use manual fallback.
- [ ] Explicit camera permission requested in context, not silently.
- [ ] Verify on device.

### EPIC 6 — Patient daily program & core loop

#### US-601: See today's program only
**Description:** As a patient, I want to open the app and see just today's exercises so I'm not overwhelmed.
**Acceptance Criteria:**
- [ ] Home shows today's moves, counts, and completion state — one glance, no required navigation.
- [ ] One clear primary action ("Start"/"Bugüne başla").
- [ ] Large targets, high contrast, works one-handed and offline.
- [ ] Verify on device.

#### US-602: Do an exercise with demo
**Description:** As a patient, I want to watch the demo then do the move so I do it correctly.
**Acceptance Criteria:**
- [ ] Plays clinician's demo or built-in animation; replayable; shows counts and cues.
- [ ] Clear set-by-set progression with big "done" controls.
- [ ] Verify on device.

#### US-603: Complete the day
**Description:** As a patient, I want a warm confirmation when I finish so I feel progress.
**Acceptance Criteria:**
- [ ] Day-complete state with encouraging, non-clinical copy and a small progress nudge.
- [ ] No shame language anywhere in the default experience.
- [ ] Verify on device.

### EPIC 7 — On-device camera verification (PHASED — see [08](08-technical-architecture.md))

#### US-701: Verify a move once per day (Phase 1 — movement check)
**Description:** As a patient, I want to show one move on camera and get confirmation I did it, so I know I'm doing it right.
**Acceptance Criteria:**
- [ ] For each assigned move, the app verifies **one occurrence per day** via on-device pose/motion detection; remaining sets are self-marked.
- [ ] Verification runs **fully offline, on-device**; no frames leave the phone. 🔒
- [ ] Success state is warm and instant ("Doğru! ✓"); detection is per assigned move, evaluated each day it's scheduled.
- [ ] A move already verified today is not re-demanded the same day.
- [ ] Verify on device.

#### US-702: Manual fallback when detection fails
**Description:** As a patient, I want to confirm manually if the camera doesn't detect me, so I'm never blocked.
**Acceptance Criteria:**
- [ ] After N failed/again attempts (configurable), offer "I did this" manual confirm + brief positioning help.
- [ ] Failure copy is encouraging ("Tekrar deneyelim"), never "failed."
- [ ] Manual-confirmed moves are distinguishable from camera-verified in clinician data (honest reporting).
- [ ] Verify on device.

#### US-703: Form scoring (Phase 2 — later)
**Description:** As a patient, I want feedback on my form quality (angles/range/tempo) so I improve.
**Acceptance Criteria:**
- [ ] Per-rep or per-occurrence form feedback for supported exercises (range of motion / key angle / tempo).
- [ ] Gracefully degrades to Phase-1 movement check when an exercise/device isn't supported.
- [ ] Verify on device. *(Deferred to Phase 2 — see roadmap.)*

### EPIC 8 — Adherence tracking & analytics

#### US-801: Patient progress view
**Description:** As a patient, I want to see my done/missed days and trends so a long recovery feels like progress.
**Acceptance Criteria:**
- [ ] Calendar heatmap (day/week/month), current and best streak (with mercy rule), exercises mastered, % through program.
- [ ] Works offline from local data; reconciles on sync.
- [ ] Verify on device.

#### US-802: Clinician adherence dashboard
**Description:** As a physiotherapist, I want per-patient and cross-patient adherence so I can monitor recovery.
**Acceptance Criteria:**
- [ ] Per patient: calendar heatmap, per-exercise verification history, verified vs manual vs missed, trend over weeks/months.
- [ ] Cross-patient: who's slipping, aggregate adherence, since-last-visit summary.
- [ ] Verify in browser.

### EPIC 9 — Re-engagement (no shame)

#### US-901: Gentle return after missed days
**Description:** As a patient, I want to be welcomed back after a gap so guilt doesn't make me quit.
**Acceptance Criteria:**
- [ ] After missed day(s), next open shows warm welcome + optional lightened day; no punitive/red "streak broken" in default mode.
- [ ] Optional reminders are gentle, configurable, and never guilt-based.
- [ ] Verify on device.

### EPIC 10 — Gamification "Oyunlaştır" (opt-in)

#### US-1001: Toggle Oyunlaştır
**Description:** As a (younger) patient, I want to turn on a game layer so recovery feels motivating.
**Acceptance Criteria:**
- [ ] Settings toggle enables points, goals, levels, rewards/"gifts," and merciful streaks layered on the same core loop.
- [ ] Turning it off cleanly returns to the calm default experience.
- [ ] No dark patterns, no pay-to-win, no shame mechanics, no trivializing of recovery.
- [ ] Verify on device.

### EPIC 11 — Social sharing

#### US-1101: Share a milestone
**Description:** As a patient, I want to share a milestone with my stats and my therapist's name so my recovery feels like an achievement.
**Acceptance Criteria:**
- [ ] Generates a clean share card: chosen stats (e.g. days, adherence %, area) + clinician/clinic name (with clinician consent setting).
- [ ] Sharing is opt-in, user-initiated, with control over what's included; nothing auto-posts. 🔒
- [ ] Verify on device.

### EPIC 12 — Messaging / feedback

#### US-1201: Patient reports feedback on an exercise
**Description:** As a patient, I want to flag pain/too-easy/too-hard so my therapist can adapt.
**Acceptance Criteria:**
- [ ] One-tap feedback per exercise (pain / too easy / too hard / note), works offline, syncs up.
- [ ] Surfaces on clinician side against the patient and exercise (links to US-402).
- [ ] Verify on device.

### EPIC 13 — Offline & sync (patient)

#### US-1301: Full offline daily loop
**Description:** As a patient, I want the daily loop to work with no connection so a bad signal never stops my recovery.
**Acceptance Criteria:**
- [ ] View program, play cached demos, run camera verification, mark sets, record feedback — all offline.
- [ ] Local-first store reconciles with server on reconnect; conflicts resolved predictably (see [09-data-model.md](09-data-model.md)).
- [ ] Verify on device (airplane mode).

### EPIC 14 — Privacy, consent & KVKK

#### US-1401: Consent & data transparency
**Description:** As a patient, I want clear control and transparency over my data so I trust the app. 🔒
**Acceptance Criteria:**
- [ ] KVKK-compliant consent at onboarding; viewable/withdrawable later.
- [ ] Camera frames are processed on-device and never transmitted or stored as video; only derived results (done/verified) are stored.
- [ ] Data export/delete request path exists.
- [ ] Verify on device + review against [12](12-risks-and-open-questions.md) compliance notes.

### EPIC 15 — Notifications & reminders

#### US-1501: Gentle reminders
**Description:** As a patient, I want optional, kind reminders so I remember without being nagged.
**Acceptance Criteria:**
- [ ] Configurable time(s); warm tone; easy to snooze/disable; respect quiet hours.
- [ ] Verify on device.

### EPIC 16 — Settings & accessibility

#### US-1601: Accessibility baseline
**Description:** As a tired/older/one-handed patient, I want large, high-contrast, scalable UI so I can use the app in my real state.
**Acceptance Criteria:**
- [ ] Meets the accessibility baseline in [01](01-personas-and-jtbd.md) (targets ≥44–48px, contrast, OS text scaling, one primary action).
- [ ] Audited against [web-design-guidelines] (web) and platform a11y (mobile).
- [ ] Verify on device + browser.

## 4. Functional Requirements (numbered, consolidated)

**Accounts & roles**
- FR-1: System supports two account roles — **Clinician** and **Patient** — with distinct apps (web clinician, mobile patient).
- FR-2: Clinician can create/manage many patients; a patient is bound to exactly one clinician account (transferable later).
- FR-3: Patients join only via clinician invite; no open patient self-signup in v1.

**Exercise library & authoring**
- FR-4: Ship ≥ 100 built-in exercises, each with TR name, category/body-area, animation/demo, default dosing, and cues.
- FR-5: Clinician can record/upload a custom demo video (capture only, no AI), trim it, and set parameters.
- FR-6: Exercise parameters include sets, reps or hold-duration, occurrences/day, days-of-week, tempo, rest, notes.
- FR-7: Custom exercises coexist with built-ins in search/filter.

**Movement sets & templates**
- FR-8: Provide built-in **movement sets** (curated multi-exercise programs) assignable in one action.
- FR-9: Clinician can save any program as a reusable personal **template**; patient copies are independent of the template.

**Assignment, scheduling & adaptation**
- FR-10: A patient program is an ordered, scheduled set of exercises over a multi-month horizon with start/review dates.
- FR-11: Assigning/editing a program syncs to the patient app.
- FR-12: Clinician can swap/adjust/pause exercises in ≤ 2 actions; all changes are logged with timestamp.
- FR-13: Clinician can grant bounded self-adjustment rights to patients; patient changes surface to clinician.

**Patient daily loop**
- FR-14: Patient home shows **today's program only** with one primary action.
- FR-15: Each exercise shows demo, counts, cues, and set-by-set completion controls.
- FR-16: Day-complete and per-move success states use warm, non-clinical, non-shaming copy.

**Camera verification (phased)**
- FR-17: For each assigned move, the system verifies **exactly one occurrence per scheduled day** via **on-device, offline** pose/motion detection (Phase 1 = movement/presence check).
- FR-18: A move verified today is not re-demanded that day; remaining sets are self-marked.
- FR-19: Camera frames are processed on-device only; **no frames/video are transmitted or persisted**; only derived results are stored. 🔒
- FR-20: After a configurable number of failed attempts, a **manual-confirm fallback** is offered; failures use encouraging copy.
- FR-21: System records whether a move was **camera-verified** vs **manually confirmed** vs **missed**, and exposes this honestly to the clinician.
- FR-22: Phase 2 adds form scoring (range/angle/tempo) for supported exercises, degrading gracefully to Phase 1.

**Adherence & analytics**
- FR-23: Patient sees calendar heatmap, streaks (with mercy rule), mastery, and % program completion; works offline.
- FR-24: Clinician sees per-patient adherence (heatmap, per-exercise history, verified/manual/missed, trends) and cross-patient triage.
- FR-25: Define **Verified Weekly Adherence Rate (VWAR)** as the canonical adherence metric (see [11](11-metrics-and-analytics.md)).

**Re-engagement & notifications**
- FR-26: After missed days, default experience welcomes the patient back without punitive states; offers an optional lightened day.
- FR-27: Reminders are optional, gentle, configurable, and respect quiet hours.

**Gamification (opt-in)**
- FR-28: "Oyunlaştır" is an opt-in layer adding points, goals, levels, rewards, and merciful streaks **without changing the core loop**.
- FR-29: No dark patterns, pay-to-win, shaming, or trivialization; cleanly reversible.

**Sharing**
- FR-30: Patient can generate and share a milestone card with selected stats + clinician/clinic name; opt-in, user-initiated, never automatic. 🔒

**Feedback / messaging**
- FR-31: Patient can submit per-exercise feedback (pain/too easy/too hard/note) offline; it syncs and surfaces to the clinician.

**Offline & sync**
- FR-32: The entire patient daily loop works offline; a local-first store reconciles on reconnect with defined conflict resolution.

**Privacy / KVKK**
- FR-33: KVKK-compliant consent captured at onboarding, viewable and withdrawable; data export/delete path provided.
- FR-34: Sensitive health data handled per [12](12-risks-and-open-questions.md); camera data never leaves device.

**Localization & accessibility**
- FR-35: Turkish-first UI and content; architecture supports future locales (i18n from day one).
- FR-36: Meet the accessibility baseline (targets, contrast, text scaling, one-primary-action) on both surfaces.

## 5. Non-Goals (explicitly out of scope for the rebuild v1)

- **NG-1:** No appointment booking / scheduling of clinic visits in v1 (deferred).
- **NG-2:** No billing/insurance claims, EHR/HBYS or e-Nabız integration in v1.
- **NG-3:** No open patient self-signup without a clinician; not a consumer fitness app.
- **NG-4:** No real-time video calls / live telerehab sessions in v1.
- **NG-5:** No cloud processing of camera video — ever (architectural non-goal, not just v1).
- **NG-6:** No multi-clinician shared-patient collaboration in v1 (one patient ↔ one clinician).
- **NG-7:** No wearable/IoT sensor integration in v1.
- **NG-8:** Phase-2 form-scoring is **not** in the MVP (see roadmap).
- **NG-9:** No marketplace / patient-acquisition directory in v1.

## 6. Design Considerations

- Two distinct design languages sharing one brand: **efficient/authoritative** (clinician web) and **calm/effortless** (patient mobile). Full art direction in [06-design-direction.md](06-design-direction.md); tokens/components in [07-design-system.md](07-design-system.md).
- Patient flows must pass the "tired, one-handed, low-light, low-end phone" test.
- Verification UI must read as **reassurance**, not surveillance or a test.
- Information architecture and screen inventory in [05-information-architecture.md](05-information-architecture.md).
- Review all UI against [web-design-guidelines] and platform accessibility.

## 7. Technical Considerations

- **Stack:** web clinician app (source of truth) + **native** patient app for camera/offline. Full decision and rationale in [08-technical-architecture.md](08-technical-architecture.md).
- **Camera/pose:** on-device, offline pose estimation; Phase-1 movement check, Phase-2 form scoring; designed-in manual fallback. Feasibility grounded by research (see [03](03-competitive-and-market.md) / [08](08-technical-architecture.md)).
- **Offline-first** patient data with sync/conflict resolution; **data model** in [09-data-model.md](09-data-model.md).
- **Privacy by architecture:** camera data on-device only.
- **Analytics/event taxonomy** in [11-metrics-and-analytics.md](11-metrics-and-analytics.md).

## 8. Success Metrics

- **North star:** Verified Weekly Adherence Rate (VWAR) ↑ vs paper baseline.
- New-patient setup time **< 5 min** (G1); patient daily friction **~1 min** (G2).
- Patient 4-week and 12-week retention; clinician weekly active usage.
- Verification false-reject rate below target; manual-fallback usage within healthy band.
- Milestone share rate. Full tree in [11-metrics-and-analytics.md](11-metrics-and-analytics.md).

## 9. Open Questions

- **OQ-1:** Exact verification cadence default — once/move/day confirmed; is it ever per-session or per-set for specific exercise types?
- **OQ-2:** Which subset of the 100+ exercises is reliably camera-verifiable in Phase 1 (standing, full-body-in-frame moves) vs needs manual fallback (floor/fine-motor)? Needs a verifiability tagging pass.
- **OQ-3:** Source/production of the 100+ animations (license a library vs commission vs generate) — cost & timeline driver. (See roadmap.)
- **OQ-4:** Pricing tiers (per-seat vs per-active-patient) and free-tier patient cap — validate with design partners.
- **OQ-5:** How much self-adjustment to allow patients by default (safety vs autonomy).
- **OQ-6:** Clinician consent model for having their name on shared cards.
- **OQ-7:** Minimum supported device spec for on-device pose (sets the low-end Android floor).

---

### Next
- How it's organized on screen: [05-information-architecture.md](05-information-architecture.md)
- How it should look & feel: [06-design-direction.md](06-design-direction.md)
- How it's built: [08-technical-architecture.md](08-technical-architecture.md)
- When each piece ships: [10-roadmap-and-phasing.md](10-roadmap-and-phasing.md)
