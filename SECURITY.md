# Fizyon — Security & privacy model

Health data is special-category personal data (KVKK Art. 6 / GDPR Art. 9). Security is designed in,
not bolted on.

## Data protection
- **Transport:** all traffic over TLS/HTTPS.
- **At rest:** managed Postgres (Supabase) with encryption at rest.
- **Row-Level Security (RLS):** the core control. Every table denies by default; policies ensure a
  physiotherapist can read/write **only their own patients'** rows, and a patient **only their own**.
  Enforced in the database, so a leaked/abused anon key cannot read other patients' data.
  See [`supabase/schema.sql`](supabase/schema.sql).
- **Keys:** only the *publishable/anon* key ships in the client (safe under RLS). The `service_role`
  and management (`sbp_`) keys are never in client code or the repo.
- **On-device camera:** movement verification runs fully on-device (MediaPipe). Video never leaves
  the phone; only the result (verified, duration) is stored.
- **Audit log:** clinical actions recorded (`audit_log`) for accountability.
- **Consent:** explicit health-data consent (açık rıza) captured at signup and stored
  (`profiles.consent_health` / `consent_at`).

## Open items before production (human/account-gated)
1. **Data residency:** project is currently in `ap-northeast-2` (Seoul). For KVKK/GDPR, recreate in
   `eu-central-1` (or a Turkey region) and migrate. Do this before real patient data.
2. **Email confirmation** is ON (secure) — kept on deliberately. The built-in email sender is
   rate-limited (~a few/hour) and not for production, so configure a **custom SMTP** sender +
   domain before launch. (For local testing you may temporarily disable confirmation in the
   Supabase dashboard → Auth, but re-enable it for production.)
   Patients link to a physiotherapist via the doctor's 6-char share **code** at signup.
3. **Phone OTP** needs an SMS provider (Twilio / Netgsm) configured in Supabase Auth.
4. **Re-enable leaked-password protection** and set a strong password policy in Auth settings.
5. **Rotate** any keys shared during development.
6. **KVKK:** assess VERBİS data-controller registration; publish the data-processing inventory.
7. **Backups & DPA:** confirm backups and sign a Data Processing Agreement with the provider.
8. **Penetration test / RLS review** by a third party before launch.

## Reporting
Security issues: [security@your-domain] (set up a real contact before launch).
