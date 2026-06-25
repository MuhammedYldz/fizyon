# Fizyon — Information Architecture & Screen Inventory

> Document 05 of the pre-development package.
> Two products, two IAs. The clinician web app is **dense and efficient**; the patient mobile app is **sparse and calm** (one decision per screen). This reflects the personas in [01](01-personas-and-jtbd.md) and journeys in [02](02-user-journeys.md).

---

## A. CLINICIAN — WEB (dense, efficient, desktop-first)

### Navigation map
```
Fizyon (web app)
├── Dashboard            ← lands here; triage view ("who needs attention")
├── Patients
│   ├── Patient list     (sortable/filterable; default = attention-first)
│   └── Patient detail
│        ├── Overview     (snapshot: adherence signal, recent activity, feedback)
│        ├── Program      (the editor: exercises, dosing, schedule, adapt)
│        ├── History      (calendar heatmap, per-exercise verified/manual/missed, trends)
│        ├── Feedback     (pain/too-hard/too-easy stream; acknowledge → adapt)
│        └── Messages     (optional v1.x; light two-way)
├── Exercise Library
│   ├── Browse           (built-in 100+ + my custom; search/filter by area/condition)
│   ├── Exercise detail  (demo, params, verifiability)
│   └── Record / new     (record demo video — capture only, set params)
├── Movement Sets / Templates
│   ├── Built-in sets    (e.g. "Omuz Rehabilitasyon — Faz 1")
│   └── My templates     (saved reusable programs)
└── Settings
     ├── Clinic & profile (incl. "show my name on patient shares" consent)
     ├── Team (multi-therapist clinics — later)
     └── Billing / subscription (iyzico; havale/EFT invoice option)
```

### Screen inventory (web)
| Screen | Purpose | Key elements | Notes |
|---|---|---|---|
| Sign-up / onboarding | Get started fast | Clinic + profile, sample patient | < 2 min; no card (US-101) |
| **Dashboard** | Daily triage | At-risk patients first, aggregate adherence, since-last-visit | The clinician's home base (US-103, A4) |
| Patient list | Manage book | Per-row adherence signal, last activity, flags; filters | Attention-first sort, not alphabetical |
| **Patient detail · Program** | The make-or-break editor | Add from set/template/custom, dosing, weekly schedule, adapt/swap/pause | Full setup **< 5 min** (US-401) |
| Patient detail · History | Prove recovery | Heatmap, per-exercise verify history, verified/manual/missed split, trends | Honest method labeling (FR-21) |
| Patient detail · Feedback | Respond to patient | Pain/too-hard/too-easy stream → one-click adapt | Links US-1201 → US-402 |
| Exercise Library / detail | Content | Search/filter, demo, params, verifiability tag | 100+ built-ins + custom (US-201) |
| **Record exercise** | Author demo | Record/upload, trim, thumbnail, set params | Capture only, no AI (US-202) |
| Movement Sets / Templates | Reuse | Assign whole set in one action; save/apply templates | US-301, US-302 |
| Settings / Billing | Account | Profile, name-share consent, subscription | iyzico + havale ([03](03-competitive-and-market.md)) |
| Empty states | Guide | "Add your first patient," sample data | Reach "aha" in first session |

**Web IA principles:** persistent left nav; the **patient is the primary object**; triage by attention, not alphabet; every common action (assign, adapt, record) ≤ 2 clicks from the patient; data-dense but scannable.

---

## B. PATIENT — MOBILE (sparse, calm, one decision per screen)

### Navigation map
```
Fizyon (patient app)  — bottom tab bar, 3 items max
├── ⌂ Bugün (Today)        ← default; today's program, one primary action
│     └── Exercise flow
│          ├── Demo         (watch/replay)
│          ├── Camera verify (once/move/day; placement guide → result)  🔒
│          ├── Sets         (mark remaining sets done)
│          └── Done         (warm confirmation)
├── ◔ İlerleme (Progress)   ← heatmap, streak, milestones, share
│     └── Share card        (opt-in; choose stats + clinician name)
└── ☰ Profil (Profile/Settings)
      ├── Programım (my program overview)
      ├── Oyunlaştır toggle  (opt-in gamification)
      ├── Hatırlatıcılar (gentle reminders)
      ├── Gizlilik & kamera (privacy, camera help, consent)
      └── Yardım / destek
```

> **Only 3 tabs.** Tired, one-handed users don't navigate — they're guided. Everything non-essential lives under Profile.

### Screen inventory (mobile)
| Screen | Purpose | Key elements | State-of-user notes |
|---|---|---|---|
| Onboarding (invite) | Connect to clinician | Auto-bind via link, plain-TR consent, camera primer | Minutes to day-1 (US-501/502) 🔒 |
| **Today (Bugün)** | The home | Today's moves + counts + completion; one big "Başla" | One glance, no menus (US-601) |
| Exercise · Demo | Show the move | Replayable demo/animation, counts, cues | Clear, large (US-602) |
| **Camera verify** 🔒 | Confirm correctness | Silhouette/AR placement guide → live check → warm result | Reassurance, not a test (US-701) |
| Verify fallback | Never block | Retry help → IMU → "I did this" manual | Encouraging copy only (US-702) |
| Sets | Track within move | Big set counters, "tamam" | Forgiving, easy undo |
| Day complete | Reward effort | Warm confirmation + gentle nudge | No shame (US-603) |
| **Progress (İlerleme)** | Sustain a long arc | Calendar heatmap, streak (mercy), mastery, % program | Make months *feel* like progress (US-801) |
| Share card | Acquisition | Patient-selected stats + clinician name | Opt-in, user-initiated (US-1101) 🔒 |
| Re-engagement | Welcome back | Warm message + optional lighter day | After missed days (US-901) |
| Oyunlaştır (opt-in) | Motivation layer | Points, goals, rewards, merciful streaks | Layer on core loop only (US-1001) |
| Reminders | Gentle nudge | Configurable times, quiet hours | Kind, snoozable (US-1501) |
| Privacy & camera | Trust | Consent view/withdraw, "stays on phone," camera help | KVKK (US-1401) 🔒 |

**Mobile IA principles:** **one primary action per screen**; tap targets ≥ 44–48px; thumb-reachable primary buttons; the daily loop is linear (Today → move → verify → done), never a maze; gamification is additive, never structural; everything works **offline**.

---

## C. Cross-cutting IA notes
- **Shared vocabulary** (Turkish-first): Bugün, İlerleme, Hareket (move), Set, Program, Oyunlaştır, Fizyoterapist, Hasta. Consistent across surfaces.
- **The patient is the spine of the clinician app; "today" is the spine of the patient app.**
- **No dead ends:** every error/empty/offline state offers a next step.
- Navigation depth: clinician ≤ 3 levels to any action; patient core loop is effectively flat.

---

### Next
- How these screens should look & feel: [06-design-direction.md](06-design-direction.md)
- The components that build them: [07-design-system.md](07-design-system.md)
