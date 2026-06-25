# Fizyon — Design System Spec

> Document 07 of the pre-development package.
> The buildable layer under [06-design-direction.md](06-design-direction.md). Tokens are platform-agnostic (map to CSS vars on web, a theme object in React Native). Two **density modes** (clinician / patient) share one token foundation.

---

## 1. Color tokens

### Semantic palette (base values from [06](06-design-direction.md))
| Token | Hex | Use |
|---|---|---|
| `ink` | `#15201C` | Primary text |
| `ink-soft` | `#46514C` | Secondary text |
| `ink-muted` | `#7B847F` | Tertiary / captions / disabled |
| `spruce` | `#1F4D43` | Primary brand, primary buttons, clinician chrome |
| `spruce-press` | `#163A33` | Primary pressed |
| `jade` | `#3E7C6E` | Arc fills, secondary actions, calm accents |
| `jade-soft` | `#D7E6E0` | Arc track, tints, selected rows |
| `marigold` | `#E0962B` | Success/progress glow, milestones, gamify accent |
| `marigold-soft` | `#F7E7C9` | Success backgrounds, glow tint |
| `clay` | `#CC7A66` | Gentle attention (pain/flag) — **never** alarm |
| `clay-soft` | `#F2DDD6` | Attention background |
| `paper` | `#F4F6F3` | Patient app background |
| `mist` | `#FBFCFB` | Clinician background |
| `surface` | `#FFFFFF` | Cards/sheets |
| `line` | `#E4E8E5` | Hairlines, dividers, borders |

### Contrast & rules
- `ink` on `paper`/`mist`/`surface` ≥ **AAA** for body text.
- `spruce` on `surface` and white-on-`spruce` ≥ **AA** (verify ≥ 4.5:1 on the exact shades before build).
- `marigold` is for fills/glows/large text; for small text on light, darken to a `marigold-ink` `#A66A12` to hit AA.
- **Status is never color-only:** always color + icon + label (colorblind-safe; supports the no-alarming-red rule). Map: done = `jade`/`marigold` + ✓; missed = `ink-muted` + neutral dot (**not red**); attention/pain = `clay` + flag icon.
- Dark mode: out of scope for v1; tokens are structured so it can be added later.

---

## 2. Typography

Faces (from [06](06-design-direction.md)): **Hanken Grotesk** (UI/body), **Source Serif 4** (display/emotional, sparing), **Spline Sans Mono** (measurements/data). All verified for full Turkish glyph coverage.

### Type scale
| Token | Face / weight | Patient (mobile) | Clinician (web) | Use |
|---|---|---|---|---|
| `display` | Source Serif 4 / 500 | 32 / 1.15 | 28 / 1.2 | Milestones, emotional moments only |
| `h1` | Hanken / 700 | 26 / 1.2 | 22 / 1.25 | Screen titles |
| `h2` | Hanken / 600 | 21 / 1.3 | 18 / 1.3 | Section heads |
| `body-lg` | Hanken / 400 | 18 / 1.5 | 16 / 1.5 | Patient primary reading |
| `body` | Hanken / 400 | 17 / 1.5 | 15 / 1.5 | Default |
| `label` | Hanken / 600 | 15 / 1.3 | 13 / 1.3 | Buttons, field labels |
| `caption` | Hanken / 500 | 13 / 1.4 | 12 / 1.4 | Helper text |
| `data-xl` | Spline Mono / 500 | 40 / 1.0 | 28 / 1.0 | The big arc number (e.g. `45°`, `%72`) |
| `data` | Spline Mono / 500 | 16 / 1.2 | 14 / 1.2 | Reps, days, table figures |

Rules: sentence case everywhere; respect OS Dynamic Type / `rem` scaling; never below 13px patient-side; tabular figures for all data.

---

## 3. Spacing, radius, elevation, layout

- **Spacing scale (4pt base):** `2, 4, 8, 12, 16, 20, 24, 32, 40, 56, 72`. Patient screens lean on the larger end (breathing room); clinician on the tighter end (density).
- **Radius:** `sm 8` · `md 14` · `lg 22` · `pill 999`. Patient cards use `lg` (soft, calm); clinician cards use `md`. Buttons `pill` (patient primary) / `md` (clinician).
- **Elevation:** soft, low, warm-tinted shadows (never harsh). `e1` = `0 1px 2px rgba(21,32,28,.06)`; `e2` = `0 4px 16px rgba(21,32,28,.08)`; `e3` (sheets) = `0 12px 40px rgba(21,32,28,.12)`. Prefer elevation + hairlines over heavy borders.
- **Grid:** clinician web = 12-col, persistent left nav (`240px`), max content `1200px`, comfortable data tables. Patient = single column, `16–20px` side gutters, content max ~`520px` for large phones.
- **Touch target:** min `44×44` (patient primary `56` tall, full-width-ish, thumb zone).

---

## 4. Motion tokens
| Token | Value | Use |
|---|---|---|
| `dur-quick` | 140ms | Taps, toggles |
| `dur-base` | 240ms | Transitions, card enters |
| `dur-arc` | 600ms | Arc opening (the signature) |
| `ease-standard` | `cubic-bezier(.4,0,.2,1)` | Most |
| `ease-arc` | `cubic-bezier(.22,.61,.36,1)` | Arc articulation (slow-out, organic) |
| `glow-success` | 500ms bloom-once | Verification success |
> All gated by `prefers-reduced-motion`: arcs snap, glow → static fill, no movement-dependent meaning.

---

## 5. Iconography & imagery
- **Icons:** one consistent set, rounded, ~1.75px stroke, calm — e.g. Lucide/Phosphor (rounded). Status icons paired with color always.
- **Exercise media:** demo animations/videos framed in `lg`-radius cards on a neutral surface; never busy backgrounds behind a moving body.
- **Illustration:** sparse, warm, line-based echoing the arc motif; **no cartoon mascots** (older-patient acceptance — see [03](03-competitive-and-market.md)).
- **No stock-photo "happy patient" clichés.**

---

## 6. Core components

### 6.1 Recovery Arc ⭐ (the signature component)
The product's defining element. One component, many sizes/states.
- **Anatomy:** a partial ring (≈220° sweep, goniometer-like) with a `jade-soft` track and a `jade→marigold` progress stroke; an optional centered `data-xl` value (`45°`, `%72`, `12 gün`).
- **Sizes:** `arc-sm` (status glyph in lists, 20–24px) · `arc-md` (exercise card) · `arc-lg` (Today hero / Progress) .
- **States:** `empty` (track only) · `in-progress` (jade stroke, animates open on mount, `ease-arc`) · `complete` (stroke closes to marigold + `glow-success` once) · `reduced-motion` (static).
- **Meaning is configurable:** per-move completion, per-day completion, range-of-motion (Phase 2), long-term program %.
- A11y: exposes value + label to screen readers ("Diz açma, 2 / 3 set tamam").

### 6.2 Buttons
- `primary` (patient): full-bleed-ish, `pill`, `spruce` bg / white, `56` tall, thumb zone, one per screen.
- `primary` (clinician): `md` radius, `spruce`, compact.
- `secondary`: `jade` outline / `jade` text. `ghost`: text-only. `success` moments use `marigold` sparingly.
- States: hover (web), pressed (`spruce-press`), disabled (`ink-muted` on `line`), loading (inline spinner, label persists). Labels are verbs that match the resulting toast ([06](06-design-direction.md) voice).

### 6.3 Inputs & forms (mostly clinician)
- Large hit areas, `md` radius, `line` border, `spruce` focus ring (visible, 2px). Labels above (not placeholder-only). Inline validation gives direction, not blame. Number steppers for sets/reps (big +/− on patient self-adjust).

### 6.4 Cards
- `surface`, `e1`, `lg`/`md` radius. **ExerciseCard** (patient): demo thumb, name, `data` counts, `arc-md`, big `Başla` / `✓ Tamam`. **PatientRow** (clinician): name, `arc-sm` status, mono adherence %, last-activity, flags — scannable, one-click into detail.

### 6.5 Verification states (patient, camera)
- `placement` (silhouette/AR guide + "kameranı şöyle yerleştir"), `detecting` (calm live arc), `success` (arc closes + glow + haptic + "Doğru! Aynen böyle."), `retry` (encouraging, "bir daha deneyelim"), `fallback` ("Bunu yaptım" manual confirm + IMU tier). Never the words fail/wrong/error. 🔒 Always shows "telefonunda kalır" (stays on your phone).

### 6.6 Adherence heatmap (both surfaces)
- Calendar grid; cell intensity = `jade`→`marigold` for done, `line`/`ink-muted` neutral for missed (**no red**). Camera-verified vs manual shown by a subtle glyph, not a harsh color (honest but non-judgmental, FR-21). Patient view = encouraging; clinician view = analytical with trend line (mono axis labels).

### 6.7 Navigation
- Patient: bottom tab bar, **3 items** (Bugün / İlerleme / Profil), `spruce` active, large labels.
- Clinician: persistent left nav, patient-centric, `spruce` active state, keyboard navigable.

### 6.8 Feedback, toasts, empty & offline states
- Toasts: brief, action-matched ("Atandı"), `e2`, auto-dismiss. Empty states: warm invitation + single CTA. Offline: a calm inline banner ("Çevrimdışısın — kaydedildi, bağlanınca eşitlenecek"), never blocking; the daily loop continues.

### 6.9 Gamification components (Oyunlaştır, opt-in)
- `PointsReadout` (mono, counts up), `MilestoneCertificate` (quiet, framed, Source Serif 4 — *not* cartoon badge), `StreakChip` (with visible grace/freeze token), `ShareCard` (chosen stats + clinician name, on-brand arc graphic). All reuse the same tokens; just warmer/more marigold. No leaderboards, no FOMO.

---

## 7. Density modes (one system, two expressions)
| Aspect | Patient mode | Clinician mode |
|---|---|---|
| Base body | 17–18px | 15px |
| Spacing | larger steps | tighter steps |
| Card radius | `lg` | `md` |
| Color lean | paper + marigold warmth | mist + spruce focus |
| Primary actions/screen | exactly 1 | several allowed |
| Data display | minimal, friendly | dense, tabular mono |
| Motion | breath-paced | crisp/minimal |

Implement as a theme flag (`mode: 'patient' | 'clinician'`) selecting density + emphasis tokens, not a second design language.

---

## 8. Accessibility specs (component-level, binding)
- Targets ≥ 44px (patient primary 56); focus visible (web); SR labels on Arc, status glyphs, icon buttons.
- Contrast AA min / AAA patient body; status = color + icon + label always.
- Honor OS text scaling (test at 200%) and `prefers-reduced-motion`.
- Hit the `web-design-guidelines` skill for the web app; platform a11y for mobile. Verify patient flows on a low-end Android.

---

## 9. Localization
- Turkish-first; copy keys externalized from day one (i18n) so the architecture supports later locales ([04](04-prd.md) FR-35).
- Allow ~30% text expansion in layouts; verify Turkish glyphs (ı/İ/ğ/ş/ç/ö/ü) in all three faces at all weights.
- Mono for numbers/units; localize date/number formats (TR).

---

## 10. Do / Don't (the one-line guardrails)
- ✅ Green hero, marigold earned, clay for gentle attention. ❌ Clinical blue, alarm red, broken-streak punishment.
- ✅ The Arc as the progress language. ❌ Generic rings or bars.
- ✅ One calm action for the patient. ❌ Competing CTAs, tiny targets.
- ✅ Warm plain Turkish, verbs that match outcomes. ❌ Jargon, Title Case, apologetic errors.
- ✅ Subtle, merciful gamification. ❌ Cartoon badges, leaderboards, FOMO.

---

### Next
- The feeling behind these tokens: [06-design-direction.md](06-design-direction.md)
- Where they get applied: [05-information-architecture.md](05-information-architecture.md)
- Build sequence: [10-roadmap-and-phasing.md](10-roadmap-and-phasing.md)
