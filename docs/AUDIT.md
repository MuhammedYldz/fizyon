# Fizyon — Step 1 Adversarial Audit

**Default assumption: NOT ready to ship.** Real screenshots captured at 1440×900 (web/physio)
and 390×844 (mobile/patient) in `/audit/`, driven through both persona flows with Playwright +
Chromium. Findings are tied to specific screenshots and, where possible, measured values.
Severity: **P0** ship-blocker · **P1** serious · **P2** polish.

## Verdict
The app is coherent in *concept* but **not at enterprise quality**. Three measured, systemic
defects alone block shipping (a UA-default black border on every ghost button; secondary text
that fails WCAG AA at ~2.2:1; no visible focus). On top of that, the "web app" is a blown-up
phone — it never uses desktop density, so the physiotherapist's primary surface fails its job.

---

## Systemic defects (hit every screen) — ranked

### P0-1 · Ghost/icon buttons render with the browser-default `2px outset black` border
Measured on `[data-act="msg-doctor"]`: `border: 2px outset rgb(0,0,0)`. There is **no global
`button` border reset**; `.btn` sets `border:1px solid transparent` but `.btn-ghost` and bare
icon `<button>`s don't, so they inherit the UA default. Visible as harsh black rectangles on:
welcome "Demo olarak gez", patient "mesaj" icon, "değiştir", "Egzersiz geçmişim", and more.
Reads as broken/unfinished — the single biggest "university project" tell.

### P0-2 · Secondary text fails WCAG AA contrast (~2.2:1)
`.hint` = `#9AA8A3` on `#EFF4F1` ≈ **2.2:1** (AA needs 4.5:1). `.hint` carries almost all
secondary info: exercise metadata ("10×3 · 30 sn"), "günde N kez", slot status "Boş", section
subtitles, the welcome **trust line**, reminder text. Pervasive — and worst for the older/unwell
patients who most need legibility.

### P0-3 · No visible focus on ghost/icon buttons
Measured `outline: rgb(14,124,102) none 1.5px` (style = none) on `.btn-ghost`. `.btn:focus-visible`
has a teal ring, but ghost/icon/many controls have none → keyboard users (physio on web) get no
focus indicator. Fails the keyboard-accessibility bar.

### P1-4 · No real desktop adaptation (physio/web fails "dense & efficient")
Every screen is a single ~820px centered column; detail/builder/appointments **drop the sidebar
entirely**. Result on 1440px: giant full-width mobile-style buttons, ~700px empty gaps mid-row,
50–60% blank canvas, charts stacked 1-up. The clinician surface is a stretched phone — the
opposite of the spec's "denser and faster."

### P1-5 · Alarming colour for benign states
Pure-red "Dikkat gerekenler" heading + full red card border (patient list); Analytics "Risk
altında **2**" in red; a red comparison bar; amber "0/2 bugün" pills for "not done *yet* today."
Violates "no alarming reds except true errors." Apple Health/Headspace stay calm here.

### P1-6 · Inconsistent flag semantics weaken triage (the list's core job)
On the patient list, some rows show a *reason* chip ("Ağrı oldu"), others a *metric* chip
("%41 uyum"); reason-flagged rows **hide their adherence %**. The physio can't compare patients
at a glance — the one thing this screen exists to do.

### P1-7 · Undesigned interactive states
Toggle chips "Açık/Kapalı" differ only by a faint outline colour (not an unambiguous on/off);
selected vs unselected action chips are near-identical; hover/active largely undefined.

### P1-8 · Brand/identity glitches
Sidebar "✓ Fizyon" is duplicated by a second "✓ Fizyon" in the content header on every web tab.
The welcome **logo is hidden for 1.5s** (`.wh-logo{animation:wh-pop … 1.5s both}` starts at
opacity 0), so the first impression is a floating arc with no mark.

### P2-9 · Icon-only mobile nav
Bottom nav shows labels only on the active tab; chart/map/bell/person are unlabeled (map = "Yolculuk"
is unintuitive) — weak for a tired patient.

### P2-10 · Misc polish
Native unstyled date/time inputs (appointments) clash with the custom UI; heavy gradient+glow
buttons read consumer-y vs clinical restraint; the demo "gray body" figure looks uncanny at full
size; spacing/radii are magic numbers, not a scale.

---

## Per-screen scorecards (1–5; justification tied to the screenshot)

> Dimensions: VC visual-consistency · Ty typography · Sp spacing/align · TE touch-ergonomics(mobile) ·
> Ef efficiency(web) · CS clarity-of-state · A11y accessibility · Tr trust. "—" = not the primary axis.

### Welcome — `mob-01` (patient · mobile primary)
**VC 2 · Ty 4 · Sp 2 · TE 3 · CS 3 · A11y 2 · Tr 2**
- Logo absent on load (1.5s opacity-0 delay) → arc floats with no brand mark. *(Tr)*
- "Demo olarak gez" wrapped in a harsh black box (P0-1). *(VC, Tr)*
- Entire top ~50% is empty; H1 "kazan." nearly touches the right edge. *(Sp)*
- Trust line "Sağlık verilerin KVKK…" is the lowest-contrast text on the screen (#9AA8A3). *(A11y, Tr)*
- Two full-width pills + one bordered tertiary = inconsistent button hierarchy. *(VC)*

### Patient list & triage — `web-05` (physio · web primary)
**VC 2 · Ty 3 · Sp 2 · Ef 2 · CS 3 · A11y 2 · Tr 3**
- Brand duplicated (sidebar + content header). *(VC)*
- Inconsistent chips: reason vs metric; flagged rows hide adherence %. *(CS, Ef)* (P1-6)
- "Yeni hasta ekle" is a giant full-width mobile CTA, not a web toolbar action. *(Ef)*
- ~60% empty canvas + ~700px dead gap between row text and chevron. *(Sp, Ef)*
- Red "Dikkat gerekenler" card border is alarming for routine triage. *(Tr)* (P1-5)
- Adherence shown by colour only; condition text is #9AA8A3. *(A11y)*

### Patient detail — `web-06` (physio · web primary)
**VC 2 · Ty 3 · Sp 2 · Ef 2 · CS 2 · A11y 2 · Tr 3**
- Title "Ayşe Kaya" duplicated (appbar + big header). *(VC)*
- Green "1/1 bugün" and amber "Bugün 1 kez kanıtsız" on the same card = contradictory signal. *(CS)*
- Patient-reported **pain 0–10 not shown** as a value (spec requires it) — only "Ağrı oldu". *(CS)*
- Amber "0/2 bugün" pills imply warning for a neutral "not done yet" state. *(Tr)* (P1-5)
- Sidebar removed → no cross-nav; single narrow column on 1440. *(Ef)* (P1-4)
- Inline edit pencil is a tiny bordered box mid-sentence — poor affordance/target. *(A11y, Sp)*

### Program builder — `web-07` (physio · web primary)
**VC 2 · Ty 3 · Sp 2 · Ef 1 · CS 3 · A11y 2 · Tr 2**
- Two competing teal primaries ("Hazır program uygula" + "Bitir"). *(VC, CS)*
- Add actions are full-width stacked mobile buttons; library hidden behind a sheet; ~60% empty. *(Ef)* (P1-4)
- Trash buttons: alarming red, no confirm, black-bordered, vertically misaligned across cards. *(A11y, Sp)* (P0-1, P1-5)
- "düzenle" (a primary action) is tiny gray inline text — undiscoverable. *(Ef, A11y)*
- First exercise's demo thumbnail is near-invisible (low-contrast reclined figure) vs others. *(VC)*

### Analytics — `web-10` (physio · web primary)
**VC 2 · Ty 3 · Sp 2 · Ef 2 · CS 3 · A11y 2 · Tr 2**
- KPIs ("%49", "2") are naked text, not cards — inconsistent with the carded charts. *(VC)*
- "Risk altında 2" in pure red. *(Tr, A11y)* (P1-5)
- Comparison bars colour-coded by band with **no legend**; colour-only meaning. *(A11y)*
- "Haftalık trend" source is ambiguous (it's patient[0], not practice-wide). *(CS)*
- Two charts stacked 1-up; right third of each card + page empty. *(Ef, Sp)* (P1-4)

### Notifications — `web-11` (physio · web primary)
**VC 3 · Ty 3 · Sp 2 · Ef 2 · CS 2 · A11y 2 · Tr 3**
- "Açık/Kapalı" toggles differ only by faint outline colour — not an unambiguous switch. *(CS, A11y)* (P1-7)
- "Sessiz saatler 22:00–07:00" looks like a setting but has no edit affordance. *(CS)*
- Selected vs unselected action chips are near-identical. *(CS)*
- Big dead gap between label and toggle; ~40% empty width. *(Sp, Ef)*
- "Hastaya özel" subtitle is #9AA8A3 (fails AA). *(A11y)* (P0-2)

### Appointments — `web-13` (physio · web primary)
**VC 2 · Ty 3 · Sp 2 · Ef 2 · CS 3 · A11y 2 · Tr 2**
- Section subtitles in #9AA8A3 (fail AA); "Boş" status is the faintest text. *(A11y)* (P0-2)
- Full-width stacked buttons on desktop; sidebar removed. *(Ef)* (P1-4)
- Native unstyled date/time inputs clash with the design. *(VC)* (P2-10)
- Delete = alarming red, no confirm, black-bordered. *(A11y, Tr)* (P0-1, P1-5)
- Flat slot list, no date grouping (won't scale; "26 Haziran" repeats). *(Ef, CS)*

### Today / home — `mob-03b` (patient · mobile primary)
**VC 1 · Ty 3 · Sp 2 · TE 2 · CS 3 · A11y 2 · Tr 2**
- Ghost buttons (message icon, "Egzersiz geçmişim") render black boxes → screen looks buggy. *(VC, Tr)* (P0-1)
- "Egzersiz geçmişim" 150×**37px**, "değiştir" 70×**38px** — below the 44px min. *(TE)*
- Icon-only nav (map/person) unlabeled. *(A11y)* (P2-9)
- "0/2 kez" (key adherence signal) is tiny unstyled gray text. *(CS, A11y)*
- Camera-proof badge is an unlabeled icon pill; row has two affordances (circle + play). *(CS)*
- Exercise metadata in #9AA8A3 (fails AA). *(A11y)* (P0-2)

### Exercise player — `mob-04` (patient · mobile primary)
**VC 2 · Ty 3 · Sp 2 · TE 3 · CS 3 · A11y 2 · Tr 2**
- The giant gray "body" figure is uncanny/headless-looking — off-putting for a calm health app. *(Tr, VC)*
- "Hazır animasyon" badge overlaps the figure's head. *(Sp)*
- Metadata "2/3 · 10×3 · 30 sn tut · bugün 1. kez (2 gerek)" is cryptic number soup. *(CS)*
- Cue text + "saniye tut" label are low-contrast; the timer ring track is nearly invisible. *(A11y)* (P0-2)
- "Yapamadım" is a full-width button equal in weight to the primary + a sad-emoji (off-tone). *(VC)*
- Set dots are tiny, very light gray — weak set-progress signal. *(CS)*

### Cross-surface spot checks
- **Patient on web (`web-14`)**: the mobile layout is stretched to 820px — giant full-width
  "Seansa başla", ~700px gaps in rows, multiple black-box ghost buttons. No desktop adaptation.
- **Doctor on mobile (`mob-12`)**: nav renders cleanly here (confirms the patient-today glitch is
  the ghost-border bug), but the red "Dikkat gerekenler" + icon-only nav + ~45% empty space remain.

### Captured but not yet deep-read (share all systemic defects; need the same teardown)
`web-08/09` (protocol/library sheets), `web-12`/`mob-11` (profiles), `mob-02` (demo pick),
`mob-05` (pain sheet), `mob-07` (booking sheet), `mob-08` (history), journey/achievement (nav
mis-stepped in capture). All inherit P0-1/P0-2/P0-3 at minimum.

---

## Benchmark vs trusted health software
- **Apple Health** — data in clean cards, generous type, no alarming colour, clear hierarchy.
  Fizyon's naked KPIs, red risk number, and 2.2:1 metadata fall short.
- **Headspace** — calm, warm, one focus per screen, soft palette. Fizyon's patient screens share
  the intent but are undercut by the black-box bug, the uncanny figure, and low contrast.
- **Good clinical tools / Linear** — dense, keyboard-first, designed states, always-visible focus.
  Fizyon's web is sparse, mouse-only, with no focus ring — the opposite.

## Recommended direction for Step 2 (design system)
Fix the three P0s at the token/primitive layer (button border reset + a real `--text-muted` that
passes AA + a designed focus ring), introduce a true web layout (sidebar persists, multi-column,
toolbar actions, 2-up charts), a calm semantic palette (reserve red for true errors; use neutral/
amber-sparingly for "pending"), consistent chips/toggles/switches, and a legible type+spacing scale.
