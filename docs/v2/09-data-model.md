# Fizyon — Data Model

> Document 09 of the pre-development package.
> Conceptual model + key fields. Maps to Postgres (Supabase) with Row-Level Security. Implementation should add audit timestamps (`created_at`, `updated_at`) and soft-delete where relevant. Privacy rules in [08-technical-architecture.md](08-technical-architecture.md) §7 are binding here.

---

## 1. Entity-relationship overview

```
Clinic 1──* Clinician 1──* Patient 1──1 Program *──* Exercise
                                  │                      ▲
                                  │                      │ (assignment carries dosing)
                                  │                ExerciseAssignment
                                  │                      │
                                  ├──* DailyLog ─────────┘   (one per assignment per scheduled day)
                                  ├──* Feedback ─────────┘
                                  ├──1 GamificationProfile ──* Achievement
                                  ├──* ConsentRecord
                                  └──* ShareEvent

Exercise *──* MovementSet (curated)        Clinician 1──* ProgramTemplate
Exercise 1──1 MoveSignature (verify rules)
```

Core relationship rules:
- A **Patient** belongs to exactly **one Clinician** in v1 (FR-2; transfer is a future feature).
- A **Program** is the patient's current assigned plan; it is **clinician-authoritative**.
- A **DailyLog** is the atomic adherence record: one per `(assignment, date)`; this is the offline-sync key.
- **Exercises** are either **built-in** (global, `clinic_id = null`) or **custom** (owned by a clinician).

---

## 2. Tables / entities (key fields)

### `clinic`
`id` · `name` · `address?` · `phone?` · `subscription_tier` · `created_at`

### `clinician` (auth user, role=clinician)
`id` · `clinic_id` → clinic · `full_name` · `title/specialty` · `email` · `phone?` · `share_name_consent` (may their name appear on patient share cards) · `created_at`

### `patient` (auth user, role=patient)
`id` · `clinician_id` → clinician · `full_name` · `contact` (phone/email for invite) · `condition/body_area?` · `recovery_start_date?` · `status` (`invited` | `active` | `paused` | `discharged`) · `gamify_enabled` (bool) · `created_at`

### `exercise`
`id` · `clinic_id?` (null = built-in global) · `created_by?` → clinician · `name_tr` · `name_en?` · `body_area` · `category` · `description_tr` · `default_media_id` → media · `default_sets` · `default_reps_or_hold` · `default_occurrences_per_day` · `default_tempo?` · `difficulty` · `equipment?` · **`verifiability`** (`camera` | `manual_only`) · `is_active`

### `move_signature` (Phase-1 verification rules; 1:1 with verifiable exercise)
`exercise_id` → exercise · `signature_joints` (json: `[{joint, min_angle, max_angle}]`) · `min_rom` · `movement_threshold` · `rep_prominence` · `required_orientation` (`front` | `side`) · `notes`
> These thresholds are **data, tunable without an app release** (see [08](08-technical-architecture.md) §2).

### `media` (demo videos & animations)
`id` · `type` (`animation` | `clinician_video`) · `storage_path` · `thumbnail_path` · `duration` · `owner_clinician_id?` · `transcode_status`
> Demo media only. **No patient camera frames/video are ever stored here** (privacy). The only exception is an explicitly opt-in Tier-3 async review clip (separate, consented, see [08](08-technical-architecture.md)).

### `movement_set` (curated/template grouping)
`id` · `clinic_id?` (null = built-in) · `name_tr` (e.g. "Omuz Rehabilitasyon — Faz 1") · `body_area` · `description` · ordered `items` → `movement_set_item(exercise_id, order, default dosing overrides)`

### `program_template` (clinician's saved reusable program)
`id` · `clinician_id` → clinician · `name` · `items` (same shape as a program's assignments)

### `program` (a patient's live plan)
`id` · `patient_id` → patient · `clinician_id` → clinician · `title` · `start_date` · `review_date?` · `status` (`active` | `paused` | `completed`) · `created_from_template_id?` · `updated_at`

### `exercise_assignment` (an exercise inside a program, with dosing)
`id` · `program_id` → program · `exercise_id` → exercise · `media_id?` (overrides default, e.g. clinician's own demo) · `order` · `sets` · `reps_or_hold` · `occurrences_per_day` · **`days_of_week`** (e.g. `[1,3,5]`) · `tempo?` · `notes_tr?` · `patient_self_adjust` (json: what the patient may change, FR-13) · `is_active`

### `daily_log` ⭐ (the adherence atom — offline-sync keyed)
`id` · `patient_id` · `assignment_id` → exercise_assignment · **`date`** · `sets_completed` · `target_sets` · `verified` (bool) · **`verify_method`** (`camera` | `imu` | `manual` | null) · `verified_at?` · `avg_angles?` (json, optional, Phase 2 — **not raw landmark streams**) · `source` (`mobile`) · `synced_at`
> **Uniqueness:** `(assignment_id, date)` — guarantees "verify once per move per day" (FR-17/18) and makes offline sync an idempotent upsert. `verify_method` keeps reporting honest (FR-21).

### `feedback`
`id` · `patient_id` · `assignment_id?` → exercise_assignment · `type` (`pain` | `too_easy` | `too_hard` | `note`) · `text_tr?` · `pain_level?` · `created_at` · `acknowledged_by_clinician_at?`

### `gamification_profile` (only if `gamify_enabled`)
`patient_id` (1:1) · `points` · `level` · `current_streak` · `best_streak` · `grace_tokens` (mercy/streak-freeze, see [03](03-competitive-and-market.md)) · `last_activity_date`

### `achievement`
`id` · `patient_id` · `type` (`days_milestone` | `adherence_milestone` | `program_phase` | …) · `earned_at` · `shareable` (bool)

### `share_event`
`id` · `patient_id` · `achievement_id?` · `included_stats` (json — patient-selected) · `included_clinician_name` (bool, gated by clinician consent) · `created_at`
> Records that a share card was generated; the card content is patient-controlled and opt-in (FR-30).

### `consent_record`
`id` · `patient_id` · `consent_type` (`kvkk_health_data` | `camera` | `share_clinician_name` | …) · `version` · `granted` (bool) · `granted_at` · `withdrawn_at?`
> Separate explicit consents (not bundled into ToS), withdrawable — KVKK requirement (FR-33, [03](03-competitive-and-market.md)).

### `notification_pref`
`patient_id` · `reminders_enabled` · `reminder_times` (json) · `quiet_hours` · `gentle_tone` (always true)

### Derived / materialized (not authored)
- **Adherence rollups** per patient per day/week/month (powers heatmaps + VWAR in [11](11-metrics-and-analytics.md)). Computed from `daily_log`; can be a materialized view or nightly job. **VWAR** = verified-done move-days ÷ assigned move-days for the week.

---

## 3. Row-Level Security (KVKK isolation backbone)
- A **clinician** can read/write only rows where the patient's `clinician_id = auth.uid()` (and their own clinic's custom exercises/templates).
- A **patient** can read/write only their own `program`, `daily_log`, `feedback`, `gamification_profile`, `consent_record`, and read built-in/assigned exercises + media.
- Built-in exercises/movement sets (`clinic_id = null`) are world-readable.
- No cross-clinician or cross-patient access in v1.

## 4. Offline-sync semantics (patient app)
- **Authoritative direction:** `program`, `exercise_assignment`, assigned `media` → **server→device** (clinician owns the plan).
- **Device→server (append-mostly):** `daily_log`, `feedback`, `gamification_profile`, `consent_record`.
- **Conflict resolution:** `daily_log` upsert is idempotent on `(assignment_id, date)`; `feedback` is append-only; profile uses last-write-wins on `last_activity_date`. Program edits from the clinician always win on the plan definition. (See [08](08-technical-architecture.md) §4.)

## 5. What is deliberately NOT stored
- ❌ Raw camera frames or video (processed on-device, discarded). 🔒
- ❌ Raw per-frame landmark streams (edge toward biometric data) — only optional **averaged** angles in Phase 2.
- ❌ Any health data inside analytics events ([11](11-metrics-and-analytics.md)).

---

### Next
- How it's organized on screen: [05-information-architecture.md](05-information-architecture.md)
- How it's built: [08-technical-architecture.md](08-technical-architecture.md)
