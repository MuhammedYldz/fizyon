# Fizyon — Design Direction

> Document 06 of the pre-development package.
> This is the doc that fixes "I don't like how it looks, feels, and acts." It's an opinionated art direction, not a mood board. Tokens and components are spec'd in [07-design-system.md](07-design-system.md). Every choice here is derived from the subject (physiotherapy/recovery) and the two personas in [01](01-personas-and-jtbd.md).

---

## 0. The one idea everything hangs on — the Recovery Arc

Physiotherapists measure recovery in **degrees of returned range of motion**, with a **goniometer** — a protractor-like arc laid against a joint. That instrument *is* the visual language of the field. So Fizyon's signature is not a generic progress ring; it's **the arc**:

> **Recovery is an arc that opens.** Every move verified, every day done, every month of healing is the arc of a joint articulating a little further. Progress *opens up*. Setbacks don't slam shut — the arc just waits.

- A verified move = an arc **completing** with a warm marigold glow.
- A day done = the day's arcs **closing the loop**.
- A month of recovery = a long arc **filling** across the calendar.
- Measured values (degrees, reps, %, days) are set in a **measurement mono**, echoing a clinical instrument readout.

This is the **one bold thing**. Everything else stays quiet and disciplined so the arc carries the personality. It's true to the subject, emotionally right (motion returning to the body), and unmistakably *not* a templated health-app ring.

**The aesthetic risk we're deliberately taking:** committing the *entire* progress system to goniometry — recovery spoken in degrees. It demands consistent execution, but it's defensible because it's literally how the profession measures healing, and no competitor owns it (see [03](03-competitive-and-market.md)).

---

## 1. Mood & art direction

**Three words: Calm. Capable. Warm.**

Fizyon should feel like a **good physiotherapist's hands** — calm, sure, encouraging, never cold or clinical, never childish. Not a hospital (sterile, anxious). Not a fitness app (loud, vain, punishing). Not a med-tech dashboard (cold blue, alarming reds). A warm, grounded, recovery-paced space where a tired person feels looked after and a busy clinician feels in command.

Two surfaces, one soul, **two densities**:

| | Clinician (web) | Patient (mobile) |
|---|---|---|
| Feeling | Capable, fast, authoritative | Calm, gentle, effortless |
| Density | Information-dense, efficient | Spacious, one-thing-at-a-time |
| Palette lean | Spruce + structured neutrals (trust, focus) | Paper warmth + marigold (encouragement) |
| Type scale | Tighter, data-forward | Large, generous, readable when tired |
| Motion | Crisp, minimal | Breath-paced, soothing |

---

## 2. Color

The hero is **green, not blue.** Clinical blue is the genre default and reads cold and anxious; cream-and-terracotta is the current AI-design default and reads like everyone else. We anchor on a **deep spruce green** (calm, health, recovery, trust) and spend our warmth on a **marigold** accent (vitality, the sun, Turkish warmth, the "you did it" glow). Red is deliberately *demoted* — we never alarm or shame a sick person — and replaced by a soft **clay** for gentle attention.

| Token | Hex | Role |
|---|---|---|
| **Ink** | `#15201C` | Primary text — a deep desaturated green-charcoal, never pure black (softer, on-brand) |
| **Spruce** | `#1F4D43` | Primary brand — trust, clinician chrome, key actions |
| **Jade** | `#3E7C6E` | Secondary green — arc fills, secondary UI, calm states |
| **Marigold** | `#E0962B` | Accent — progress/success/energy, the arc-glow, milestones |
| **Clay** | `#CC7A66` | Gentle attention — pain flags, "needs attention" (warm, never alarming) |
| **Paper** | `#F4F6F3` | Patient app background — warm off-white with a faint green breath (not cream cliché) |
| **Mist** | `#FBFCFB` | Clinician background — clean near-white for data legibility |

**Rules**
- **Never** use a saturated alarm-red for the patient. "Missed" is neutral grey, not red. "Pain reported" is clay, paired with an icon + label (color is never the only signal — colorblind-safe).
- Marigold is **earned**: it appears at moments of success and progress, so it stays meaningful.
- Clinician surface leans Spruce + neutrals (focus); patient surface leans Paper + Marigold (warmth). Same tokens, different emphasis.
- Full ramps, states, and AA/AAA contrast pairings are in [07](07-design-system.md).

---

## 3. Typography

Type must be **humane and effortlessly legible for tired and older eyes**, render Turkish **perfectly** (ı, İ, ğ, ş, ç, ö, ü — many display faces break the dotless ı), and avoid both the geometric-default (Inter/Roboto) and the fashion-serif cliché.

| Role | Face | Why |
|---|---|---|
| **UI / body (both surfaces)** | **Hanken Grotesk** | Warm humanist grotesque — friendly without being childish, superb large-size legibility, full Turkish, real weight range. Distinctive vs the Inter default. |
| **Display / emotional moments** | **Source Serif 4** | A calm, trustworthy humanist serif used **sparingly** for encouragement and milestones ("1 ay tamamlandı"). Low-contrast and warm — deliberately *not* the high-contrast fashion serif. Excellent Turkish support. |
| **Measurement / data** | **Spline Sans Mono** (or IBM Plex Mono) | The "instrument readout" — degrees, reps, %, streak days, dashboard figures. Ties numbers to the goniometer motif and gives clinician data a tabular spine. |

Type principles: large base sizes (patient body ≥ 17–18px, scales with OS), generous line-height for calm, tight-but-not-cramped display tracking, sentence case everywhere (warmer than Title Case), respect Dynamic Type / font scaling. Scale defined in [07](07-design-system.md).

---

## 4. Motion — breath-paced, physiological

Motion should feel like a **body articulating**, not a UI showing off.

- **Arc reveal:** arcs ease *open* like a joint moving through its range — a smooth, slightly slow `ease-out`, never bouncy by default.
- **Verification success:** the arc closes, a soft marigold glow blooms once, a gentle haptic. One orchestrated moment, not scattered sparkle.
- **Transitions:** quiet cross-fades and gentle slides; the patient flow moves forward like turning a page, never jarring.
- **Calm by default, celebratory only when earned** (and a little more playful in Oyunlaştır mode — see §7).
- **`prefers-reduced-motion` fully respected**: arcs snap to state, glows become a static fill, no parallax. The information never depends on the animation.

> Anti-pattern: ambient floating blobs, scroll-jacking, confetti on every tap. Recovery is paced; the UI is paced.

---

## 5. Voice & tone (Turkish-first)

Words are design material. Fizyon speaks **plain, warm Turkish**, like a kind clinician — never medical jargon to the patient, never babytalk, never shame.

**Patient voice — warm, direct, encouraging:**
- Success: *"Doğru! Aynen böyle."* (Correct! Just like that.)
- Retry: *"Hadi bir daha deneyelim."* (Let's try once more.) — never "failed/wrong."
- Return after a gap: *"İyi ki geldin. Bugün küçük bir şeyle başlayalım."* (Glad you're here. Let's start small today.)
- Empty/done: *"Bugünlük bu kadar. Yarın görüşürüz."* (That's it for today. See you tomorrow.)

**Clinician voice — concise, competent, respectful:**
- Action labels say exactly what happens: *"Programı ata"* (Assign program), *"Egzersiz ekle"*, *"Kaydet."* The button that says Assign produces "Assigned."
- Empty states are invitations: *"İlk hastanı ekle"* (Add your first patient).
- Errors give direction, not apology: state what happened + how to fix.

Rules: active voice; one job per label; consistent vocabulary across surfaces (Bugün, Hareket, Set, İlerleme, Oyunlaştır); specific beats clever.

---

## 6. Accessibility — a binding design constraint, not a checklist

Because our patient is **unwell, tired, older, one-handed, in low light, on a low-end phone** ([01](01-personas-and-jtbd.md)), these are *design requirements*:

- **Tap targets ≥ 44–48px**, generous spacing, **primary action in the thumb zone** (bottom of the patient screen).
- **One primary action per patient screen.** No competing CTAs.
- **Contrast:** AA minimum across the board; **AAA for patient body text** where feasible.
- **Color is never the only signal** — status always pairs color with icon + label (covers color-blindness and the "no alarming red" rule).
- **Respects OS text scaling** without breaking layout, and **reduced motion**.
- **Visible keyboard focus** (clinician web) and screen-reader labels on both.
- **Offline and low-end first** — the design must hold at 2GB-RAM Android and no connection.

Audit web against the `web-design-guidelines` skill; audit mobile against platform a11y.

---

## 7. The "Oyunlaştır" (gamify) layer — gentle, opt-in, same skeleton

Gamification is a **warming of the same system**, never a different (childish) app — research shows older patients reject cartoonish game UI and that punitive streaks cause dropout ([03](03-competitive-and-market.md)).

- Uses the **same Recovery Arc**, just more celebratory: arcs earn a marigold glow, points **count up** on the mono readout, milestones become **quiet certificates** (not cartoon badges).
- **Merciful by design:** streaks have grace/freeze tokens; a missed day after a pain flare never burns a streak. No leaderboards between patients. No FOMO, no artificial urgency.
- Toggling it **off** returns cleanly to the calm default. It changes the *flavor*, never the core loop.

---

## 8. Quick wireframes (to make the direction concrete)

**Patient — Today (Bugün):** spacious, one decision, big arc.
```
┌──────────────────────────────┐
│  Bugün            ●●○ 2/3     │   ← day arc (mono count)
│                              │
│   ╭───────────────────────╮  │
│   │   ◜‾‾‾◝   Diz açma    │  │   ← Recovery Arc per move
│   │  ◜  45°  ◝  3 set      │  │     (degrees in mono)
│   │   ◟___◞   ▸ Başla      │  │
│   ╰───────────────────────╯  │
│   ╭───────────────────────╮  │
│   │   ✓ Tamam   Köprü      │  │   ← verified move (arc closed, glow)
│   ╰───────────────────────╯  │
│                              │
│   [        Başla        ]    │   ← one big thumb-zone primary
│  ⌂ Bugün   ◔ İlerleme   ☰    │
└──────────────────────────────┘
```

**Clinician — Dashboard (triage):** dense, scannable, attention-first.
```
┌───────────────────────────────────────────────────────────┐
│ Fizyon   Dashboard                          Selin ▾        │
├──────────┬────────────────────────────────────────────────┤
│ Dashboard│  Dikkat gerekenler (5)                          │
│ Hastalar │  ◜◝ Ahmet K.   ▒▒▒░░ %58 bu hafta   ⚠ ağrı     │
│ Egzersiz │  ◜◝ Zeynep A.  ▒░░░░ %20   3 gün sessiz         │
│ Setler   │  ◜◝ Mert Y.    ▒▒▒▒░ %74   yeni geri bildirim   │
│ Ayarlar  │  ───────────────────────────────────────────   │
│          │  Tüm hastalar  ▒▒▒▒░ ort. %71 uyum             │
└──────────┴────────────────────────────────────────────────┘
```
(Arcs as status glyphs; mono for the percentages; clay for the pain flag — no red.)

---

## 9. What we explicitly avoid (so we don't drift back to generic / clinical / shaming)
- ❌ Clinical hospital blue + sterile white. ❌ The AI cream + high-contrast serif + terracotta default. ❌ Dark-mode + acid-accent. ❌ Broadsheet hairline newspaper.
- ❌ Alarm-red and broken-streak punishment for a sick person.
- ❌ Cartoon/childish gamification.
- ❌ Generic circular progress rings (we have the **arc** instead).
- ❌ Jargon, Title Case shouting, scattered animation, tiny tap targets.

---

### Next
- Turn this into tokens & components: [07-design-system.md](07-design-system.md)
- The screens it dresses: [05-information-architecture.md](05-information-architecture.md)
