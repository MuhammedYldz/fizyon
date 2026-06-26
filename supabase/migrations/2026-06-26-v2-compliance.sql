-- Fizyon — v2 compliance migration (2026-06-26)
-- ADDITIVE + IDEMPOTENT + BACKWARD-COMPATIBLE: safe to run on the live DB shared by v1.
-- It only ADDS columns/tables/policies (with defaults), so v1 keeps working unchanged.
-- Apply via Supabase SQL editor or the Management API:
--   POST https://api.supabase.com/v1/projects/nvqtfikmfrvwgedqluav/database/query
--   Authorization: Bearer <sbp_ access token>   (send a browser User-Agent or Cloudflare 1010-blocks)
--   body: {"query":"<this file>"}

-- 1) Completion integrity: record HOW a completion was attested (camera = CV; manual = self; none = no proof).
--    `verified` stays = camera-attested only. Backfill existing rows from `verified`.
alter table public.completions add column if not exists verify_method text;
update public.completions set verify_method = case when verified then 'camera' else 'none' end where verify_method is null;
alter table public.completions add column if not exists day date;          -- for one-verified-per-(exercise,day)
update public.completions set day = (done_at at time zone 'Europe/Istanbul')::date where day is null;
-- enforce verify-once-per-move-per-day at the DB level: at most one CAMERA-verified completion per exercise/day
create unique index if not exists uniq_cam_verify_per_day
  on public.completions (exercise_id, day) where verified = true;

-- 2) Gamification: merciful streaks (grace) + best streak + last-active (PRD: no-shame streaks).
alter table public.gamification add column if not exists best_streak  int default 0;
alter table public.gamification add column if not exists grace_tokens int default 2;
alter table public.gamification add column if not exists last_active  date;

-- 3) Exercise scheduling + verifiability (PRD docs 04/08/09): which days, recovery window, camera-or-manual.
alter table public.exercises add column if not exists verifiability text default 'camera'; -- 'camera' | 'manual_only'
alter table public.exercises add column if not exists schedule    jsonb default '[0,1,2,3,4,5,6]'::jsonb; -- days of week (0=Sun)
alter table public.exercises add column if not exists start_date  date;
alter table public.exercises add column if not exists review_date date;

-- 4) KVKK: explicit, withdrawable, audited consents (separate from the boolean on profiles).
create table if not exists public.consent_record (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.profiles(id) on delete cascade,
  type        text not null,                 -- 'kvkk_health' | 'camera' | 'share_clinician_name' | ...
  version     text not null default 'v1',
  granted     boolean not null,
  granted_at  timestamptz not null default now(),
  withdrawn_at timestamptz
);
alter table public.consent_record enable row level security;
drop policy if exists consent_select on public.consent_record;
create policy consent_select on public.consent_record for select
  using (patient_id = auth.uid() or public.is_patient_of_me(patient_id));
drop policy if exists consent_write on public.consent_record;
create policy consent_write on public.consent_record for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- 5) KVKK right-to-erasure: a patient can delete their OWN account + all their data.
--    SECURITY DEFINER so it can remove the auth.users row (cascades to all child tables via FKs).
create or replace function public.delete_my_account()
  returns void language plpgsql security definer set search_path = public as $$
begin
  delete from auth.users where id = auth.uid();   -- cascades: profiles + all child rows on delete cascade
end; $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- 6) Realtime: keep consent_record out of the public realtime feed (sensitive); nothing to add.
