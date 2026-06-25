# Spec — Cross-cutting: States, Auth Modes, Sync, i18n

Applies to every screen; the audit (Step 1) checks each screen against these too.

## Purpose
Define the shared behaviors and conventions so screens are consistent and trustworthy:
how data loads, how demo vs cloud differ, how doctor→patient sync works, and the universal
state + accessibility conventions.

## Who / surfaces
Both personas. Conventions must hold on web (physio) and mobile (patient).

## Behaviors & conventions
- **Auth/data modes:** *Demo* (local sample data, clearly labeled, no real account) and
  *Cloud* (real Supabase account, RLS-scoped). Boot resumes the right mode silently.
- **Doctor→patient sync:** changes a physio makes (program, note, appointment) appear on the
  patient side **instantly** (Supabase Realtime) without manual refresh, without disrupting
  an in-progress exercise/camera session.
- **Universal states:** every data view defines default / **loading (skeleton, not blank)** /
  **empty (helpful, not dead-end)** / **error (specific, recoverable)** / success (confirmed).
- **Feedback:** every mutation confirms (toast) and reflects immediately; failures revert.
- **i18n:** Turkish-first; copy is plain, active voice; an action keeps its name across a flow
  (button "Kaydet" → toast "Kaydedildi").

## Accessibility & quality (global)
- WCAG AA contrast on text and meaningful UI; never color-only signaling.
- Body text ≥16px; visible keyboard focus; logical tab order; screen-reader labels/roles.
- Every interactive element: hover / focus / active / disabled / loading feedback.
- Touch targets ≥44×44px on mobile; primary actions in the thumb zone.
- `prefers-reduced-motion` respected; no layout breakage 320→1440px+.

## Acceptance criteria
- No screen ever shows a raw blank, a spinner-forever, or an unhandled error to the user.
- Demo and cloud are visually consistent; demo is always labeled as demo.
- A physio edit is visible to the logged-in patient within seconds, no refresh.
- All copy is Turkish, consistent in terminology and voice across flows.
- Token-driven styling only (post Step 2): no magic numbers, consistent across screens.
