# Fizyon — Technical Architecture

> Document 08 of the pre-development package.
> The camera/pose feasibility section is grounded in dedicated research (June 2026); sources linked inline. This is a buildable plan, not a wish list. Phasing is in [10-roadmap-and-phasing.md](10-roadmap-and-phasing.md); the data model is in [09-data-model.md](09-data-model.md).

---

## 1. Stack decision & rationale

The product splits cleanly along the persona/device split from [01](01-personas-and-jtbd.md), and the stack follows it.

| Layer | Choice | Why |
|---|---|---|
| **Clinician app (source of truth)** | **Web — Next.js / React (TypeScript)** | Desktop-first, data-dense dashboards, fast iteration, SEO for marketing pages. This is where reality is defined. |
| **Patient app** | **Native — Expo / React Native, New Architecture** | On-device camera + pose ML needs native frame processors (impossible in a PWA on iOS). Offline-first, push, app-store presence. |
| **Backend / data** | **Supabase (Postgres + Auth + Storage + Realtime)**, EU region (KVKK — see §7) | Relational data fits (patients↔programs↔logs), built-in auth, object storage for demo videos, realtime for clinician dashboards. Matches team familiarity. |
| **Video / asset delivery** | Object storage + **CDN (Cloudflare)** | Demo videos and exercise animations cached to the patient device for offline playback. Consistent with existing Cloudflare setup. |
| **Web hosting** | **Cloudflare Pages** (consistent with current web properties) | Landing-at-root + app-on-subdomain pattern already in use. |
| **Native builds** | **EAS Build + EAS Update** | Builds the custom dev client / production binaries; OTA for JS/asset updates. |
| **Shared code** | TS monorepo (e.g. Turborepo): shared types, validation (zod), domain logic, API client | One source of truth for the data contracts both apps depend on. |

> **Why not all-PWA?** On-device pose estimation requires native camera frame processors and bundled ML models. iOS Safari can't do this reliably. Since camera verification is the product's core differentiator, the patient app must be native. The clinician app has no such constraint, so it stays web (faster, desktop-optimized).

### High-level system diagram

```
        ┌─────────────────────────┐                 ┌──────────────────────────────┐
        │   CLINICIAN — WEB        │                 │     PATIENT — NATIVE MOBILE   │
        │   Next.js / React        │                 │     Expo / React Native       │
        │  • patient mgmt          │                 │  • today's program            │
        │  • exercise authoring    │                 │  • core daily loop            │
        │  • record demo videos    │                 │  • ON-DEVICE pose verify 🔒    │
        │  • adherence dashboards  │                 │  • offline-first local store  │
        └───────────┬─────────────┘                 └───────────────┬──────────────┘
                    │ HTTPS / Realtime                               │ HTTPS / sync queue
                    │                                                │ (offline-first)
                    ▼                                                ▼
        ┌──────────────────────────────────────────────────────────────────────────┐
        │                         BACKEND — Supabase (EU region)                      │
        │  Postgres (RLS) · Auth · Storage (demo videos) · Realtime · Edge Functions  │
        └───────────────────────────────┬────────────────────────────────────────────┘
                                         │ asset delivery
                                         ▼
                              ┌─────────────────────┐
                              │  Cloudflare CDN      │  demo videos + 100+ animations
                              │  (cached on device)  │  → available offline
                              └─────────────────────┘

   🔒 Camera frames NEVER reach the backend. Pose inference is 100% on-device. Only
      derived results (verified=true, timestamp, optional angles) sync to Supabase.
```

---

## 2. On-device camera verification — the core technical bet

**Goal restated:** fully offline, on-device verification that the patient performed each assigned move — **once per move, per day**. Phase 1 = movement/presence check. Phase 2 = form scoring. Camera data never leaves the phone.

### Feasibility verdict (from research)
- Single-camera pose estimation is **reliable enough for movement verification**: a CNN on major-joint subsets hit **99.5%** accuracy classifying low-back exercises and **96.3%** for shoulder ([PMC9824820](https://pmc.ncbi.nlm.nih.gov/articles/PMC9824820/)).
- Form scoring (angles) from one camera has **5–15° RMSE**, *better than* the ~12° threshold of physiotherapist visual assessment for many exercises ([PMC10951609](https://pmc.ncbi.nlm.nih.gov/articles/PMC10951609/)) — **clinically meaningful but not clinical-grade**, so Phase 2 is feedback, not diagnosis.
- Rep counting via joint-angle peak detection: **~7.5% error** ([PMC12749503](https://pmc.ncbi.nlm.nih.gov/articles/PMC12749503/)).

### Recommended Phase 1 stack
- **Model:** **MediaPipe BlazePose Lite** — 33 landmarks (2D+3D), ~3 MB, fully offline, Apache-2.0, ~20–45 FPS on mid-range phones ([Model Card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf)).
- **Integration:** `react-native-vision-camera` v4 + frame processors + worklets, with **either**:
  - `react-native-mediapipe-posedetection` (config plugin bundles the model on `expo prebuild`; ~15 FPS auto-throttle), **or**
  - `react-native-fast-tflite` (more control; drop `.tflite` in assets) for a MoveNet/BlazePose pipeline.
- **Requirements:** **New Architecture (Turbo Modules)**; **custom dev build via EAS — NOT Expo Go**; model bundled as a local asset (no first-run download → truly offline).

> ⚠️ **Build risk flagged by research:** active VisionCamera v4 + Android build issues (Kotlin/resize-plugin) as of early 2026 ([#2786](https://github.com/mrousavy/react-native-vision-camera/issues/2786), [#3652](https://github.com/mrousavy/react-native-vision-camera/issues/3652)). **Spike this on a real Android device before committing the stack** (see roadmap Phase 0).
> ⚠️ **Avoid ML Kit's auto-download** of the pose model on Android — it breaks the offline guarantee. Bundle MediaPipe/TFLite directly.

### Phase 1 verification algorithm (per assigned move, per day)
Don't score form — just confirm the patient was present and performed meaningful, matching motion:

```
Per exercise, define a "move signature": signature joints + expected angle range.
  e.g. Squat → { left_knee: 90–150°, right_knee: 90–150°, left_hip: 70–140° }

On "Start exercise":
  1. Start frame processor (~15 FPS). Run only during the exercise window — NOT continuously.
  2. Per frame: compute joint angles for signature joints
       angle(A,B,C) from three landmarks; use only landmarks with visibility > 0.6
  3. Maintain a rolling angle time-series per signature joint.
  4. VERIFIED when, within a ~60s window, ALL hold:
       a. Presence:  ≥12 of 33 landmarks visible (>0.5) for ≥5s
       b. Movement:  std-dev(angle series) > MOVEMENT_THRESHOLD (~8°)
       c. Range:     max(angle) − min(angle) > MIN_ROM (e.g. 20° knee for squat)
       d. Rep:       ≥1 angle peak with prominence > ~15°  (a rep happened)
  5. On VERIFIED → persist { exercise_id, date, verified:true, method:"camera" }; stop processor.
  6. If <12 landmarks visible >3s → prompt "move closer / step into frame".
```

Per-exercise thresholds and signatures are **data, not code** — tunable without releases. Not every exercise is camera-verifiable in Phase 1 (floor/fine-motor moves) — these are **tagged `manual-only`** and use the fallback directly (see OQ-2 in [04](04-prd.md)).

### Camera-placement guide (single biggest reliability lever)
Research is blunt: accuracy collapses at the wrong distance/angle (0% detection at some setups), and guiding the user fixes it ([JMIR 2026](https://mhealth.jmir.org/2026/1/e82412)). So the app **must**:
- Show a **silhouette/AR overlay**; patient steps into it before verification starts.
- Guide phone propped at **~180–200 cm**, camera ~hip height, patient facing it.
- Per-exercise orientation hints (some moves need a side view).

### Fallback tiers (verification NEVER blocks recovery — designed-in)
1. **Tier 1 — motion energy via device IMU** (accelerometer/gyro): detect repetitive motion at the exercise tempo, no camera/model needed; works in poor light. Lower confidence.
2. **Tier 2 — manual confirm**: "I did this" always available after N failed attempts. Logged as `method:"manual"` — **honestly distinguished** from camera-verified in clinician data (FR-21).
3. **Tier 3 — opt-in async video review**: patient records a short clip for the clinician to review later. **Opt-in only** (this is the one case video is stored — with explicit consent).

### Phase 2 (later) — form scoring
- Upgrade to **BlazePose Full** (~6 MB) for better arm/spine angle precision.
- **Rep counting:** angle-peak detection (prominence threshold).
- **Form scoring:** record a clinician "gold-standard" rep → **DTW** (dynamic time warping) similarity 0–100 between patient trajectory and reference; flag frames deviating >15° for >0.5s with a specific cue.
- **Optional iOS fast path:** a Swift native module using Apple Vision `VNDetectHumanBodyPoseRequest` (19 joints, Neural Engine, ~60 FPS, zero model size) — iOS-only enhancement, not a replacement.

---

## 3. Performance & device constraints
- **Don't run inference continuously.** Run pose only during the active exercise window (30–90s), stop between sets → ~80% less thermal load (research). Battery ≈ 5–8% per 10-min session (estimate — **validate**).
- **Minimum device (practical):** Android ≈ Snapdragon 660-class (2018+), API 24+; iOS ≈ iPhone 8 / iOS 14+ (Neural Engine helps a lot). This sets our low-end Android floor (OQ-7).
- **Model load:** async at screen mount (~200–600 ms, estimate); discard the first 2–3 inference frames (warm-up).
- **App size:** +3 MB (Lite) to +6 MB (Full) for the model — acceptable.

---

## 4. Offline-first & sync (patient app)
- **Local-first store** on device (e.g. `expo-sqlite`/op-sqlite or WatermelonDB): program, cached demo media, completion/verification logs, feedback — all readable/writable offline (FR-32).
- **Sync queue:** mutations recorded locally, flushed to Supabase on reconnect.
- **Conflict model:** adherence/verification logs are **append-only and timestamped** → conflicts are rare; resolve with idempotent upserts keyed by `(patient, exercise, date)`. Program definition is **clinician-authoritative** (last-write-wins from the web). Details in [09](09-data-model.md).
- **Media caching:** demo videos + the 100+ animations prefetched/cached on assignment so the daily loop works with no connection.

---

## 5. Demo-video & animation pipeline (clinician records; capture only)
- Clinician records/uploads a demo (web/phone) → uploaded to Supabase Storage → optional server-side transcode (Edge Function) to a small mobile-friendly format + thumbnail → delivered via Cloudflare CDN → **cached on patient device** for offline playback. **No AI here** (capture only, per the product decision).
- **Built-in 100+ animations (OQ-3 — cost/timeline driver).** Options, to decide in Phase 0:
  - **License** an existing medically-reviewed exercise-animation library (fastest, but licensing cost + may not be Turkish-localized).
  - **Commission** custom 3D-rigged animations (on-brand, controllable, slower/costlier).
  - **Generate** from a rigged avatar + motion library (scalable, needs pipeline build).
  - **Pragmatic MVP:** start with a high-quality **subset (~20–30)** covering the most common conditions, expand over time; clinicians fill gaps with their own recordings. (Competitors have thousands — see [03](03-competitive-and-market.md) — so plan the growth path.)

---

## 6. Backend, auth & APIs
- **Auth:** Supabase Auth. Two roles (clinician, patient); patients bound to a clinician (FR-2). Email/password + phone/OTP for clinicians; invite-link + lightweight auth for patients.
- **Authorization:** Postgres **Row-Level Security** — a clinician sees only their patients; a patient sees only their own data. This is the backbone of KVKK data isolation.
- **APIs:** typed client over Supabase (PostgREST/RPC) + Edge Functions for anything custom (invites, transcode, share-card generation). Shared zod schemas in the monorepo.
- **Realtime:** clinician dashboards subscribe to adherence updates; patient program updates push down.

---

## 7. Privacy & security architecture (KVKK by design)
This is architecture, not an afterthought — KVKK treats exercise video + health data as **special-category** (see [03](03-competitive-and-market.md)).
- **Camera data on-device only.** Frames processed in memory and discarded; **no video/frames transmitted or persisted**. Persist only derived results (verified boolean, timestamp, optionally averaged angles — **not raw landmark streams**, which edge toward biometric data). (FR-19, FR-34)
- **Explicit, separate consent** for health-data processing at onboarding (not bundled into ToS); viewable/withdrawable; **VERBIS** registration for the company.
- **Data residency:** host in EU region (e.g. Frankfurt) for MVP **with explicit consent + appropriate transfer safeguards**; evaluate **Türkiye residency** if required by counsel. ⚠️ **Validate with KVKK legal counsel before launch** — see [12](12-risks-and-open-questions.md).
- **In transit:** TLS everywhere. **At rest:** encryption; least-privilege keys.
- **Camera UX:** explicit in-context permission, visible "stays on your phone," no silent recording, easy skip/retry (FR-19, US-502).
- **Data subject rights:** access/export/delete paths (FR-33).

---

## 8. Build, environments & tooling
- **Native:** EAS Build (dev client for camera/ML testing — **not Expo Go**), EAS Update for OTA JS/asset pushes; New Architecture enabled.
- **Web:** Cloudflare Pages (landing-at-root + app-on-subdomain, matching existing properties).
- **Backend:** Supabase project per environment (dev / staging / prod); migrations in version control.
- **Monorepo:** Turborepo — `apps/web`, `apps/mobile`, `packages/shared` (types, domain, validation, api-client).
- **Quality:** TypeScript strict, shared lint/format, Playwright E2E for web (a `playwright-e2e` skill exists in this environment), Detox/Maestro for mobile flows; device-lab testing for pose on real low/mid-range Android.
- **Analytics:** privacy-respecting event tracking (see [11](11-metrics-and-analytics.md)); no health data in analytics payloads.

---

## 9. Key technical risks (full register in [12](12-risks-and-open-questions.md))

| Risk | Severity | Mitigation |
|---|---|---|
| VisionCamera v4 / Android build instability | High | **Phase-0 spike on real Android** before committing; pin known-good versions |
| Pose flaky in real homes (placement, light, body types) | High | Guided AR placement; per-exercise verifiability tagging; IMU + manual fallback always present |
| Offline accuracy "not trustworthy enough" | High (core bet) | Phase-1 = movement check (robust, 96–99% in studies), not form judgment; fallback tiers; tune thresholds as data |
| KVKK / data residency missteps | High | On-device camera; explicit consent; VERBIS; legal review pre-launch |
| Older/pediatric body proportion misdetection | Medium | Never hard-block; manual confirm; don't shame |
| Thermal/battery on sustained inference | Medium | Inference only during exercise window |
| Animation library cost/timeline | Medium | MVP subset + clinician recordings; expand over time |

---

### Next
- The entities behind all this: [09-data-model.md](09-data-model.md)
- What ships when (incl. the Phase-0 pose spike): [10-roadmap-and-phasing.md](10-roadmap-and-phasing.md)
- The requirements this implements: [04-prd.md](04-prd.md)
