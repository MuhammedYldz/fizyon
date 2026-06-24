# Fizyon — Google Play release guide

Fizyon is a PWA. To ship on Google Play we wrap it as a **TWA (Trusted Web Activity)** with
Bubblewrap. The web app stays the single source of truth; the Play listing just installs it.

## 0. Prerequisites (account/human-gated — only you can do these)
- A **Google Play Developer account** ($25 one-time) — your Google account `info@getpp.net`.
- A signing **keystore** (Bubblewrap generates one in step 1; **back it up** — losing it blocks future updates).
- Production domain ✅ already done: the app is live at **https://app.fizyon.net** (Cloudflare Pages, origin root — TWA verification works).

## 1. Build the Android package (TWA via Bubblewrap)
Everything is pre-configured (`twa-manifest.json` → host `app.fizyon.net`, package `net.fizyon.app`, PNG icons live). Just run:
```bash
cd ~/Desktop/Fizyon
npm i -g @bubblewrap/cli          # first time only (downloads JDK 17 + Android SDK on first build)
bubblewrap init --manifest https://app.fizyon.net/manifest.webmanifest
# it reads the values above; set a keystore password when asked and SAVE IT
bubblewrap build                  # → app-release-signed.aab (upload this to Play) + app-release-signed.apk (test install)
```

## 2. Digital Asset Links (removes the browser address bar) — one value to fill after step 1
After `bubblewrap init`, print the signing fingerprint and paste it into `.well-known/assetlinks.json`, then redeploy the app:
```bash
keytool -list -v -keystore android.keystore -alias android | grep SHA256   # copy the SHA256
# → replace REPLACE_WITH_KEYSTORE_SHA256_FROM_bubblewrap_init in .well-known/assetlinks.json
# redeploy: CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=7a77ac55b1be621c902b0f7b575165cb \
#   npx -y wrangler@3 pages deploy . --project-name fizyon --branch main --commit-dirty=true
```
Live check: `https://app.fizyon.net/.well-known/assetlinks.json` (served at origin root ✅).

## 3. Hosting — resolved ✅
`assetlinks.json` is served at the origin root of **app.fizyon.net**, so TWA digital-asset-link
verification works. No subpath problem. `start_url` and Bubblewrap `host` already point here.

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
- Assets ready: **512×512 icon** `assets/icon-512.png` (+ maskable `assets/icon-maskable-512.png`, 192 `assets/icon-192.png`); ≥2 phone screenshots (use `tests/*.png`). Still need a feature graphic 1024×500 + short/full description (TR + EN).

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
