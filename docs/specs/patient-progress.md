# Spec — Patient: Progress (`p_history`, `p_journey`, `p_achievement`)

## Purpose
Show the patient their effort and progress in a motivating, **pressure-free** way:
a factual daily history (incl. verified/unverified), and opt-in gamification (points,
streak, weekly goal, recovery stages, badges) with a shareable achievement card.

## Who
Patient. **Mobile primary.** Motivation must feel supportive, never shaming.

## Goal & flow
- **History (`p_history`):** per-day log; per exercise: count + **kanıtlı / kanıtsız** badges.
- **Journey (`p_journey`):** points, streak, weekly-goal progress, recovery-stage track,
  reward badges (locked/unlocked); opt-in (off → calm explainer + enable).
- **Achievement (`p_achievement`):** condition-free shareable card (physio name + totals);
  share / download (canvas PNG, Web Share).

## Key states
- **Default:** history populated; journey/achievement if gamification on.
- **Loading:** skeleton day cards.
- **Empty:** no sessions yet → "İlk seansını yap, burada görünsün" (encouraging).
- **Error:** load failed → gentle retry.
- **Success:** share/download gives feedback.

## Acceptance criteria
- History matches the session log; verified vs unverified counts are accurate per day.
- Gamification is genuinely optional and clearly toggleable; off-state is calm, not nagging.
- Streak/goal never shame the patient for a missed day (supportive framing).
- Achievement card contains **no health/condition data** (safe to share publicly).
- Share works where supported; download fallback otherwise; both confirm.
- Large legible type; badges have text labels (not icon-only); ≥44px controls.
