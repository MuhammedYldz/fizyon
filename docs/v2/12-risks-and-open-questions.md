# Fizyon — Risks, Assumptions & Open Questions

> Document 12 of the pre-development package.
> The honest list of what could go wrong, what we're assuming, and what we still need to decide. Severity = likelihood × impact. Owners/dates to be assigned at kickoff.

---

## 1. Risk register

### Technical
| ID | Risk | Sev | Mitigation |
|---|---|---|---|
| RT-1 | **On-device pose isn't reliable enough in real homes** (placement, lighting, body types, occlusion) → false rejects kill trust | 🔴 High | Phase-1 = *movement check* (96–99% in studies), not form judgment; **guided AR placement** (biggest lever); **IMU + manual fallback always present**; thresholds are tunable data; Phase-0 spike validates before commitment ([08](08-technical-architecture.md)) |
| RT-2 | **VisionCamera v4 / Android build instability** (active 2026 issues) | 🟠 Med-High | Phase-0 spike on real Android; pin known-good versions; have `react-native-fast-tflite` as alternate path |
| RT-3 | **Offline sync conflicts / data loss** over long recoveries | 🟠 Med | Append-only logs keyed `(assignment,date)`; idempotent upserts; clinician-authoritative program ([09](09-data-model.md)) |
| RT-4 | **Battery/thermal** from continuous inference | 🟡 Low-Med | Inference only during the exercise window, not continuous |
| RT-5 | **Low-end Android floor** too high → excludes part of the market | 🟠 Med | Set min spec from spike (OQ-7); IMU/manual fallback for under-spec devices; never hard-block |

### Regulatory / privacy
| ID | Risk | Sev | Mitigation |
|---|---|---|---|
| RR-1 | **KVKK misstep** with special-category health data / cross-border transfer | 🔴 High | On-device camera (no video leaves phone); explicit separate consent; **VERBIS** registration; **legal review before launch**; evaluate TR/EU residency ([03](03-competitive-and-market.md), [08](08-technical-architecture.md)) |
| RR-2 | **Medical-device / clinical-claim exposure** if we imply diagnosis | 🟠 Med | Position as adherence/feedback tool, **not** diagnosis; Phase-2 form scoring is "feedback," not clinical measurement; review claims with counsel |
| RR-3 | Storing opt-in Tier-3 review videos increases exposure | 🟡 Low-Med | Opt-in only, explicit consent, separate retention rules, encrypted, deletable |

### Market / business
| ID | Risk | Sev | Mitigation |
|---|---|---|---|
| RM-1 | **Turkish physiotherapists' willingness-to-pay below SaaS norms** | 🔴 High | Validate ARPU with design partners *before* heavy build; freemium solo wedge; TRY pricing; havale/EFT to reduce friction ([03](03-competitive-and-market.md)) |
| RM-2 | **Digitizing alone doesn't move adherence** (stroke RCT: ~2% diff) | 🟠 Med | Win on the *closed loop + relationship + real-time feedback*, not a prettier handout; measure VWAR vs paper baseline ([03](03-competitive-and-market.md), [11](11-metrics-and-analytics.md)) |
| RM-3 | **Well-funded incumbents** (SWORD/Kaia, Hinge, Kemtai) move into TR | 🟡 Low-Med | Local depth (language, KVKK on-device, havale, e-Nabız path, clinic-pays pricing) is hard for US/EU-funded models to copy |
| RM-4 | **Exercise-library depth gap** vs incumbents (thousands of exercises) | 🟠 Med | MVP quality subset + clinician recordings; planned growth path ([10](10-roadmap-and-phasing.md)) |

### Product / UX
| ID | Risk | Sev | Mitigation |
|---|---|---|---|
| RP-1 | **Clinician setup too slow** → falls back to paper | 🔴 High | Treat < 5-min setup as a hard requirement; templates/movement sets; sensible defaults ([04](04-prd.md), [05](05-information-architecture.md)) |
| RP-2 | **Verification feels like surveillance / a test** → patient anxiety | 🟠 Med | Reassurance framing, "stays on your phone," never shame, easy fallback ([06](06-design-direction.md)) |
| RP-3 | **Gamification backfires** (shame, dropout after setback, infantilizing older users) | 🟠 Med | Opt-in, merciful streaks, no leaderboards, subtle (non-cartoon) UI, pain-aware ([03](03-competitive-and-market.md)) |
| RP-4 | **Long-recovery disengagement** (6–12 months is a long time) | 🟠 Med | Progress that visibly accumulates, gentle re-engagement, milestones, the Arc system ([02](02-user-journeys.md), [06](06-design-direction.md)) |

### Execution
| ID | Risk | Sev | Mitigation |
|---|---|---|---|
| RE-1 | **Two surfaces + native ML** is a lot of surface area for a small team | 🟠 Med | Web-first sequencing; shared monorepo; MVP = Phase 1+2 only; specialist mobile/ML hire |
| RE-2 | **Animation production** cost/timeline balloons | 🟠 Med | Decide sourcing in Phase 0; start with subset (OQ-3) |
| RE-3 | **Rebuild scope creep** ("most of it built" but disliked) → endless polishing | 🟡 Low-Med | This package + clear MVP cut line; design system locks the look once |

---

## 2. Key assumptions to validate (cheapest-first)
1. **Clinicians will pay** a TRY price that sustains the business → design-partner pricing interviews **now**. (RM-1)
2. **On-device movement verification is trustworthy** on target devices → Phase-0 spike. (RT-1)
3. **Once/move/day verification is the right adherence unit** → test with real patients; it's a config, not a foundation. (OQ-1)
4. **The closed loop beats paper on adherence** → measure VWAR vs baseline in Phase 2. (RM-2)
5. **Patients accept the camera** as reassurance, not surveillance → usability testing. (RP-2)

---

## 3. Consolidated open questions (carried from [04](04-prd.md))
- **OQ-1:** Default verification cadence — once/move/day confirmed; ever per-session/per-set for some exercise types?
- **OQ-2:** Which exercises are reliably camera-verifiable (Phase 1) vs `manual_only` (floor/fine-motor)? Needs a verifiability tagging pass.
- **OQ-3:** 100+ animation sourcing — license vs commission vs generate? (Cost/timeline driver; decide Phase 0.)
- **OQ-4:** Pricing model (per-seat vs per-active-patient) and free-tier patient cap.
- **OQ-5:** How much patient self-adjustment to allow by default (safety vs autonomy).
- **OQ-6:** Clinician consent model for name-on-shared-cards.
- **OQ-7:** Minimum supported device spec for on-device pose (sets low-end Android floor).
- **OQ-8 (new):** Data residency — EU (Frankfurt) with consent + safeguards, or pursue TR residency? (Legal-led.)
- **OQ-9 (new):** Is e-Nabız integration worth pursuing, and when? (Credibility moat vs Ministry-partnership complexity.)
- **OQ-10 (new):** Single clinician↔patient binding in v1 — when do multi-therapist clinics / patient transfer become required?

---

## 4. "Stop and rethink" triggers
Pull the andon cord if any of these hit:
- Phase-0 spike shows movement verification < trustworthy on target devices **and** IMU fallback can't carry it → rethink the camera promise (maybe Tier-3 async review becomes primary).
- Design partners won't pay a viable TRY price → rethink model (B2C? payer? employer?) before building more.
- KVKK counsel flags the architecture → fix before any real patient data.

---

### Back to the top
- Start: [00-vision-and-strategy.md](00-vision-and-strategy.md) · Index: [README.md](README.md)
