# Spec — Doctor: Add Patient (`d_newpatient` + invite) & Profile (`d_profile`)

## Purpose
- **Add patient:** create a patient record fast (name, condition/region, treatment week),
  or invite the patient to self-register and auto-link via the physio's share code.
- **Profile:** the physio's account hub — share code (copyable), entry to Appointments,
  accessibility (büyük yazı), privacy/terms, logout.

## Who
Physiotherapist. **Web/desktop primary**; mobile usable.

## Goal & flow
- Add: minimal form → create → land on that patient's detail to build their program.
- Invite: show 6-char physio code + copy; patient enters it at signup to auto-link.
- Profile: identity, share code + copy + invite, Randevular link, büyük-yazı toggle,
  privacy/terms links, logout.

## Key states
- **Default:** form / profile populated.
- **Loading:** create shows progress; copy gives feedback.
- **Empty:** new physio with no patients → invite/share-code is prominent.
- **Error:** create failure → inline message; name validation (min length).
- **Success:** patient created → routed to detail + toast; code copied → toast.

## Acceptance criteria
- Name required + validated; condition/week optional with sensible defaults.
- Share code is correct, legible (spaced/large), and copy works (with fallback) + feedback.
- Profile actions are reachable by keyboard (web) and ≥44px (mobile).
- Logout fully clears session (and unsubscribes realtime) and returns to welcome.
- Büyük-yazı toggle visibly scales type/targets and persists.
