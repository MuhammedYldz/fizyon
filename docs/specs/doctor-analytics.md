# Spec — Doctor: Analytics (`d_analytics`)

## Purpose
Give the physio a practice-level read on adherence: average adherence, how many patients
are at risk, comparison across patients, and the weekly trend — so they can prioritize.

## Who
Physiotherapist. **Web/desktop primary** (charts benefit from width); mobile readable.

## Goal & flow
- Top: key numbers (ortalama uyum %, risk altında count).
- Comparison chart (adherence per patient) + weekly trend chart.
- Reading this should suggest *who* to act on (ties back to patient list triage).

## Key states
- **Default:** numbers + two charts populated.
- **Loading:** chart areas show skeletons; numbers show placeholder, not "NaN".
- **Empty:** no patients / no data → explanatory empty state, not blank canvases.
- **Error:** chart fails → inline message + retry; layout doesn't collapse.
- **Success:** n/a (read-only).

## Acceptance criteria
- Numbers are correct and never render NaN/undefined when there are 0 patients.
- Charts are labeled (axes, units %), legible, color-consistent with the rest of the app,
  and not clipped at any width.
- "Risk altında" definition is consistent with the patient-list flagging.
- Color is not the only encoding (accessibility): include labels/values.
- Mobile: charts resize without overflow; numbers remain legible.
