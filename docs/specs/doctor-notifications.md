# Spec — Doctor: Notifications & Automatic Follow-up (`d_notifs` + per-patient notif sheet)

## Purpose
Let the physio set how the system nudges patients and escalates non-adherence —
generally and per-patient — so follow-up happens **without manual effort** (their autonomy goal).

## Who
Physiotherapist. **Web/desktop primary**; mobile usable.

## Goal & flow
- General settings: channels (push / SMS / e-posta), quiet hours.
- **Automatic follow-up (default rule):** if a patient is inactive N days → actions
  (bana bildir / hastaya hatırlat / ara / mesaj).
- Per-patient override: tone (nazik/normal/sıkı), reminder times, escalation days, actions —
  with a plain-language summary sentence of what will happen.

## Key states
- **Default:** general rule + per-patient list.
- **Loading:** toggles reflect saved state; saving is optimistic with confirmation.
- **Empty:** no patients → only general settings shown, with a hint.
- **Error:** save failure → revert toggle + toast.
- **Success:** change persists (cloud) + subtle confirmation; summary sentence updates live.

## Acceptance criteria
- The plain-language summary always matches the selected days + actions for that patient.
- Toggle/chip states are visually unambiguous (on vs off), with text not just color.
- Channels that aren't wired yet (e.g. SMS without provider) are honestly labeled, not fake-on.
- Controls are keyboard-operable with visible focus (web); ≥44px on mobile.
- Per-patient sheet pre-reflects current settings and persists changes.
