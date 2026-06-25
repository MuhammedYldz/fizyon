# Spec — Doctor: Program Builder (`d_build` + library / protocols / config / edit / record)

## Purpose
Let the physio assemble or adjust a patient's program **fast**: apply a ready protocol,
add single exercises from a library, record a custom move, and tune each exercise
(reps/sets/hold, frequency-per-day, note, camera-proof). Speed and reversibility matter.

## Who
Physiotherapist. **Web/desktop primary** (this is a "doing work" screen); mobile possible.

## Goal & flow
- See current program (each row editable + deletable, with live demo thumbnail).
- Add via: **Hazır program uygula** (condition-matched protocols, recommended first) ·
  **Tek hareket ekle** (categorized library: diz/bel/omuz/boyun/kalça/genel) ·
  **Kendi videonu kaydet** (camera capture → custom exercise).
- Config/edit sheet: reps, sets, **süre (hold)**, **günde kaç kez (freq)**, note,
  **kamerayla kanıt iste** toggle. Autosaves; "Bitir" returns.

## Key states
- **Default:** program list + 3 add actions.
- **Loading:** adding/saving shows progress; cloud writes don't block the UI silently.
- **Empty:** no exercises → "Henüz hareket yok, aşağıdan ekle" + obvious first action.
- **Error:** add/edit/delete failure → toast + state unchanged (no phantom rows).
- **Success:** add/edit/delete reflected immediately + toast; patient sees it (realtime/cloud).

## Acceptance criteria
- Every exercise is editable after adding (tap row → edit sheet, prefilled correctly).
- Protocol apply inserts all its exercises with correct defaults incl. freq and verify flag.
- Library category filter is accurate; demo thumbnails animate and match the exercise.
- Config inputs validate (numeric, freq ≥1); the camera-proof toggle persists.
- No data loss on navigation; autosave is reliable; deletions are clearly reversible or confirmed.
- Sheets are usable on mobile (scroll, large controls) and efficient on web.
