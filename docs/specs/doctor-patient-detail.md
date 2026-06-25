# Spec — Doctor: Patient Detail (`d_patient`)

## Purpose
The full picture of one patient and the place to act on them: see adherence trend,
today's session status (incl. verified vs unverified), pain/feedback, the prescribed
program, and next appointment — then edit the program, send a note, or set an appointment.

## Who
Physiotherapist. **Web/desktop primary**; usable on mobile (e.g. during a visit).

## Goal & flow
- Header: patient identity, condition · week (editable), adherence %, streak.
- Adherence chart (last 7 days).
- Program list: each exercise with reps×sets/hold, **freq (günde N kez)**, today's
  done/needed count, camera-proof requirement, and a **"kanıtsız" flag** when sessions were
  completed without proof.
- Feedback: "yapamadım" reasons + **pain 0–10** (color-coded); doctor can reply with a note.
- Next appointment (editable). Entry to program builder ("Düzenle").

## Key states
- **Default:** all sections populated.
- **Loading:** chart + lists show skeletons.
- **Empty:** no program yet → clear "add program" prompt; no feedback yet → quiet hint.
- **Error:** a failed section shows inline error + retry, others still render.
- **Success:** edits (note, appointment, condition/week) confirm via toast and persist.

## Acceptance criteria
- Today's per-exercise count = sessions done today vs `freq`; "kanıtsız" badge appears iff
  ≥1 unverified session today; matches the patient's own history/log.
- Pain ≥7 is visually distinct (warning, not panic-red) and scannable.
- Chart is readable, labeled, and not clipped at any width.
- Edit affordances (condition/week, note, appointment) are discoverable and reversible.
- Verified vs unverified is unambiguous to the clinician at a glance.
- Mobile: sections stack cleanly; chart legible; actions reachable.
