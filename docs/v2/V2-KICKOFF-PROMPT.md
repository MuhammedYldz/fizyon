# Fizyon v2 — kickoff prompt (paste this into the new session)

> Copy everything below the line into the new session. Before you do: have a **fresh GitHub
> fine-grained PAT (Contents: Read-write)** for `MuhammedYldz/fizyon` ready, plus the Cloudflare
> + Supabase tokens. v1.0.0 is safe (git tag + current production), so v2 work can't lose it.

---

You are the lead engineer + product designer taking **Fizyon** from **v1.0.0 → v2**: a *massive,
PRD-driven improvement* (and, where the PRD justifies it, a redesign). **Do NOT rebuild from
scratch** — reuse everything in v1 that works; upgrade/replace only where the PRD demands. The
bar is a **real, shippable app with no major UX or functional flaws** for either user.

## What Fizyon is
Turkish-first physiotherapy home-exercise app, B2B (physiotherapist pays, patient free). Two users:
- **Physiotherapist** — clinician, **web/desktop-primary**, busy/efficient; prescribes programs, tracks adherence.
- **Patient** — **mobile-primary**, often unwell/tired; does the program at home and **proves each session via on-device camera pose detection**.
Live at **https://app.fizyon.net**.

## Source of truth for v2 = the PRD package
Read **ALL 14 docs** in `/Users/muhammedyildiz/Desktop/BoxCommerce-Test-Automation/fizyon-prd/`:
`00-vision-and-strategy, 01-personas-and-jtbd, 02-user-journeys, 03-competitive-and-market,
04-prd (16 epics, ~40 user stories, 36 numbered FRs), 05-information-architecture,
06-design-direction, 07-design-system, 08-technical-architecture, 09-data-model,
10-roadmap-and-phasing, 11-metrics-and-analytics, 12-risks-and-open-questions, README`.
This package is the v2 spec — defer to it.

## Current state = v1.0.0 (build ON it)
App at `/Users/muhammedyildiz/Desktop/Fizyon` — a **vanilla-JS PWA** (no framework):
- `js/app.js` — the whole SPA: a stack router, a `screens` object (one function per screen returning an HTML string), and one global click-delegation handler (`data-act`/`data-go`/`data-nav`). ~1100 lines.
- `js/data.js` (seed/demo state + persistence), `js/api.js` (Supabase auth+data), `js/demos.js` (SVG exercise animations), `css/styles.css` (design tokens + components). Design-system reference: `css/tokens.css`, `css/components.css`, `styleguide.html`.
- Backend: Supabase project **nvqtfikmfrvwgedqluav**, schema + RLS in `supabase/schema.sql`. Two modes: **demo** (localStorage) and **cloud** (real account, RLS-scoped).
- v1 already includes: onboarding/auth (email + KVKK consent gate), doctor patient-list/triage + 2-col detail + program builder (toolbar, delete-confirm) + analytics + notifications (switches) + appointments (external link + internal slots); patient Today + exercise player (per-set counter) + **session-based camera verification** (MediaPipe BlazePose Lite via CDN; movement-aware rep/hold scoring; "Kamerayla kanıtla" on the player) + gamification/journey + daily history; **Supabase Realtime** doctor→patient sync; web-push subscription scaffold; a calm design system (teal `#0E7C66` + coral, Fraunces + Plus Jakarta Sans, WCAG-AA text, designed focus rings, real switches, centered-modals-on-web, persistent web sidebar).
- v1 process docs at `/Users/muhammedyildiz/Desktop/Fizyon/docs/` — **read `PRODUCT_BRIEF.md`, `specs/`, `AUDIT.md`, `design-system.md`** so you know exactly what v1 covers and at what quality.

## STEP 0 — gap analysis first (show me, then WAIT)
Read the PRD + the v1 app + v1 docs. Produce a tight, skimmable **gap report**:
1. PRD essence (≤10 lines): thesis, 2 personas, signature design idea, camera/tech approach, chosen platform.
2. **Functional gap table** — for each PRD FR/epic/journey: `requirement · status (✅ have / ◐ partial / ✗ missing) · one-line what's needed`, grouped by area (Auth, Doctor, Patient, Camera/verify, Notifications, Appointments, Data/Realtime, Gamification, KVKK/compliance).
3. UX-flow gaps (dead ends, missing states/steps vs the PRD journeys).
4. UI / IA / design-system gaps (vs docs 05/06/07).
5. Data-model & technical gaps (vs docs 08/09 and `schema.sql`/`api.js`).
6. Metrics/analytics gaps (vs doc 11 — v1 likely tracks nothing).
7. **Prioritized list:** P0 (real flaws / missing core FRs / compliance / dead flows / no analytics), P1, P2.
Then propose a **phased v2 plan**. **STOP and get my confirmation before writing code.**

## Strategic forks — surface these, recommend, but let ME decide (don't assume)
1. **Platform:** the PRD picks a **NATIVE patient app** (VisionCamera + BlazePose, offline, IMU fallbacks); v1 is a **PWA**. Native = a true rebuild of the patient app (big effort, better camera/IMU + app-store presence); PWA = one codebase, camera works on HTTPS but less robust. Give me a recommendation + the cost of each.
2. **Design direction:** PRD docs 06/07 propose the **"Recovery Arc"** motif + **spruce-green** palette (deliberately not clinical blue, not the AI cream/terracotta) + **marigold** accent + no alarming red. v1 uses teal `#0E7C66` + coral + Fraunces. Decide: adopt the PRD direction (retoken the design system) or keep v1's.
3. Flag any other place the PRD materially changes scope or model.

## Version safety — I must always be able to return to v1
- v1 is git tag **`v1.0.0`** (pushed) and **is the current production deploy**.
- Do ALL v2 work on a branch: `git checkout -b v2`. Deploy v2 to a **Cloudflare Pages preview branch** so production stays on v1:
  `npx -y wrangler@3 pages deploy . --project-name fizyon --branch v2 --commit-dirty=true` → gives a preview URL; **production (app.fizyon.net) keeps serving v1** until I approve promotion to `--branch main`.
- Never force-push or move the `v1.0.0` tag. Rollback if ever needed: `git checkout v1.0.0` + redeploy to `--branch main`, or roll back the deployment in the Cloudflare Pages dashboard.

## Workflow & quality bar (carry over from v1)
- Incremental: one screen/feature per reviewable change; don't break working v1 features; reuse v1's tokens/components/handlers where the PRD doesn't change them.
- Web-first, then adapt to mobile. Physio/web = dense, keyboard-friendly. Patient/mobile = calm, large touch targets (≥44px), thumb-reachable primary action. WCAG AA contrast, visible focus, designed empty/loading/error states, no magic numbers (use tokens). Turkish-first copy.
- **Verify with real screenshots at 1440×900 (web) and 390×844 (mobile) after each screen.** IMPORTANT: in this harness the Playwright-MCP screenshots are NOT readable from disk — instead run a small **Node Playwright script from the BoxCommerce repo** (`~/Desktop/BoxCommerce-Test-Automation` has playwright 1.55; chromium is at `~/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/.../Google Chrome for Testing` — pass it as `executablePath`, `headless:true`). The script drives `http://localhost:5599`, writes PNGs to `~/Desktop/Fizyon/audit/`, then Read those PNGs. Run the app: `cd ~/Desktop/Fizyon && python3 -m http.server 5599`. To check animations at their extreme, pause them: `el.getAnimations({subtree:true}).forEach(a=>{a.currentTime=a.effect.getComputedTiming().duration/2;a.pause()})`.
- **Deploy a CLEAN copy** (exclude `supabase/`, `tests/`, `audit/`, `docs/`, `*.jpeg`, `EXPANSION-RESEARCH.md`, `styleguide.html`, `fizyon-prd/` — never publish those). Cloudflare account id `7a77ac55b1be621c902b0f7b575165cb`, project `fizyon`.
- **DB changes:** apply via Supabase Management API — `POST https://api.supabase.com/v1/projects/nvqtfikmfrvwgedqluav/database/query` with body `{"query":"..."}` and a **browser User-Agent** header (or Cloudflare returns 1010). Keep RLS on every table.
- **Secrets:** I provide a fresh GitHub PAT + tokens per session. Never commit them — push via an ephemeral `https://<PAT>@github.com/...` URL, then rely on the clean remote. Bump the `?v=` query-strings in `index.html` on each change (the service worker caches).
- Update memory + the `docs/` as you go.

**Your first reply to me:** the STEP-0 gap analysis + strategic-fork recommendations + the phased v2 plan. Then wait for my go.
