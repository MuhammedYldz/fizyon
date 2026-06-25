# Spec — Doctor: Patient List & Triage (`d_patients`)

## Purpose
The physiotherapist's home base. In seconds, answer: **who needs my attention and why**,
and let me jump to that patient. This is the screen that delivers the physio's real goal
(adherence) — it must triage, not just list.

## Who
Physiotherapist. **Web/desktop primary** (dense, scannable, keyboard); usable on mobile.

## Goal & flow
- Land → immediately see a **"Dikkat gerekenler"** group (low adherence and/or new
  pain/feedback) surfaced first, then the rest of the roster.
- Each row: avatar/initials, name, condition · week, adherence %, and a reason chip when
  flagged (pain / "yapamadım" / low adherence).
- Click a row → patient detail. Add a new patient via a clear primary action.
- (Web) should support keyboard navigation and be comfortable at desktop width.

## Key states
- **Default:** attention group + roster, each with adherence color coding.
- **Loading:** skeleton rows (not a spinner-only blank).
- **Empty:** no patients yet → guidance to share physio code / invite first patient.
- **Error:** data load failed → inline retry, roster not silently blank.
- **Success:** n/a (read screen); adding a patient routes to that patient.

## Acceptance criteria
- Flagged patients always sort above healthy ones; flag reason is explicit and accurate.
- Adherence color coding is consistent and legible (and not the only signal — text too,
  for accessibility / color-blindness).
- Row is a large, obvious click/tap target; hover/focus state on web; ≥44px on mobile.
- Counts (total patients, attention count) are correct and match the rows shown.
- Scales: dense multi-column comfort on desktop; single-column calm list on mobile.
- Empty state is genuinely helpful (next action), not a dead end.
