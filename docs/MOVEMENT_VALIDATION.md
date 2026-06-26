# Fizyon — Movement Validation Feature

**Decision:** Build on **MediaPipe Pose Landmarker** (free, on-device, fully offline). Validate against a hard Go/No-Go gate. If it fails the gate, fall back to **QuickPose** → then **KinesteX**.

**Owner:** Muhammed
**Date:** 2026-06-26
**Status:** Spec / pre-build
**Hard constraints:** 100% on-device, no video/data leaves the phone (KVKK/GDPR), native or hybrid, output = `verified` + `accuracy score`.

---

## 0. TL;DR

The patient films themselves doing a prescribed exercise. The app runs MediaPipe **entirely on the phone** to get 33 body landmarks per frame, then a **scoring layer we build** compares the patient's movement to a **reference the physiotherapist recorded once**. Output the app extracts:

```json
{ "verified": true, "accuracy": 87, "reps": 10, "perJoint": { "knee": 0.91, "hip": 0.78 }, "feedback": ["Bend your knee ~10° more"] }
```

MediaPipe gives us the keypoints for free. The "is it correct + score" logic is **our IP** and the bulk of the build. This is documented and clinically validated (see §10) — not experimental.

---

## 1. Architecture — two layers

```
┌─────────────────────────────────────────────────────────────┐
│  PHONE (everything below runs on-device, offline)            │
│                                                               │
│  Camera frames                                                │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────────────────┐   LAYER 1: POSE ENGINE             │
│  │ MediaPipe Pose       │   (MediaPipe, free, Apache-2.0)    │
│  │ Landmarker (Full)    │ → 33 landmarks, 2D + 3D world (m), │
│  └──────────────────────┘   visibility per landmark          │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────────────────┐   LAYER 2: SCORING (WE BUILD)      │
│  │ a) Joint-angle rules │ → per-joint correctness            │
│  │ b) DTW vs reference  │ → whole-movement similarity        │
│  │ c) Rep state machine │ → rep count                        │
│  │ d) Thresholds        │ → verified yes/no + accuracy %     │
│  └──────────────────────┘                                    │
│       │                                                       │
│       ▼                                                       │
│  { verified, accuracy, reps, perJoint, feedback }            │
└─────────────────────────────────────────────────────────────┘
       │ (only this small JSON is stored / synced — never video)
       ▼
   Fizyon backend (Supabase) — progress tracking
```

**Key principle:** raw video and frames never leave the device. Only the result JSON is persisted. This is the privacy promise we sell to clinics.

---

## 2. Tech stack & libraries

Fizyon is hybrid-leaning. Pick the binding by the app shell:

| App shell | MediaPipe binding | Notes |
|---|---|---|
| **React Native** (recommended) | `@gymbrosinc/react-native-mediapipe-pose` or `react-native-mediapipe` | Returns 33 landmarks + confidence + processing time. GPU accel. Physical device only. |
| **Flutter** | `flutter_pose_detection` (GPU/NPU delegates) or ThinkSys `thinksys_mediapipe_plugin` | 33 landmarks, iOS + Android. |
| **Native iOS** | MediaPipe Tasks `PoseLandmarker` (Swift) | Best perf/control. |
| **Native Android** | MediaPipe Tasks `PoseLandmarker` (Kotlin) | Best perf/control. |
| **Capacitor/PWA shell** | ⚠️ avoid for this feature | Browser/WASM path is slower and weaker; this is why we went native/hybrid. |

**Model variant:** ship **Full** (balanced). Auto-downgrade to **Lite** on low-end devices; offer **Heavy** only on flagships. Bundle the `.task`/`.tflite` model file in the app (no download = works offline on first run).

**Scoring layer:** plain TypeScript/Dart we write. No ML training required for v1 (angle rules + DTW). Optional later: a small temporal classifier (LSTM/1D-CNN) if rules prove too brittle.

---

## 3. Build plan (phased)

### Phase 0 — Spike (1 week) — DO THIS BEFORE COMMITTING
Goal: prove the engine works on **real target phones** before building anything.
- [ ] Stand up a bare RN/Flutter screen that opens the camera and overlays the 33 landmarks live.
- [ ] Measure sustained **FPS** on a mid-range Android (~$250–300 phone) and an old iPhone (iPhone 8/SE).
- [ ] Confirm **zero network egress** with a network monitor while it runs.
- [ ] Eyeball landmark stability on 3 real exercises (one easy, one hard).
- **Exit:** if FPS < 20 or landmarks are garbage on mid-range hardware → jump to the Fallback Roadmap (§8) now, don't sink weeks in.

### Phase 1 — Pose capture pipeline (1 week)
- [ ] Stream frames → MediaPipe → normalized 2D + 3D world landmarks + visibility.
- [ ] Smoothing: apply a One-Euro / EMA filter to reduce jitter on landmark positions.
- [ ] Gate frames by visibility: ignore frames where target joints have visibility < 0.5.

### Phase 2 — Reference authoring tool (1 week)
How the "correct" movement gets defined. See §4. Build the physiotherapist-side capture: record once → store reference landmark sequence + per-exercise config (which joints matter, target angle ranges, tolerances).

### Phase 3 — Scoring layer (2–3 weeks) — the core
- [ ] **Joint angles**: compute angles from landmark triplets (see Appendix A).
- [ ] **DTW**: align patient sequence to reference sequence, get a distance → map to 0–100 similarity (Appendix B).
- [ ] **Rep counter**: state machine on a primary joint angle crossing up/down thresholds.
- [ ] **Verdict**: combine angle-rule pass-rate + DTW similarity → `verified` + `accuracy`.
- [ ] **Per-joint feedback**: for each tracked joint that failed, emit a human cue.

### Phase 4 — Output contract & integration (3–4 days)
- [ ] Emit the result JSON (§5). Persist only the JSON to Supabase. Never upload frames.
- [ ] Hook into Fizyon progress tracking.

### Phase 5 — UX guardrails (3–4 days)
- [ ] Pre-flight: "stand back, full body in frame, good lighting" with a live "ready" check.
- [ ] Real-time guidance during the rep; summary screen after.
- [ ] Accessibility: audio cues (matters for older physio patients).

**Rough total:** ~6–8 weeks for a solid v1, gated by the Phase 0 spike.

---

## 4. How "correct" movements get authored

Two complementary mechanisms — use both:

1. **Record-once reference (primary).** The physiotherapist performs the exercise once on camera. We extract and store the landmark sequence as the gold standard. The patient is scored by **DTW similarity** to this. Pros: scales to any exercise, no hand-tuning. This is the "learn the movement" the product needs.
2. **Joint-angle rules (overlay).** Per exercise, define which joints matter and their target ranges (e.g. *squat: knee flexion reaches 90°±15°, back angle stays > 150°*). Pros: interpretable, gives precise corrective feedback ("bend knee more"). Authored once per exercise template by us + the clinician.

Store per exercise:
```json
{
  "exerciseId": "knee-flexion-seated",
  "referenceSequence": [ /* frames of {landmarkId: {x,y,z,vis}} */ ],
  "trackedJoints": ["knee", "hip"],
  "angleTargets": { "knee": { "min": 80, "max": 100 }, "hip": { "min": 160, "max": 180 } },
  "repAxis": "knee",
  "tolerances": { "dtwPass": 0.75, "anglePass": 0.8 },
  "cameraView": "side"
}
```

---

## 5. Output contract (what the app extracts)

```json
{
  "exerciseId": "knee-flexion-seated",
  "verified": true,
  "accuracy": 87,
  "reps": 10,
  "repsTarget": 12,
  "perJoint": { "knee": 0.91, "hip": 0.78 },
  "dtwSimilarity": 0.84,
  "angleRulePassRate": 0.86,
  "feedback": ["Bend your knee about 10° more at the bottom"],
  "lowConfidenceFrames": 0.04,
  "timestamp": "2026-06-26T10:00:00Z"
}
```

**`verified`** = (`dtwSimilarity` ≥ `dtwPass`) AND (`angleRulePassRate` ≥ `anglePass`) AND (`lowConfidenceFrames` < 0.2).
**`accuracy`** = weighted blend of `dtwSimilarity` and `angleRulePassRate`, scaled to 0–100.

---

## 6. GO / NO-GO CHECKLIST ✅❌

Run this gate at the end of the Phase 0 spike **and** again after a real pilot (§7). **MediaPipe is a GO only if ALL hard gates pass.** Any hard-gate failure → Fallback Roadmap (§8).

### Hard gates (all must pass)
- [ ] **G1 — Performance:** ≥ **24 FPS sustained** on a mid-range Android (~$250–300) and ≥ 20 FPS on iPhone 8/SE. *(MediaPipe ~30 FPS baseline; if you can't hit this, QuickPose claims up to 120 FPS.)*
- [ ] **G2 — Privacy:** **zero network egress** during a full session, confirmed with a packet/network monitor. Model file bundled, works in airplane mode.
- [ ] **G3 — Safety (no false pass):** rate of **bad reps wrongly marked `verified` < 10%** on a labeled pilot set. *This is the most important gate for a physio product — passing a wrong movement can hurt a patient.*
- [ ] **G4 — Verdict agreement:** app `verified`/not agrees with a physiotherapist's judgment **≥ 85%** of the time across the pilot set.
- [ ] **G5 — Exercise coverage:** **≥ 80% of your top-20 prescribed exercises** clear G3+G4. *(MediaPipe is strong on camera-facing moves; weak on depth-rotation/occluded ones.)*

### Soft gates (target, not blocking)
- [ ] **S1 — ROM accuracy:** tracked joint angle within **±10°** of goniometer/physio ground truth (MediaPipe's documented Minimal Detectable Change). Good enough for "is it improving," not for exact clinical degrees — set clinician expectations.
- [ ] **S2 — Rep count:** ≥ 95% accurate on clean reps.
- [ ] **S3 — Feedback latency:** corrective cue feels real-time (< 300 ms perceived).
- [ ] **S4 — Robustness:** still passes G3 under modest occlusion (e.g. crossed arms — clinical study saw only ~2% degradation on squats) and typical home lighting.
- [ ] **S5 — Cold start:** model loads < 2 s; no crash on low-RAM devices.

### Known weak exercises (expect these to fail — design around them)
Seated knee extension, shoulder flexion, and any movement rotated toward/away from the camera (depth ambiguity + occlusion). MediaPipe ROM error across 8 physio exercises ranged **14.9%–25%**; it was best on **shoulder abduction, shoulder press, elbow flexion, squat**. Build your initial exercise library from the strong set.

---

## 7. Pilot / validation protocol (how to actually test the gate)

1. Pick **20 exercises** you most commonly prescribe.
2. For each, record a physiotherapist reference (the gold standard).
3. Collect **~10 patients/testers**, each doing each exercise with a mix of **correct and deliberately incorrect** reps. Have a physiotherapist label each rep `correct`/`incorrect` (this is ground truth).
4. Run the app offline; log the result JSON for every rep.
5. Compute: false-pass rate (G3), verdict agreement (G4), per-exercise pass (G5), ROM error vs a goniometer on a subset (S1), rep accuracy (S2).
6. Test on **at least 3 phone tiers** (low Android, mid Android, old iPhone).
7. Fill in §6. Decide GO / NO-GO.

---

## 8. FALLBACK ROADMAP — if MediaPipe fails the gate

Both fallbacks run on the **same BlazePose engine** under the hood, so your camera/pose plumbing and exercise concepts carry over. Migration is mostly swapping the engine + scoring source, not a rewrite.

### Trigger matrix

| If this fails… | Go to | Why |
|---|---|---|
| **G1 (FPS)** only | **QuickPose** | Same engine, optimized to claim up to 120 FPS on iOS; drop-in. |
| **Build effort / time** (scoring layer too costly) | **QuickPose** | Ships rep-counting, form feedback, ROM, alignment **score** out of the box. |
| **G5 coverage** — need physio-specific signals (ROM per joint, fatigue, fall/injury) | **KinesteX** | Purpose-built for rehab; returns `accuracy_score` + `efficiency_score` (0–100) directly. |
| **G3/G4 accuracy** can't be reached even with tuning | **KinesteX** (then re-test) | >90% movement-recognition; physio-tuned. If it also fails, the constraint is single-camera physics, not the SDK. |

### Step 1 → QuickPose (the easy fallback)
- **What changes:** replace our scoring layer with QuickPose's prebuilt features (rep counter, form feedback, ROM, pose **correctness/alignment score**). Keep the same camera screen and output contract.
- **Effort:** low. Same MediaPipe keypoints; SDK for iOS / Android / **React Native** (feature-complete both platforms, RN ≥ 0.60).
- **On-device/offline:** ✅ confirmed — "no video frames are ever sent to a server."
- **Cost:** Free 10 devices → $25/mo (100) → $50/mo (1k) → $100/mo (2k) → $200/mo (5k) → $400/mo (10k). "Device" = unique phone using it ≥ once/month. No watermark, all features in free tier.
- **Watch-outs:** prebuilt fitness/yoga **catalog** — exotic physio exercises may not be modeled; for those you fall back to its raw keypoints (= you're building scoring again). Small vendor + recurring per-patient fee.
- **Migration checklist:**
  - [ ] Register free key at dev.quickpose.ai.
  - [ ] Swap pose source to QuickPose SDK; map its `correctness/alignment score` → our `accuracy`, its rep count → our `reps`.
  - [ ] Re-run §6 gate (esp. G3/G5) on your exercises.
  - [ ] Confirm cost at projected patient count.

### Step 2 → KinesteX (the physio-specialized fallback)
- **What changes:** adopt KinesteX SDK; consume its `accuracy_score` (0–100) + `efficiency_score` (0–100) and physio features (ROM, fatigue, fall, injury-prevention, posture/alignment).
- **Effort:** moderate (different API surface, same keypoint concept). React Native SDK available.
- **On-device/offline:** ✅ "all motion analysis happens on your device… only anonymous motion coordinates are processed."
- **Cost:** **not public — contact sales.** Get a quote at your projected patient volume before committing; factor vendor-dependency risk.
- **Migration checklist:**
  - [ ] Request demo + pricing; confirm offline behavior in writing.
  - [ ] Map `accuracy_score`/`efficiency_score` → output contract.
  - [ ] Verify your prescribed exercises are supported or addable.
  - [ ] Re-run §6 gate.

### If BOTH fallbacks also fail G3/G4
Then the bottleneck is **single-camera physics** (depth ambiguity), not the SDK. Options: (a) restrict the exercise library to camera-facing movements only, (b) accept "form guidance, not clinical measurement" framing, (c) explore dual-camera or a depth sensor (breaks the "any phone" promise). Decide product scope accordingly.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Single-camera depth errors on some exercises | Curate exercise library to strong set (§6); side-view configs; flag low-confidence frames. |
| Patient frames body badly | Pre-flight framing check + live "ready" indicator. |
| Old/low-RAM phones | Lite model fallback; FPS gate in Phase 0. |
| False "verified" harms patient | G3 is a hard gate; bias thresholds toward false-negative (re-do) over false-positive (wrong rep passed). |
| Vendor lock-in (if we fall back) | Keep our output contract stable so engines are swappable; MediaPipe remains the free long-term floor. |
| Clinician over-trusts the score | UX copy: "movement guidance, not a medical measurement"; show confidence. |

---

## 10. Why MediaPipe is a sound default (evidence)

- **Clinically validated on-device (2026):** MediaPipe-based program — squat **97.8% pose accuracy**, only **−2.1%** under arm-crossed occlusion, rehab outcomes **comparable to in-person**.
- **Reference architecture exists:** home-PT systems use MediaPipe + **cosine similarity + DTW** vs physiotherapist reference videos, on-device, low compute — exactly our §1 design.
- **Reliability:** intra-rater error < 5°, MDC ~10° — reliable for tracking change, not exact degrees.
- **Free & owned:** Apache-2.0, no per-device cost, Google-maintained — and it's the same engine QuickPose/KinesteX resell.

---

## Appendix A — Joint angle from 3 landmarks (TypeScript)

```ts
type P = { x: number; y: number; z: number };

// Angle at point b formed by a-b-c, in degrees.
function jointAngle(a: P, b: P, c: P): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const m1 = Math.hypot(v1.x, v1.y, v1.z);
  const m2 = Math.hypot(v2.x, v2.y, v2.z);
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}
// Knee angle = jointAngle(hip, knee, ankle). Use 3D world landmarks.
```

## Appendix B — DTW similarity (pseudocode)

```
function dtwSimilarity(patientSeq, refSeq):
    # each frame = normalized pose vector (e.g. selected joint angles or
    # hip-centered, scale-normalized landmark coords)
    n, m = len(patientSeq), len(refSeq)
    D = matrix(n+1, m+1, filled = +inf); D[0][0] = 0
    for i in 1..n:
      for j in 1..m:
        cost = euclidean(patientSeq[i-1], refSeq[j-1])
        D[i][j] = cost + min(D[i-1][j], D[i][j-1], D[i-1][j-1])
    dist = D[n][m] / (n + m)              # length-normalized
    return clamp(1 - dist / maxExpectedDist, 0, 1)   # → 0..1 similarity
```
Normalize poses (center on hips, scale by torso length) before DTW so it's invariant to patient size and camera distance.

---

## Sources
- MediaPipe Pose Landmarker — https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- On-device MediaPipe clinical validation (Healthcare 2026) — https://doi.org/10.3390/healthcare14040482
- Home-PT monitoring (DTW + cosine vs reference) — https://ncbi.nlm.nih.gov/pmc/articles/PMC10781250
- MediaPipe physio ROM accuracy (single-camera) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10951609/
- BlazePose knee-angle validation (JMIR) — https://preprints.jmir.org/preprint/102399
- QuickPose pricing — https://quickpose.ai/sdk-pricing/ · iOS SDK — https://quickpose.ai/products/ios-sdk/ · RN repo — https://github.com/quickpose/quickpose-react-native-pose-estimation · vs MediaPipe — https://quickpose.ai/2024/02/mediapipe-vs-quickpose-a-comparison-of-pose-estimation-tools/
- KinesteX SDK docs — https://www.kinestex.com/docs · RN SDK — https://github.com/KinesteX/KinesteX-SDK-ReactNative
- RN MediaPipe binding — https://www.npmjs.com/package/@gymbrosinc/react-native-mediapipe-pose · Flutter — https://pub.dev/packages/thinksys_mediapipe_plugin
