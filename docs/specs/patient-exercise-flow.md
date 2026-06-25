# Spec — Patient: Exercise Flow (`p_exercise`, `p_verify`, `p_done`, feedback/pain sheet)

## Purpose
Guide the patient through one exercise **set by set**, then let them **prove the session**
(camera) or complete it unverified, or report they couldn't do it (with pain). One session
= one full run (all sets); proof is once per session; `freq` sessions are needed per day.

## Who
Patient. **Mobile primary** (may be mid-movement, tired, in pain). Calm, large, forgiving.

## Goal & flow
- **Player:** demo animation + plain movement cue + target; **set counter** (dots + "Set
  x/N"); per-set timer/“Seti başlat”; after the last set → finish options appear.
- **Finish:** "Kamerayla kanıtla" (→ camera) OR "Kanıtsız tamamla". Always available:
  "Yapamadım" → feedback sheet (reason + **pain 0–10** + optional note).
- **Verify (`p_verify`):** on-device camera + skeleton overlay; movement-aware counting/hold
  with calibration; live progress; **"Kamerasız doğrula"** fallback if no camera.
- **Done (`p_done`):** calm success; session logged (verified/unverified); advances guided session.

## Key states
- **Default:** player on set 1.
- **Loading:** camera "başlatılıyor / kalibre ediliyor" with clear guidance.
- **Empty:** n/a.
- **Error:** camera unavailable/denied → clear explanation + "Kamerasız doğrula" path (never a dead end).
- **Success:** set complete → advances; session complete → "Doğrulandı/Tamamlandı" + logged.

## Acceptance criteria
- Set counter increments per completed set and **stops after the last set** (no infinite repeat);
  dots reflect completed sets.
- Camera-proof option appears on **every** exercise; completing unverified is logged as
  "kanıtsız" in that day's history.
- Privacy promise visible on the camera screen: video stays on-device, only the result is sent.
- Camera permission denial degrades gracefully to the no-camera path.
- Pain capture is 0–10, optional note; submitting routes back / advances and reaches the physio.
- Timers/controls are large, thumb-reachable; legible at arm's length; calm (no harsh red).
