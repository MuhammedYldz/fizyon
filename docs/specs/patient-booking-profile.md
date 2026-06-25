# Spec — Patient: Appointment Booking (`bookSheet`) & Profile (`p_profile`)

## Purpose
- **Booking:** let the patient get/secure their next appointment — open the physio's
  external booking link, or pick from the physio's internal open slots.
- **Profile:** the patient's account hub — gamification toggle, accessibility (büyük yazı),
  privacy/terms, logout.

## Who
Patient. **Mobile primary.** Low effort, calm, large targets.

## Goal & flow
- Booking: if physio has an external link → "Randevu sayfasını aç". Else → list of open
  slots (date · time) → tap to book → next appointment updates.
- Profile: identity, gamification on/off, büyük-yazı toggle, privacy/terms, logout.

## Key states
- **Default:** booking options / profile.
- **Loading:** booking shows progress; toggles reflect saved state.
- **Empty:** no open slots → "Şu an açık randevu yok, fizyoterapistin saat ekleyince görünür".
- **Error:** book failure → toast, slot stays available; load failure → retry.
- **Success:** slot booked → next appointment reflects it + toast.

## Acceptance criteria
- External link opens in a new tab/window safely (noopener); internal slots book reliably.
- A booked slot immediately disappears from the open list and shows as the next appointment.
- Toggles are unambiguous (text + state), persist, and are ≥44px.
- Logout fully clears session and returns to welcome.
- Empty/booked/error states are all calm and clear to an unwell user.
