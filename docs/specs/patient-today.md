# Spec — Patient: Today / Home (`p_today` + reminder, doctor note)

## Purpose
The patient's anchor screen. Answer one question calmly and immediately: **what do I do
today, and am I done?** Plus their physio's note, next appointment, and a gentle reminder.

## Who
Patient. **Mobile primary** (tired, possibly one-handed, low motivation). Must be calm,
simple, one obvious action.

## Goal & flow
- Top: who's caring for me (physiotherapist name) + (optional) streak.
- Today's progress: N exercises, X/N done, progress bar.
- **Primary action:** "Seansa başla" (guided run through unfinished exercises) — thumb-reachable.
- Exercise list: each with reps×sets/hold, **today's done/needed count** when freq>1,
  camera-proof badge, done check.
- Physio note (encouraging), next appointment (→ booking), "Egzersiz geçmişim" link, reminder time.

## Key states
- **Default:** program + progress + note.
- **Loading:** skeleton list; no jarring blank.
- **Empty:** no program assigned yet → reassuring "Fizyoterapistin henüz program eklemedi" (not an error).
- **Error:** load failed → gentle retry; never a raw failure to an unwell user.
- **Success:** all done → calm "Bugünü tamamladın 🎉" state, not a hard stop.

## Acceptance criteria
- Primary action is the single most prominent element and within thumb reach on mobile.
- Done/needed counts and progress bar match the session log exactly.
- Type is large and legible (16px+; key numbers larger); ample spacing; no cramped rows.
- Tone is encouraging, never guilt-inducing, even when behind.
- Tap targets ≥44px; entire exercise row is tappable.
- Calm visual hierarchy: one screen, one main job; secondary info recedes.
