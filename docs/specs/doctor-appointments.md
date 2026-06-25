# Spec — Doctor: Appointments (`d_appts`)

## Purpose
Let the physio offer appointments either via their **own external booking link** (Calendly
etc.) or a **simple internal slot system** (open free slots; patients book them).

## Who
Physiotherapist. **Web/desktop primary**; mobile usable.

## Goal & flow
- Set/save external booking URL (optional).
- Add internal open slots (date + time); see slots list with **boş / dolu (which patient)**;
  delete open slots.
- Patient side consumes these (see patient-booking spec).

## Key states
- **Default:** booking-link field + add-slot form + slots list.
- **Loading:** add/delete shows progress; cloud writes confirmed.
- **Empty:** no slots → "Henüz uygun saat eklemedin" + the add affordance.
- **Error:** add/delete/save failure → toast; list unchanged.
- **Success:** slot added/removed reflected immediately + toast; booking URL saved + toast.

## Acceptance criteria
- Date+time validates (no past-only nonsense; requires a date); formatted clearly (TR).
- Booked slots show the booking patient's name and cannot be deleted as if free.
- Booking URL persists and is what the patient is sent to.
- Inputs are labeled, keyboard-operable, ≥44px on mobile.
- Clear separation between the two mechanisms (external link vs internal slots) so the
  physio understands which the patient will see.
