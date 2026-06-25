# Fizyon — Metrics & Analytics

> Document 11 of the pre-development package.
> What we measure, why, and how — without ever putting health data in an analytics payload (KVKK, [08](08-technical-architecture.md) §7). Metrics map to the phase gates in [10](10-roadmap-and-phasing.md).

---

## 1. North-star metric

**Verified Weekly Adherence Rate (VWAR)** — across active patients, the share of **assigned move-days** that were **verified done** in a given week.

```
VWAR (week) =  Σ (moves verified done)        ← camera-verified OR manually confirmed
              ─────────────────────────────
               Σ (moves assigned that week)
```

Why this is the right north star: it can only go up if **all three** parts of the thesis are true — a good program (clinician), a motivated patient who shows up, and verification that works. It's the closed loop expressed as one number. (Report camera-verified vs manual as a sub-split — see guardrails.)

---

## 2. Metric tree (what rolls up into VWAR)

```
                          VWAR (north star)
        ┌──────────────────────┼───────────────────────┐
   Patient shows up      Program is right         Verification works
   ───────────────       ───────────────          ─────────────────
   • DAU/WAU (patient)   • setup completion        • verify success rate
   • day-completion %    • adaptation frequency     • false-reject rate (guardrail)
   • 4/12-wk retention   • feedback→adapt latency    • manual-fallback share
   • re-engagement rate  • clinician WAU             • placement-guide success
```

---

## 3. The funnels we watch

**Clinician activation (B2B wedge):**
`sign-up → first patient added → first program assigned → first patient active → returns in week 2 → monitors weekly`
- Key metric: **time-to-first-assigned-program** and **setup time < 5 min** (G1).

**Patient activation & retention (the long arc):**
`invite tapped → joined/consented → day-1 program done → first move verified → 7-day active → 4-week retained → 12-week retained`
- Key metric: **first-week completion** (strongest predictor of long-term adherence) and **12-week retention** (the recovery arc).

**Acquisition loop:** `milestone reached → share card created → share opened by others → new clinician/patient signup attributed`.

---

## 4. Guardrail metrics (must not get worse)
- **Verification false-reject rate** (patient did it but app said no) — the trust-killer. Hard cap; if breached, lean on fallback + threshold tuning ([08](08-technical-architecture.md)).
- **Manual-fallback share** — healthy band; *too high* = camera failing, *too low on manual-only exercises* = mis-tagging.
- **Setup time** (clinician) — must stay < 5 min.
- **Patient-reported frustration** + uninstall-after-failed-verify.
- **Crash/ANR rate on low-end Android**; cold-start and model-load time.
- **No-shame check:** missed-day → next-session-return rate (proves the gentle re-engagement works, not drives churn).

---

## 5. Gamification-specific (Phase 4, opt-in)
- Oyunlaştır opt-in rate; **adherence lift of opted-in vs not** (the only justification to keep it); streak-grace usage; share rate. Watch for **harm**: do opted-in users churn faster after a setback? If yes, soften mechanics ([03](03-competitive-and-market.md)).

---

## 6. Event taxonomy (privacy-safe)

**Naming:** `object_action`, snake_case, past-tense action, consistent objects. **Properties** are small and chart-useful. **Hard rule: NO health data, NO body/condition specifics, NO video, NO raw landmarks, NO free-text in analytics** — only structural/behavioral facts. Patient identifiers are pseudonymous IDs, not names.

| Event | Surface | Key properties (non-health) |
|---|---|---|
| `clinician_signed_up` | web | plan_tier |
| `patient_added` | web | (count only) |
| `program_assigned` | web | exercise_count, from_template (bool), setup_seconds |
| `program_adapted` | web | change_type (`swap`/`dose`/`pause`), trigger (`feedback`/`manual`) |
| `patient_invited` / `patient_joined` | both | — |
| `consent_granted` | mobile | consent_type, version |
| `day_started` / `day_completed` | mobile | moves_total, moves_done |
| `move_verification_attempted` | mobile | method (`camera`/`imu`/`manual`), result (`verified`/`retry`/`fallback`), attempts |
| `move_completed` | mobile | verify_method, sets_done |
| `placement_guide_shown` / `_passed` | mobile | — |
| `feedback_submitted` | mobile | type (`pain`/`too_easy`/`too_hard`/`note`) — **type only, never the text** |
| `reminder_sent` / `_opened` | mobile | — |
| `reengagement_shown` / `returned` | mobile | days_missed_bucket |
| `gamify_toggled` | mobile | enabled (bool) |
| `milestone_earned` / `share_created` | mobile | milestone_type, included_clinician_name (bool) |
| `app_offline_session` | mobile | duration_bucket |
| `verification_perf` | mobile | fps_bucket, model_load_ms_bucket, device_tier |

> `feedback_submitted` carries the **category** (pain/too-easy/etc.) but **never the free-text or pain level** — those are health data and stay out of analytics, in the product DB under RLS only ([09](09-data-model.md)).

---

## 7. Tooling & instrumentation notes
- Use a privacy-respecting analytics pipeline; **strip/deny-list health fields at the SDK boundary**. Pseudonymous IDs only.
- This environment includes a product-tracking skill set and an Amplitude plugin — useful later to formalize the tracking plan and instrument events; not required to start. Keep the taxonomy above as the source of truth.
- Define dashboards per phase gate ([10](10-roadmap-and-phasing.md)): Activation (P1), Closed-loop + VWAR baseline (P2), Retention (P3), Gamification lift + referral (P4).
- Always pair quantitative VWAR with **qualitative design-partner interviews** — small early cohorts make raw numbers noisy ([03](03-competitive-and-market.md)).

---

### Next
- What could go wrong with all of this: [12-risks-and-open-questions.md](12-risks-and-open-questions.md)
- The phases these gate: [10-roadmap-and-phasing.md](10-roadmap-and-phasing.md)
