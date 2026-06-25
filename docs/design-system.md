# Fizyon — Design System (Step 2, proposed)

Files: `css/tokens.css` (tokens), `css/components.css` (primitives, all states),
`styleguide.html` (live reference — `http://localhost:5599/styleguide.html`).
**Not yet applied to the app** — Step 3 migrates screens onto these.

## How it fixes the Step 1 P0s (at the primitive layer)
- **P0-1 (black button borders):** global `button{ border:0; background:none }` reset. Every button
  now derives from `.btn`/`.icon-btn`; no UA-default `2px outset black` can appear.
- **P0-2 (text contrast):** `--text-muted #51635C` measures **5.6:1 on `--bg`** / 6.3:1 on white.
  The failing `#9AA8A3` is demoted to `--text-disabled` (disabled, non-essential only). Captions
  and secondary text use `--text-muted`.
- **P0-3 (no focus):** one `:focus-visible{ box-shadow: var(--focus-ring) }` rule applies a designed
  teal ring to **all** interactive elements (buttons, links, inputs, switches, tabs).

## Tokens (semantic, not one-off values)
- **Color:** brand teal ramp (700→50) + coral accent (use sparingly); calm semantics —
  `--success` (teal), `--attention` (amber = "needs attention/pending"), `--error` (red, **true
  errors only**). Data-viz bands avoid alarming red (`--chart-high/mid/low`).
- **Surfaces/text:** `--bg`, `--surface`, `--surface-2`, `--border`/`--border-strong`;
  text = `--text-strong / --text / --text-muted` (all AA), `--text-disabled` (disabled only).
- **Type:** UI = Plus Jakarta Sans; display = Fraunces (restraint: H1/H2 + key numerals only).
  Scale: display 30 · h2 22 · h3 18 · **body 16 (min)** · sm 14 · xs 12.5.
- **Spacing:** 8px base — 4/8/12/16/20/24/32/40/48/64.
- **Radius:** xs 6 · sm 9 · md 12 · lg 16 · xl 22 · pill.
- **Elevation:** soft `--shadow-sm/shadow/lg` (low-spread, calm).
- **Ergonomics:** `--tap-min 44px`, `--control-h 44` (web), `--control-h-lg 52` (patient/mobile),
  `--sidebar-w 248`, `--content-max 1080`.
- **Motion:** `--ease`, `--dur-1/2`; fully disabled under `prefers-reduced-motion`.

## Components (every state — see styleguide)
- **Button:** primary / secondary / ghost / danger / icon; default·hover·active·disabled·loading
  (`aria-busy`); `--lg` block variant for mobile primary (≥52px, thumb).
- **Input:** default·focus·error·disabled + textarea; designed brand/red focus rings.
- **Card / list-row:** default·hover·active·selected (brand rail); rows ≥44px.
- **Switch:** real on/off toggle (replaces ambiguous "Açık/Kapalı" chips) — off·on·disabled·focus.
- **Chip / Segmented:** default·selected (`aria-pressed`/`aria-selected`)·disabled.
- **Stat / Progress / Table:** carded KPIs (risk = amber, not red); web table for triage density
  showing adherence value **and** reason together (fixes P1-6).
- **Nav:** web sidebar item (persists; default·hover·active) + mobile tab bar (labels always on, fixes P2-9).
- **Feedback states:** inline alerts (success/attention/error), designed **empty** state, **loading skeleton**.
- **Overlay:** centered modal (web) + bottom sheet (mobile).

## Two-surface rules
- **Web/physio:** persistent sidebar + `--content-max` multi-column; `.btn` 44px; tables for density;
  hover states; keyboard focus everywhere.
- **Mobile/patient:** single column; primary action `--lg` (52px) in the thumb zone; bottom tab bar
  with labels; calm spacing; everything ≥44px.

## Step 3 plan (after approval)
Migrate the app onto these: load tokens/components, refactor `styles.css` to reference tokens, then
one screen at a time (web first, then its mobile adaptation), re-screenshot at both viewports, and
confirm each screen resolves its audit defects and meets its Step-0 spec.
