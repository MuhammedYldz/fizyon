# Fizyon — UX & Design System Guide

The single source of truth for how Fizyon looks and behaves. Every screen must obey this.

## 1. Product principles

1. **One thing, proven.** Fizyon's job is to make patients actually do their home exercises — and prove it. Every feature serves adherence.
2. **3-tap rule.** Any core action is reachable in ≤3 taps from the home screen of that role. If it takes 4, the navigation is wrong.
3. **Prevent mistakes, don't punish them.** Disable invalid actions, confirm destructive ones, autosave drafts, never lose a half-built program. Errors are inline, human, and in Turkish.
4. **Calm by default, motivating on demand.** Clinical surfaces (doctor) are quiet and data-dense. Patient surfaces are warm and encouraging. Gamification is opt-in and never shames.
5. **Accessible.** Min 16px body text, 44px tap targets, WCAG AA contrast, works one-handed, respects reduced-motion.

## 2. The 3-tap map

**Doctor** (home = patient list)
- See a patient's adherence → 1 tap (patient card)
- Build a new program → 2 taps (patient → "Yeni program")
- Adjust a patient's notifications → 3 taps (patient → ayarlar → bildirim)

**Patient** (home = today)
- Start today's exercise → 1 tap (play on the card)
- Verify with camera → 2 taps (exercise → "Kanıtla")
- Report "couldn't do" → 2 taps (exercise → "Yapamadım")

## 3. Visual identity

### Logo
An abstract figure mid-stride whose trailing motion arc resolves into a pulse/check. Conveys *movement that is verified*. Single-color, works at 24px (nav) and 512px (app icon). See `assets/logo.svg`.

### Color — "Healing teal + motivating coral"
Deliberately NOT generic medical blue. Teal = healing, calm, trust. Coral = energy, motivation, the gamified layer.

| Token | Light | Use |
|---|---|---|
| `--teal-600` #0E7C66 | primary | doctor brand, primary actions, links |
| `--teal-500` #149A7E | primary hover | |
| `--teal-50` #E6F4F0 | tint | selected states, fills |
| `--coral-500` #F2674A | accent | patient motivation, streaks, gamification |
| `--coral-50` #FCEAE5 | tint | reward surfaces |
| `--ink-900` #0F1A17 | text primary | |
| `--ink-500` #5C6B66 | text secondary | |
| `--ink-300` #9AA8A3 | text tertiary / hints | |
| `--line` #E4EAE8 | borders | |
| `--surface` #FFFFFF | cards | |
| `--bg` #F6F8F7 | page background | |
| semantic | success=teal, warn #C77A0E, danger #D64545 | states |

Dark mode tokens defined in `tokens.css` (every color has a dark counterpart).

### Typography
- **Plus Jakarta Sans** (Google Fonts) — friendly geometric sans, professional but human.
- Scale: h1 28/600, h2 22/600, h3 18/600, body 16/400, small 14/400, caption 12/500.
- Two weights only: 400 and 600. Numbers/timers use tabular figures.
- Sentence case everywhere. Turkish-first copy.

### Spacing & shape
- 4px base grid. Radii: sm 8, md 12, lg 16, pill 999.
- Cards: surface bg, 1px `--line`, radius-lg, 16px padding.
- Shadows: one elevation only (`0 2px 8px rgba(15,26,23,.06)`) for sheets/menus. Flat elsewhere.

### Buttons
- **Primary**: solid `--teal-600`, white text, radius-md, 48px tall, `active:scale(.98)`.
- **Accent**: solid `--coral-500` — only for motivation/rewards.
- **Secondary**: surface bg, 1px line, ink-900 text.
- **Ghost**: transparent, used in toolbars.
- **Danger**: text/border `--danger`, solid only on confirm.
- All buttons: 44px+ tap target, focus ring `0 0 0 3px teal@30%`, disabled = 40% opacity + no pointer.

## 4. Motion
- 150–200ms ease-out for enters, 120ms for taps. Screen transitions slide 12px + fade.
- Respect `prefers-reduced-motion`: drop transforms, keep opacity.

## 5. Security & privacy (health app — KVKK/GDPR mindset)
Demo uses local storage + simulated auth. Production requirements documented here so they're not forgotten:
- **Two registration types:** (a) e-posta + parola, (b) e-Devlet / SMS-OTP phone (Turkey-appropriate identity). Doctors additionally verify a professional license number.
- Health data is **special-category personal data** under KVKK Art. 6 → explicit consent, encryption at rest + in transit, data-minimization, right-to-erasure.
- No patient video leaves the device for verification — pose detection runs **on-device** (MediaPipe). Only the *result* (verified yes/no, duration) syncs.
- Role-based access: a doctor sees only their own patients; patients see only their own data.
- Audit log for every clinical action.

## 6. Notifications system
- **General** (per role defaults): reminders, streaks, appointment alerts — toggle channels (push/SMS/email) and quiet hours.
- **Patient-specific** (doctor-set): a doctor can override schedule/tone per patient (e.g. gentler nudges for an anxious patient, stricter for a non-adherent one), and set escalation ("if missed 2 days → notify me").

## 7. Gamification (opt-in, patient only)
- Off by default; one tap to enable. Never shames; framed around the patient's recovery journey.
- **Points** per verified exercise, **streaks**, **goals** (weekly), **gifts/rewards** (badges, milestone unlocks), and a **journey** map themed to their condition (e.g. knee-rehab path with stages). Doctor can see motivation level but it never affects clinical data.
