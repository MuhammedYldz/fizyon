# Fizyon — Product Vision & Strategy

> Document 00 of the pre-development package. Start here.
> Status: Draft v1 · Owner: Muhammed Yıldız · Market: Türkiye-first
> UI language: Turkish. This doc set is written in English for the build team; product-facing terms are noted in Turkish where they matter.

---

## 1. One sentence

**Fizyon is the home between clinic visits** — a physiotherapist assigns a recovery program from the web, and the patient does it correctly at home on their phone, with the phone's camera confirming each move was actually done, so both sides can see the recovery happening week after week.

## 2. The problem we are actually solving

Physiotherapy doesn't fail in the clinic. It fails at home.

A typical recovery is **6–12 months** of daily home exercises. But the moment the patient leaves the clinic, three things break at once:

1. **The patient forgets or does it wrong.** They don't remember the move, the sets, or what "good form" felt like. Doing it wrong can stall recovery or cause injury.
2. **Motivation collapses over a long, invisible timeline.** Recovery is slow and boring. There's no feedback loop, no sense of progress, nothing to push against on a tired evening.
3. **The clinician goes blind.** Once the patient walks out, the physiotherapist has zero visibility. Did they do it? How many times? Are they getting better or quietly giving up? They find out at the next appointment — weeks later, often too late.

This is the **adherence gap**, and it is the single biggest reason home physiotherapy underperforms. (Adherence statistics and sources are in [03-competitive-and-market.md](03-competitive-and-market.md); the short version is that a large share of home-exercise programs are not followed as prescribed.)

Today the tools are a printed handout, a generic YouTube link, or a PDF. None of them close the loop. None of them tell the patient "yes, you did that correctly," and none of them tell the physiotherapist "your patient is on track."

**Fizyon closes the loop.** The patient gets a clear, gentle daily program and instant confirmation that they did each move. The clinician gets a live adherence picture across all their patients without chasing anyone.

## 3. Why now

- **On-device pose estimation has matured.** Phones can now detect a human skeleton from the camera *offline*, on the device, in real time. This means we can verify movement **without sending a single frame off the phone** — which is the only acceptable way to handle a sick person's body on camera. (Feasibility detail in [08-technical-architecture.md](08-technical-architecture.md).)
- **Telerehab is normalized.** Patients and clinicians now expect part of care to happen through a screen.
- **Türkiye is a strong first market.** A large, mobile-first population, a growing private physiotherapy sector, and clinicians who currently rely on paper. Local-language, local-payment, KVKK-compliant tooling is largely missing. (Market detail in [03](03-competitive-and-market.md).)

## 4. Vision statement

> In three years, when a physiotherapist in Türkiye sends a patient home, they send them home **with Fizyon** — the way a doctor writes a prescription. The patient recovers faster because the program is in their pocket and the camera keeps them honest and correct. The physiotherapist runs a healthier practice because they can see, at a glance, that their patients are actually getting better.

## 5. Who it is for (two-sided, by design)

Fizyon has two users with **opposite emotional states and opposite devices**, and the product must respect both. This is the central design tension of the whole product.

| | Physiotherapist (Fizyoterapist) | Patient (Hasta) |
|---|---|---|
| State of mind | Busy, time-pressured, wants control and speed | Unwell, tired, stressed, sometimes in pain |
| Primary device | **Web / desktop** (between patients) | **Mobile** (at home, on the couch, one-handed) |
| Core need | "Set up and monitor many patients fast, with confidence" | "Tell me exactly what to do today, confirm I did it right, show me I'm getting better" |
| Camera role | **Records** exercise demo videos (capture only, no AI) | **Verifies** their own movement (offline, on-device AI) |
| Emotional design goal | Efficient, authoritative, trustworthy | Calm, encouraging, effortless, never shaming |

Full personas, jobs-to-be-done, and context-of-use are in [01-personas-and-jtbd.md](01-personas-and-jtbd.md).

There is also a **buyer/economic persona** (clinic owner / the physiotherapist as business owner) — covered lightly in personas, fully in business model below.

## 6. Product principles (our non-negotiables)

These are the rules we design and argue against. When in doubt, these win.

1. **Web is the source of truth.** The clinician's web app defines reality — patients, programs, exercises, schedules. Mobile consumes and reports against it. We build web first.
2. **The patient app must work tired and one-handed.** If a feature requires focus, two hands, or a good mood, it's wrong. Big targets, few decisions, forgiving flows. (See [06-design-direction.md](06-design-direction.md).)
3. **Privacy is physical, not a policy.** Verification runs **on-device and offline**; camera frames never leave the phone. We store the *result* ("move done"), never the video. This is both an ethical stance and a KVKK requirement, and it's a marketing weapon.
4. **Adherence is the north star, not feature count.** Every feature is judged by whether it makes a patient more likely to do tomorrow's exercises correctly.
5. **Never shame the patient.** A missed day is met with "let's pick it back up," never a red streak-broken punishment. Sick people are not failing students. Gamification ("Oyunlaştır") is opt-in and gentle.
6. **Respect the clinician's expertise and time.** The app assists clinical judgment; it never overrides it. Setup of a patient program should take minutes, not a session.
7. **Verify once, correctly.** A move is verified **once per day per exercise**, even if it has multiple sets. We confirm the patient can do it right today — we don't nag them through every rep. (Detailed rule in [04-prd.md](04-prd.md).)
8. **Turkish-first, not Turkish-translated.** Tone, examples, payment, and compliance are designed for Türkiye from day one.

## 7. How Fizyon is different (positioning)

- **vs. paper handouts / PDFs / YouTube:** Fizyon confirms the move was *done* and *correct*, and reports it back to the clinician. Paper can't.
- **vs. global telerehab apps (Physitrack, Kaia, SWORD, Hinge, etc.):** Most are priced and built for US/EU healthcare systems, in English, with cloud-based or no camera verification. Fizyon is **Türkiye-native** (language, KVKK, local payment), **offline + on-device** for camera verification (privacy + works on poor connections), and **affordable for independent clinics**. Detailed competitive teardown in [03](03-competitive-and-market.md).
- **vs. consumer fitness/pose apps:** Those optimize for workouts and vanity metrics. Fizyon is **clinician-prescribed rehab** with a real care relationship behind it. The physiotherapist's name and authority is part of the patient's motivation.

## 8. Business model

- **Model:** B2B SaaS. The **physiotherapist / clinic pays**; the patient uses it free (it's part of their care).
- **Pricing shape (to validate):** per-physiotherapist seat and/or per-active-patient tiers. A free tier with a small patient cap to drive bottom-up adoption by independent physiotherapists.
- **Payment, Türkiye-first:** support local norms — **havale/EFT**, and a local card processor (e.g. iyzico) — not just international cards.
- **Wedge:** the independent or small-clinic physiotherapist who today uses paper/WhatsApp and has no monitoring tool. Land there, expand to multi-therapist clinics.
- **Why it compounds:** every physiotherapist brings their whole patient book; patients experience the product for 6–12 months; happy patients and their shareable progress become a referral and acquisition channel.

(Strategy notes carried over from prior planning: B2B, havale payment, founder-led GTM, appointment-booking deferred. Roadmap implications in [10-roadmap-and-phasing.md](10-roadmap-and-phasing.md).)

## 9. North-star & guardrail metrics

- **North star: Verified Weekly Adherence Rate (VWAR)** — across active patients, the share of *assigned* move-days that were *verified done* in a given week. This single number captures the whole value chain: a good program, a motivated patient, and working verification all have to be true for it to go up.
- **Supporting metrics:** patient 4-week and 12-week retention, clinician weekly active usage, time-to-set-up-a-patient, share-rate of progress.
- **Guardrails (must not get worse):** verification false-accept / false-reject rate, patient-reported frustration, clinician setup time, app crash/ANR rate on low-end phones.

Full metric tree and event taxonomy in [11-metrics-and-analytics.md](11-metrics-and-analytics.md).

## 10. What success looks like in 12 months

- A physiotherapist can set up a new patient's full program in **under 5 minutes**.
- A patient can complete and verify a day's program in **under the actual exercise time + ~1 minute** of app friction.
- Verified weekly adherence for active patients is **meaningfully higher** than the paper-handout baseline (target to be set after baseline measurement).
- Patients stay engaged across a **multi-month** recovery, not just the first week.
- A real cohort of paying physiotherapists in Türkiye who would be "very disappointed" without Fizyon.

## 11. Explicit strategic bets (and the risk if wrong)

| Bet | If we're right | If we're wrong |
|---|---|---|
| On-device offline camera verification is reliable enough to be trusted | Unique, privacy-safe moat | Patients distrust false rejects → we fall back to motion-check + manual confirm (designed-in fallback, see [08](08-technical-architecture.md)) |
| Clinicians will adopt a monitoring tool if setup is fast enough | Sticky B2B wedge | We over-built the clinician side; re-focus on patient value |
| Verifying *once per move per day* is the right adherence unit | Low friction, high trust | We tune the verification cadence (it's a config, not a foundation) |
| Türkiye-first beats going global early | Defensible local depth, lower CAC | We carry the local-first architecture into new markets (i18n from day one mitigates) |

Risk register in full: [12-risks-and-open-questions.md](12-risks-and-open-questions.md).

---

### Where to go next in this package
- The people: [01-personas-and-jtbd.md](01-personas-and-jtbd.md)
- What it feels like to use: [02-user-journeys.md](02-user-journeys.md)
- The market & proof: [03-competitive-and-market.md](03-competitive-and-market.md)
- The actual requirements: [04-prd.md](04-prd.md)
