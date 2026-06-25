# Fizyon — Pre-Development Package

Everything to read **before** writing rebuild code for Fizyon — a Türkiye-first physiotherapy home-recovery platform. The product connects a **physiotherapist (web, source of truth)** with their **patients (native mobile)** across a 6–12 month recovery, using **offline on-device camera verification** to confirm each home exercise was actually done.

This package exists because the app was mostly built but didn't feel right to **look, feel, or act** — so this is a deliberate rebuild grounded in the problem, the people, the market, a distinctive design direction, and a buildable technical plan.

---

## How to use this package
- **New to the project?** Read in order: `00 → 01 → 02 → 03`, then the PRD (`04`).
- **Designing?** `06` (direction) + `07` (system) + `05` (IA).
- **Engineering?** `08` (architecture) + `09` (data model) + `10` (roadmap).
- **Planning/PM?** `04` (PRD) + `10` (roadmap) + `11` (metrics) + `12` (risks).
- Docs cross-link heavily; each ends with a "Next" pointer.

---

## The documents
| # | Doc | What it answers |
|---|---|---|
| 00 | [Vision & Strategy](00-vision-and-strategy.md) | Why this exists, the bet, business model, north star |
| 01 | [Personas & JTBD](01-personas-and-jtbd.md) | Who we serve (clinician + 3 patient archetypes) and their real state |
| 02 | [User Journeys](02-user-journeys.md) | End-to-end flows; the ⭐ core daily verification loop |
| 03 | [Competitive & Market](03-competitive-and-market.md) | Adherence science, competitor teardown, Türkiye/KVKK, our wedge |
| 04 | [**PRD**](04-prd.md) | The requirements: epics → user stories → numbered functional requirements |
| 05 | [Information Architecture](05-information-architecture.md) | Navigation + screen inventory for both surfaces |
| 06 | [Design Direction](06-design-direction.md) | The look/feel fix — the Recovery Arc, color, type, motion, voice |
| 07 | [Design System](07-design-system.md) | Tokens + components + density modes (buildable) |
| 08 | [Technical Architecture](08-technical-architecture.md) | Stack, the on-device pose pipeline (phased), offline, KVKK-by-design |
| 09 | [Data Model](09-data-model.md) | Entities, relationships, RLS, sync semantics |
| 10 | [Roadmap & Phasing](10-roadmap-and-phasing.md) | Sequence, MVP cut, the Phase-0 camera spike, phase gates |
| 11 | [Metrics & Analytics](11-metrics-and-analytics.md) | North-star (VWAR), funnels, privacy-safe event taxonomy |
| 12 | [Risks & Open Questions](12-risks-and-open-questions.md) | Risk register, assumptions to validate, open decisions |

---

## Decisions locked (from kickoff)
- **Web is the source of truth; build it first.** Patient app is **native** (Expo/React Native) for on-device camera + offline.
- **Camera verification is patient-only / mobile-only.** The clinician only **records** demo videos (capture, no AI) and works mainly on **web**.
- **Camera AI is phased:** Phase 1 = on-device offline **movement check** (verify once per move, per day) with a manual fallback; Phase 2 = **form scoring** later.
- **Türkiye-first, B2B (clinic pays), KVKK-by-architecture** (camera frames never leave the phone), local payments (iyzico + havale/EFT).
- **Design rebuilt around one signature — the Recovery Arc** (goniometry/degrees); calm-and-warm, not clinical; gamification is gentle and opt-in.
- Designed **fresh from the spec** (existing build not audited).

## Grounding
- Built with the `prd` and `frontend-design` skills.
- Competitive/adherence science and on-device pose feasibility are grounded in **dedicated web research (June 2026)** — sources cited inline in `03` and `08`. Claims flagged uncertain there are not settled.

---

## Recommended first moves (before real product code)
1. **Run the Phase-0 camera spike** on a real mid/low-end Android + iPhone — this gate decides the product's shape. ([10](10-roadmap-and-phasing.md), [08](08-technical-architecture.md))
2. **Pricing/willingness-to-pay interviews** with design-partner physiotherapists. ([12](12-risks-and-open-questions.md) RM-1)
3. **Lock animation sourcing** + the MVP exercise subset. ([12](12-risks-and-open-questions.md) OQ-3)
4. **KVKK legal review + VERBIS** kickoff. ([08](08-technical-architecture.md) §7)
5. Stand up the **monorepo + design-system tokens** from `07`.

> The open questions in [12](12-risks-and-open-questions.md) §3 are the decisions still genuinely yours to make — they're flagged, not guessed.

*Location note: this package lives under `fizyon-prd/` in the current working directory; move it into the Fizyon repo when convenient.*
