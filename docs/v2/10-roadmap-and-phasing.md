# Fizyon — Roadmap & Phasing

> Document 10 of the pre-development package.
> Phases are sequenced by **capability and dependency**, not fixed dates (set dates once team size is known). The ordering reflects two hard rules: **web is the source of truth (build it first)** and **de-risk the camera bet before betting the company on it**.

---

## Guiding sequencing logic
1. **Prove the risky thing first.** The on-device camera verification is the core differentiator *and* the biggest technical unknown ([08](08-technical-architecture.md)). A throwaway spike comes before real product work.
2. **Web before mobile.** The clinician web app defines all data (patients, exercises, programs). The patient app consumes it. You can't build the consumer before the source of truth.
3. **Value loop before motivation layer.** Get the closed loop (assign → do → verify → monitor) working and trustworthy *before* gamification/sharing. Research says the loop is what drives adherence; gamification is a gentle amplifier ([03](03-competitive-and-market.md)).
4. **Ship to design partners early.** Real Turkish physiotherapists + patients in the loop from Phase 1, because willingness-to-pay and on-device accuracy are open risks ([12](12-risks-and-open-questions.md)).

---

## Phase 0 — Foundations & de-risking (no user-facing product yet)
**Goal: remove the two things that could invalidate the plan.**
- ⚠️ **Camera spike (highest priority):** a throwaway Expo dev-client app on a **real mid/low-end Android + an iPhone** running **MediaPipe BlazePose Lite** via VisionCamera v4. Validate: build stability (known v4/Android issues), FPS, the Phase-1 verification algorithm on 3–4 real exercises, placement-guide impact, battery/thermal. **Exit:** "movement verification is reliable enough to trust, on our target devices" — or trigger the fallback plan (IMU + manual). This gate decides the whole product shape.
- **Animation sourcing decision (OQ-3):** license vs commission vs generate; lock the MVP subset (~20–30 high-frequency exercises). Cost/timeline driver.
- **Stack scaffolding:** Turborepo monorepo, Supabase (EU region) project, design-system tokens/components from [07](07-design-system.md) as a shared package, CI, EAS setup.
- **KVKK groundwork:** consent model, VERBIS registration started, legal review scheduled ([12](12-risks-and-open-questions.md)).

**Exit criteria:** camera gate passed (or fallback chosen), design system in code, monorepo + backend skeleton live.

---

## Phase 1 — Clinician Web MVP (the source of truth)
**Goal: a physiotherapist can set up and (later) monitor patients. Web only.**
- Accounts/clinic onboarding (US-101); add/manage patients (US-102, US-103).
- Exercise library (MVP subset + search/filter) (US-201); record custom demo video (US-202); set parameters (US-203).
- Movement sets / templates (US-301, US-302).
- **Program assignment + scheduling + per-patient adaptation** — the make-or-break < 5-min flow (US-401, US-402).
- Patient invite flow (generates the link the mobile app will consume).
- Adherence dashboard shell (will light up once mobile reports data).

**Exit:** a real physiotherapist sets up a full patient program in **< 5 minutes**, unaided. Design-partner clinicians onboarded.

---

## Phase 2 — Patient Mobile MVP + the closed loop ⭐
**Goal: the core daily loop works, offline, with Phase-1 camera verification. This is the heart.**
- Onboarding via invite + auto-connect + KVKK/camera consent (US-501, US-502).
- **Today screen + exercise flow + demo playback** (US-601, US-602, US-603).
- **Phase-1 on-device camera verification** (movement check, once/move/day) + **placement guide** + **fallback tiers** (IMU → manual) (US-701, US-702).
- **Offline-first** store + sync; media caching (US-1301).
- Patient progress view (heatmap, basic streak) (US-801); clinician dashboard now shows **real verified adherence** (US-802), with honest camera-vs-manual labeling (FR-21).
- Per-exercise feedback → surfaces to clinician → adaptation (US-1201 ↔ US-402).

**Exit:** the full loop is real — assign (web) → do + verify offline (mobile) → monitor + adapt (web). Measure baseline **VWAR** ([11](11-metrics-and-analytics.md)). **This is the first end-to-end usable product.**

---

## Phase 3 — Adherence depth & retention
**Goal: keep patients going across a long, fluctuating recovery.**
- Gentle re-engagement after missed days (US-901); configurable kind reminders + quiet hours (US-1501).
- Richer analytics: weekly/monthly trends, per-exercise history, since-last-visit summaries, cross-patient triage refinements.
- Patient self-adjustment within clinician-set bounds (US-403); "pain today" check-in feeding adaptation.

**Exit:** measurable retention at 4 weeks; VWAR trending above paper baseline.

---

## Phase 4 — Motivation layer: Oyunlaştır + sharing
**Goal: amplify adherence for those it helps — gently, opt-in.**
- "Oyunlaştır" opt-in layer: points, goals, rewards, **merciful** streaks, quiet milestone certificates (US-1001) — reusing the Arc system, no cartoon UI, no leaderboards ([03](03-competitive-and-market.md)).
- Social sharing of milestones (stats + clinician name, opt-in, patient-controlled) (US-1101) → acquisition loop.

**Exit:** opt-in gamification lifts (or at least doesn't harm) adherence in design-partner cohort; shares generate measurable referral.

---

## Phase 5 — Depth, scale & moat
**Goal: widen the lead.**
- **Phase-2 form scoring** (angles/ROM/tempo, rep counting) for supported exercises, degrading gracefully (US-703) — only after Phase-1 trust is proven.
- **Exercise library expansion** toward competitive depth (path from ~30 → hundreds → thousands; [03](03-competitive-and-market.md)).
- Billing/subscription productionization (iyzico + havale/EFT); pricing tiers validated.
- Exploratory: **e-Nabız integration** pathway, multi-therapist clinics, patient transfer between clinicians.

**Exit:** sustainable paying-clinic cohort; differentiated form feedback live.

---

## Critical path & dependencies
```
Phase 0 camera gate ──► (decides camera scope for Phase 2)
Design system (P0) ──► every UI phase
Web data model (P1) ──► Patient app consumes it (P2)
Closed loop trusted (P2) ──► Gamification/sharing meaningful (P4)
Phase-1 verify trusted (P2) ──► Phase-2 form scoring (P5)
KVKK/VERBIS (P0/ongoing) ──► any real patient data (P2+)
```

## MVP definition (the smallest thing worth shipping to real users)
**Phase 1 + Phase 2** = MVP: clinician sets up a patient on web; patient does the program on mobile, verifies movement on-device offline (with fallback); both see real adherence. Everything in Phases 3–5 is post-MVP enhancement.

## Effort/shape notes (relative, not absolute)
- Heaviest builds: **camera/pose pipeline + offline sync** (P2), **program editor** (P1), **animation library** (P0/ongoing).
- Cheapest high-leverage: reminders, re-engagement copy, share card.
- Specialist needs: a mobile/native engineer comfortable with VisionCamera + ML for the camera work; a designer to hold the Arc system; KVKK legal counsel.

## Phase gates tie to metrics
Each phase exit is also a metrics checkpoint in [11-metrics-and-analytics.md](11-metrics-and-analytics.md) (setup time, VWAR baseline, retention, gamification lift). Don't advance a phase on feature-completeness alone — advance on the outcome.

---

### Next
- The metrics behind each gate: [11-metrics-and-analytics.md](11-metrics-and-analytics.md)
- The risks each phase must watch: [12-risks-and-open-questions.md](12-risks-and-open-questions.md)
