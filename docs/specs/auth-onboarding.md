# Spec — Auth & Onboarding

Screens: `welcome`, `reg_type`, `reg_form`, `login`, `demo_pick`, `reg_done`.

## Purpose
Get each user into the right experience with the least friction and maximum trust:
explain what the app is, let them register (as physio or patient), log in, or try a demo.

## Who
Both personas, before role is known. Physio likely on **web**; patient on **mobile**.
First impression must read as **trustworthy health software**, not a consumer toy.

## Goal & flow
- **Welcome:** one-line value prop + 3 clear paths: Üye ol / Giriş yap / Demo.
- **Register:** choose method (e-posta / telefon) → form (role: hasta/fizyoterapist; name;
  email+password or phone; physio license; patient links to physio via 6-char code) →
  **KVKK açık rıza** consent gate (required) → create account.
- **Login:** email + password → routed to role home.
- **Demo:** pick "fizyoterapist olarak gez" or "hasta olarak gez" (local sample data).
- **reg_done:** email-confirmation pending screen (when confirmation is on).

## Key states
- **Default:** forms with clear labels, sensible input types/keyboards (email/tel/numeric).
- **Loading:** submit button shows progress; inputs disabled; no double-submit.
- **Empty:** n/a (forms).
- **Error:** inline, specific, recoverable ("E-posta veya parola hatalı", "Bu e-posta zaten
  kayıtlı", "Geçerli bir telefon gir"); never a raw exception; phone-signup explains it
  needs an SMS provider (graceful).
- **Success:** routed to role home (or reg_done if confirmation pending) + confirmation toast.

## Acceptance criteria
- Consent checkbox is required; links to Privacy + Terms open and work.
- Validation prevents bad email/short password/invalid phone with specific inline messages.
- Role selection reveals the right fields (license for physio, physio-code for patient).
- Keyboard: full tab order, visible focus, Enter submits; screen-reader labels on every field.
- Demo never creates a real account; clearly labeled as demo.
- Works 320–1440px; mobile inputs ≥44px tall; primary button thumb-reachable on mobile.
- Trust cues present (KVKK note, on-device-camera promise) without clutter.
