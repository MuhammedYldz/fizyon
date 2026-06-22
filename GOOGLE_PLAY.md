# Fizyon — Google Play release guide

Fizyon is a PWA. To ship on Google Play we wrap it as a **TWA (Trusted Web Activity)** with
Bubblewrap. The web app stays the single source of truth; the Play listing just installs it.

## 0. Prerequisites (account/human-gated — only you can do these)
- A **Google Play Developer account** ($25 one-time).
- A signing **keystore** (generated locally; back it up — losing it blocks future updates).
- A production domain you control (see §3 — GitHub Pages project subpaths don't work for TWA verification).

## 1. Build the Android package (TWA via Bubblewrap)
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-DOMAIN/manifest.webmanifest
# answers: package id e.g. com.fizyon.app, app name "Fizyon", launcher "Fizyon"
bubblewrap build      # produces app-release-signed.aab (upload this) + APK
```
`twa-manifest.json` in this repo is a starting config — edit `host`, `packageId`, colors.

## 2. Digital Asset Links (removes the browser address bar)
Host [`.well-known/assetlinks.json`](.well-known/assetlinks.json) at your domain **root**:
`https://YOUR-DOMAIN/.well-known/assetlinks.json`
Replace `<SHA256_FINGERPRINT>` with your signing key's fingerprint:
```bash
keytool -list -v -keystore android.keystore -alias android | grep SHA256
```

## 3. ⚠️ Hosting note (important)
TWA verification needs `assetlinks.json` at the **origin root**, with no path prefix. The current
live URL is `https://muhammedyldz.github.io/fizyon/` (a project subpath) — that **cannot** host
`/.well-known/` at the origin root. For a real release, use a **custom domain** (e.g. `fizyon.app`)
pointed at the hosting, or publish to a `muhammedyldz.github.io` root repo. Then update `start_url`
and the Bubblewrap `host`.

## 4. Play Console — Data Safety form (answers)
- **Personal info collected:** Name; Email address; Phone number (if phone signup enabled).
- **Health & fitness:** Yes — "Health info" (exercise programs, adherence, therapist feedback).
- **Is data encrypted in transit?** Yes (TLS).
- **Can users request deletion?** Yes (KVKK/GDPR right to erasure — provide a contact/in-app path).
- **Is data shared with third parties?** No (only processed by our infrastructure provider, Supabase, as a processor).
- **Camera:** Used for on-device movement verification. **Video is not collected or transmitted** — processed on-device, only the result is stored. State this verbatim; it materially de-risks review.

## 5. Health apps policy (Google Play)
- Provide an accessible **Privacy Policy** URL (we ship `/privacy.html`).
- Don't claim to diagnose/treat; we include a medical disclaimer in `/terms.html`.
- Declare the **camera** permission and justify it (movement verification, on-device).
- If marketed for medical purposes in some regions, medical-device regulations (CE/MDR, Turkey ÜTS) may apply — get regulatory advice before such claims.

## 6. Content rating, listing assets
- Complete the IARC content-rating questionnaire (likely "Everyone").
- Assets needed: 512×512 icon (have `assets/logo.svg` — export PNG), feature graphic 1024×500,
  ≥2 phone screenshots (use `tests/*.png`), short + full description (TR + EN).

## 7. Permissions declared
- `CAMERA` — movement verification (on-device).
- `INTERNET` — sync.
- (Later) `POST_NOTIFICATIONS` — reminders.

## Checklist
- [ ] Custom domain + assetlinks.json at root (§3)
- [ ] Keystore generated & backed up
- [ ] AAB built via Bubblewrap
- [ ] Privacy policy reviewed by a lawyer; contact email live
- [ ] Data Safety form completed (§4)
- [ ] KVKK VERBİS registration assessed (data controller)
- [ ] Store listing assets + descriptions (TR/EN)
