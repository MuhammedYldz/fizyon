# Fizyon — User Journeys & Core Loops

> Document 02 of the pre-development package.
> Journeys are written from the user's point of view, with their emotional state called out, because state-of-user is a first-class design constraint here (see [01-personas-and-jtbd.md](01-personas-and-jtbd.md)).

Legend: 🟢 = the moment that must feel effortless · ⚠️ = known friction/risk point · 🔒 = privacy-sensitive step.

---

## A. CLINICIAN JOURNEYS (web / desktop — source of truth)

### A1. First-run: clinic & physiotherapist onboarding
1. Selin signs up (clinic name, her profile, specialty). 🟢 *Under 2 minutes; no credit card to start.*
2. She lands on an **empty but inviting dashboard** that says, in effect, "Add your first patient" — with a sample patient she can poke at.
3. She optionally explores the **exercise library** (100+ built-in exercises with animations) so she trusts there's content before she invests.
4. **What must be true:** she reaches "I get it, this is for me" within the first session, without training.

### A2. Set up a new patient (the make-or-break flow) 🟢
This is the flow Selin does most and judges us on. Target: **under 5 minutes**, between appointments.
1. **Add patient** → minimal fields (name, contact for invite, condition/area, recovery start). 
2. **Assign a program** — two paths:
   - **From a template / movement set** (e.g. "Omuz Rehabilitasyon — Faz 1" / "Shoulder Rehab — Phase 1"): a curated *set of movements*. One click, then tweak.
   - **Build custom:** pick exercises from the library, set **sets, reps/occurrences, schedule (which days), and target duration**.
3. **Adapt per patient:** change a count, swap an exercise, or **record her own demo video** for any move (capture only — see A3).
4. **Send invite** → patient gets an SMS/link to install the mobile app and auto-connect to Selin's account. 🔒 *Consent + KVKK notice presented here.*
5. **What must be true:** every step has a sensible default; nothing is mandatory that isn't clinically necessary; she can save a half-built program and finish later.

> ⚠️ **Biggest adoption risk lives here.** If this is slow or cluttered, Selin goes back to paper. The PRD treats setup speed as a hard requirement, not a nicety.

### A3. Record / customize an exercise (capture only — no AI) 
1. Selin opens an exercise (built-in or new) and taps **Record demo**.
2. She records herself (or a model) performing the move — phone or webcam. **No verification AI here**; this is purely capturing a demonstration video.
3. She sets the **default sets / reps / occurrences / tempo / cues** and saves it — as a personal exercise or as part of a movement set.
4. **What must be true:** recording, trimming, and attaching a video is simple and fast; her custom exercises live alongside the built-in 100+.

### A4. Daily monitoring & intervention (the retention engine for clinicians) 🟢
1. Selin opens her **patient list**, sorted/filtered by **who needs attention** (slipping adherence, new feedback, pain flags) — not alphabetically.
2. Each patient row shows an at-a-glance **adherence signal** (this week vs. plan) and **last activity**.
3. She drills into a patient: **calendar heatmap** of done/missed by day, per-exercise verification history, trend over weeks/months.
4. ⚠️ A patient is slipping → she **messages them**, **adapts the program** (lighter load), or flags for a check-in.
5. **What must be true:** she can triage her whole book in a couple of minutes and act in one or two clicks.

### A5. Adapt based on patient feedback
1. Patient reports (from mobile) "this hurts" / "too easy" / "too hard" on an exercise.
2. Selin sees it surfaced on the patient and **swaps/adjusts** the exercise or counts.
3. Change **syncs to the patient's app**; patient sees the updated program next time. 🟢 *No friction, no re-explaining.*

---

## B. PATIENT JOURNEYS (mobile — calm, tired, one-handed)

### B1. Onboarding (invited by their physiotherapist)
1. Ahmet taps the invite link from Selin → installs the app → **auto-connects to her account**. 🔒 *Plain-Turkish consent: what's tracked, that camera stays on the phone.*
2. **Gentle setup:** confirm name, allow notifications (optional), a one-screen "how today works" explainer.
3. **Camera primer (once):** "Sometimes we'll ask you to show one move on camera so we can confirm you're doing it right. It stays on your phone — nothing is sent or saved as video." 🔒🟢
4. **What must be true:** he's at his first day's program within minutes, never feeling tested or surveilled.

### B2. ⭐ THE CORE DAILY LOOP (this is the product)
This is the single most important experience in Fizyon. Everything else exists to support it.

```
Open app
   ↓
See ONLY today's program  ──────────────►  [Today: 3 moves]   🟢 one glance, no menus
   ↓
Tap the first move
   ↓
Watch the demo (clinician's / built-in animation)   🟢 clear, replayable
   ↓
"Show me once on camera"  ── once per move, per day ──►  point phone, do the move
   ↓                                                         │ on-device pose check 🔒 (offline)
   ↓                                                         ▼
   ├─ Verified ✓  "Doğru! Aynen böyle."  (Correct! Just like that.) 🟢 warm, instant
   │     ↓
   │   Do remaining sets freely (no need to film every rep)
   │     ↓
   │   Mark sets done → move complete
   │
   └─ Not detected ⚠️  "Hadi tekrar deneyelim" (Let's try once more) — never "you failed"
         ↓  retry, reposition help, or  →  Manual confirm fallback ("I did this") 🛟
   ↓
Next move … (repeat)
   ↓
Day complete  →  warm confirmation + progress nudge ("3rd day this week 💪")  🟢
```

**Rules that define this loop (full spec in [04-prd.md](04-prd.md)):**
- **Verify once per move per day.** If "Heel slides" has 3 sets, the patient verifies *one* occurrence of the move on camera that day; the other sets are self-marked. We confirm *correctness today*, we don't film every rep.
- **Verification is reassurance, not a gate that traps him.** A robust **manual-confirm fallback** always exists (🛟) so a flaky camera never blocks recovery or shames the patient.
- **Offline-first.** The whole loop works with no connection; results sync when online.
- ⚠️ **Risk point:** false rejections ("I did it but it says no"). Mitigated by retry help, positioning guidance, and the manual fallback. (See [08-technical-architecture.md](08-technical-architecture.md) and risks [12](12-risks-and-open-questions.md).)

### B3. The hard evening / missed day (re-engagement, no shame)
1. Ahmet skips a day (pain, low mood, life).
2. Next open: **warm welcome back**, not a broken-streak punishment. "İyi ki geldin. Bugün küçük bir şeyle başlayalım." (Glad you're here. Let's start small today.)
3. Optional **lightened** suggestion for the day.
4. **What must be true:** guilt never becomes the reason he uninstalls. (Default, non-gamified experience is explicitly merciful.)

### B4. Progress over weeks & months (why he keeps going)
1. Ahmet opens **Progress** → sees a **calendar heatmap**, weekly/monthly streak of done vs. missed, exercises mastered, and a simple "you're X% through your program" sense.
2. Milestones celebrated softly ("1 ay tamamlandı" / "1 month done").
3. **What must be true:** a long, slow, 6–12 month recovery *feels* like accumulating progress, not an endless gray slog.

### B5. Share a success (acquisition loop) 
1. Ahmet hits a milestone → **Share** → a clean card with **his stats** (e.g. "30 days, 92% adherence, knee rehab") and **his physiotherapist's / clinic's name**. 🔒 *He controls what's shared; sharing is opt-in and never automatic.*
2. He posts it (WhatsApp/Instagram). Friends see a real recovery story tied to a real clinic → **referral**.
3. **What must be true:** the card looks proud and human (recovery achievement), never like medical data leakage.

### B6. Gamified track — "Oyunlaştır" (opt-in, for Deniz)
1. In **Settings**, Deniz turns on **Oyunlaştır**.
2. The same core loop now layers **points, goals, levels, rewards ("gifts"), and merciful streaks** on top.
3. Milestones become shareable achievements.
4. **What must be true:** turning it on changes the *flavor*, never the core "what do I do / did I do it right" loop; turning it off returns to the calm experience. No dark patterns, no shame, no pay-to-win.

---

## C. Where the two sides meet (the closed loop)

This diagram is the whole thesis of the product — the loop that paper handouts can't close:

```
   SELIN (web)                                   AHMET (mobile)
   ───────────                                   ──────────────
   Build / record / assign program  ───────────►  Receives today's program
                                                          │
                                                          ▼
   Sees adherence + verification  ◄───────────  Does + verifies on-device (offline)
   heatmap, trends, feedback                              │
        │                                                 ▼
        ▼                                          Reports pain/too-hard/too-easy
   Adapts program  ──────────────────────────►  Updated program appears
        │                                                 │
        └──────────────► both watch recovery happen ◄─────┘
                              week after week
```

---

## D. Journey-level "must be true" summary (acceptance at the experience level)
- Clinician sets up a patient in **< 5 min**; triages their whole book in **~2 min/day**.
- Patient's daily loop adds **~1 minute of app friction** on top of the actual exercise time.
- Verification feels like **reassurance**; a failed detection never blocks or shames.
- Missed days are **recoverable and guilt-free** by default.
- A multi-month recovery **visibly accumulates**.
- Everything patient-side works **offline** and on **low-end phones**.

These roll up into the functional requirements and success metrics in [04-prd.md](04-prd.md) and [11-metrics-and-analytics.md](11-metrics-and-analytics.md).
