# Fizyon — Personas & Jobs-to-be-Done

> Document 01 of the pre-development package.
> These are design tools, not marketing. When a design decision is contested, we ask: "what would Selin / Ahmet / Deniz do here, in their actual state?"

The product serves **two primary users in opposite emotional and physical states**, plus one **economic buyer**. Designing for the average of them produces something that serves none of them. We design for each, separately.

---

## Persona A — The Physiotherapist (primary, web)

### Selin, 34 — physiotherapist at a private rehabilitation clinic, İzmir

**Context.** Selin sees 12–18 patients a day, ~20–30 minutes each. Between patients she has a desktop at the front desk and her phone in her pocket. She is good at her job and proud of it, but she is *always behind*. Her current "home program" workflow is a printed sheet of stick-figure exercises, sometimes a WhatsApp video she recorded herself, and a lot of hoping.

**A day in her life.** Patient in, assess, treat, explain the home program at the door while the next patient is already waiting, patient out. She has no idea what happens until they come back — and half the time they admit they "didn't really do the exercises." She re-explains the same program for the third time. It's a quiet, constant erosion of her impact.

**Goals**
- Get a patient set up with the right program **fast** — minutes, between appointments.
- Know **who is actually doing their exercises** without messaging each one.
- Spot the patient who's slipping **before** the next appointment, so she can intervene.
- Look professional and modern to her patients (the clinic competes on experience).
- Reuse her work — build a program once, adapt it per patient.

**Pains / frustrations**
- "I explain it, they nod, they go home and do nothing or do it wrong."
- Clunky medical software that takes a whole appointment to operate.
- No visibility, no feedback, no leverage after the patient leaves.
- Recording and sharing demo videos is fiddly and unprofessional over WhatsApp.

**What she will NOT tolerate**
- Slow, cluttered, multi-click setup. If assigning a program takes longer than explaining it on paper, she's out.
- Anything that feels like it's second-guessing her clinical judgment.
- Having to teach patients how to use complicated software.

**Her camera role:** she **records** exercise demonstration videos (capture only — no AI on her side), sets the **sets, reps/occurrences, and schedule**, and assigns. Her surface is **web/desktop first**, mobile occasionally.

**Quote.** *"I don't need more features. I need to know my patients are actually doing the work — and I need to set it up in two minutes."*

### Jobs-to-be-Done — Selin
- When I finish a treatment, I want to **hand the patient a clear program in minutes**, so I don't lose the next appointment to setup.
- When I'm between patients, I want to **see at a glance who's on track and who's slipping**, so I can act before it's too late.
- When a patient gives feedback (pain, too easy, too hard), I want to **adapt their program quickly**, so the plan stays right for *this* person.
- When I build a good program (e.g. "shoulder recovery — phase 1"), I want to **reuse it as a template**, so I'm not rebuilding from scratch every time.

---

## Persona B — The Recovering Patient (primary, mobile)

### Ahmet, 58 — six weeks after knee surgery, Bursa

**Context.** Ahmet is in a 6–9 month recovery. He's motivated *in the clinic* and lost *at home*. He has a phone he uses for WhatsApp, calls, and the news. He is not "tech savvy," he tires easily, sometimes he's in pain, and in the evening he just wants to know **what to do and whether he did it right** — without thinking hard.

**Context of use (this is critical).** Living room, evening, tired, maybe a little down. Phone in one hand. The TV is on. His knee hurts. He is not in a focused, well-rested, motivated state. **Every screen we design must work for *this* moment**, not for a demo.

**Goals**
- Know **exactly what to do today** — no decisions, no menus.
- Get **confirmation he did it correctly** (his deepest anxiety is "am I doing this wrong and hurting myself?").
- **Feel like he's getting better** — see that the weeks are adding up.
- Not feel **stupid, old, or like he's failing** when he uses the app.

**Pains / frustrations**
- "Did I do that right? I can't tell." (No feedback loop.)
- Forgetting the exercises and the counts.
- Small text, tiny buttons, busy screens, jargon.
- Apps that punish him for a missed day when he was in too much pain to move.

**What he needs from us**
- One obvious thing to do, big and clear.
- The camera verification framed as **reassurance**, not surveillance or a test: "Great — that's correct. ✓"
- Gentle re-engagement, never shame.
- It to work **offline** (his connection is patchy, and the camera must run on-device anyway).

**His camera role:** he points the phone at himself, does the move once for the day, and the app **verifies on-device** that he did it — then he's free to do his remaining sets knowing his form is right. Verification is **once per move per day**.

**Quote.** *"Just tell me what to do, and tell me I did it right. That's all I want."*

### Jobs-to-be-Done — Ahmet
- When I open the app, I want to **see today's program and nothing else**, so I'm not overwhelmed.
- When I do an exercise, I want the app to **confirm I did it correctly**, so I stop worrying that I'm hurting myself.
- When I've had a hard week, I want the app to **welcome me back gently**, so I don't quit out of guilt.
- When I look back, I want to **see how far I've come**, so I keep going through a long, slow recovery.

---

## Persona C — The Young, Gamified Patient (mobile, "Oyunlaştır")

### Deniz, 23 — sports injury, ankle rehab, Ankara

**Context.** Deniz is young, impatient, and bored by slow recovery. Deniz *wants* a challenge, streaks, points, and bragging rights. The same gentle, calm flow that comforts Ahmet feels *flat* to Deniz. This is exactly why **"Oyunlaştır" (Gamify) is an opt-in mode**, not the default.

**Goals**
- Turn a boring recovery into a **game with goals and rewards**.
- **Compete with themselves** (and maybe share wins).
- Feel momentum daily.

**What Deniz needs:** points, levels/goals, rewards ("gifts"), streaks **with mercy rules**, and shareable milestones (with stats + their physiotherapist's name). See gamification spec in [04-prd.md](04-prd.md) and the safety rails (no shaming, no dark patterns) in [03-competitive-and-market.md](03-competitive-and-market.md).

**Quote.** *"If recovery is going to take three months, at least let me level up while I do it."*

### Jobs-to-be-Done — Deniz
- When recovery feels slow, I want **points, goals and rewards** for doing my exercises, so it feels like progress I can feel.
- When I hit a milestone, I want to **share it (with my stats and my physiotherapist's name)**, so my recovery feels like an achievement, not an illness.

> **Design implication:** the patient app has **one calm core experience** (for Ahmet) with an **opt-in gamification layer** (for Deniz) that sits *on top* — it never changes the core "what do I do today / did I do it right" loop.

---

## Persona D — The Buyer / Clinic Owner (economic, light)

### Mert, 45 — owns a 4-physiotherapist clinic, İstanbul

He pays the bills and competes for patients on **experience and outcomes**. He cares about: does it make his clinic look modern, does it improve outcomes (and reviews/referrals), is it priced for a Turkish clinic (not US pricing), is it KVKK-safe so he isn't exposed, and is it easy enough that his staff actually use it. Often Mert and Selin are the **same person** in a solo practice — so the buying decision and the daily-use decision collapse into one. The product must sell itself through daily usefulness, not a sales deck.

**JTBD:** When I choose tools for my clinic, I want something my therapists *actually use* that makes patients *visibly* better and makes us look modern — at a price that makes sense in Türkiye — so it pays for itself in retention and referrals.

---

## Accessibility & state-of-user requirements (binding)

Because our patients are **unwell, tired, sometimes older, sometimes one-handed, sometimes in low light**, these are requirements, not nice-to-haves:

- **Large tap targets** (≥ 44–48px), generous spacing, thumb-reachable primary actions.
- **High contrast**, large readable type, scalable with OS text size.
- **One primary action per screen** in the patient flow.
- **Forgiving flows:** easy to undo, hard to get lost, no dead ends.
- **Works offline** and on **low-end Android** (large installed base in Türkiye).
- **Calm, plain Turkish.** No medical jargon in patient-facing copy.
- **Camera UX that reassures:** explicit permission, visible "this stays on your phone," never silent recording, easy to skip/retry without penalty.
- **No shame states.** Missed days are neutral or warm, never red/punitive in the default (non-gamified) experience.

Carried into concrete rules in [06-design-direction.md](06-design-direction.md) and audited against [web-design-guidelines].

---

## Anti-personas (who we are NOT building for, yet)

- **The self-directed fitness user with no clinician.** Fizyon is prescribed care; the physiotherapist relationship is core. (Rules out a pure-B2C fitness pivot for now.)
- **The hospital IT / enterprise procurement buyer.** We're building for independent and small clinics first; enterprise/hospital integration (HBYS, e-Nabız integration) is later, not now.
- **The "quantified self" power user** who wants to tweak every metric. The patient app optimizes for *less* thinking, not more.

---

### Next
- See these people move through the product: [02-user-journeys.md](02-user-journeys.md)
- The requirements that serve them: [04-prd.md](04-prd.md)
