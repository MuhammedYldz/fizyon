-- Fizyon — database schema + Row-Level Security
-- Health data is special-category personal data (KVKK Art. 6 / GDPR Art. 9).
-- RLS is the security backbone: a doctor can ONLY ever see their own patients;
-- a patient can ONLY ever see their own data. Every table denies by default.

-- ---------- tables ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('doctor','patient')),
  full_name     text not null default '',
  license_no    text,                         -- physiotherapists only (verify externally)
  doctor_id     uuid references public.profiles(id) on delete set null, -- patient's physiotherapist
  condition     text,                          -- clinical context (health data)
  week          int  default 1,
  consent_health boolean not null default false, -- KVKK explicit consent (açık rıza)
  consent_at    timestamptz,
  code          text unique,                   -- physiotherapist's share code (patients link with it)
  created_at    timestamptz not null default now()
);

create table if not exists public.exercises (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  demo        text,            -- animation key
  video_url   text,            -- doctor's recorded clip (storage)
  reps int, sets int, hold int,
  note        text,
  verify_text text,            -- camera verification move; null = no proof required
  position    int  default 0,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.completions (
  id          uuid primary key default gen_random_uuid(),
  exercise_id uuid references public.exercises(id) on delete cascade,
  patient_id  uuid not null references public.profiles(id) on delete cascade,
  done_at     timestamptz not null default now(),
  verified    boolean not null default false,
  duration_sec int
);

create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  reason      text,
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.notif_settings (
  patient_id    uuid primary key references public.profiles(id) on delete cascade,
  tone          text default 'normal',
  times         jsonb default '["18:00"]'::jsonb,
  inactive_days int  default 2,
  auto_actions  jsonb default '["notifyDoctor"]'::jsonb
);

create table if not exists public.appointments (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  at         timestamptz not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.gamification (
  patient_id     uuid primary key references public.profiles(id) on delete cascade,
  points         int default 0,
  streak         int default 0,
  journey_stage  int default 1,
  gamify_enabled boolean default true
);

-- audit log of clinical actions (KVKK accountability)
create table if not exists public.audit_log (
  id        bigint generated always as identity primary key,
  actor_id  uuid,
  action    text not null,
  target    text,
  at        timestamptz not null default now()
);

-- ---------- security-definer helpers (bypass RLS safely, no recursion) ----------
create or replace function public.is_patient_of_me(pid uuid)
  returns boolean language sql security definer set search_path = public stable as $$
  select exists(select 1 from public.profiles where id = pid and doctor_id = auth.uid());
$$;

create or replace function public.my_doctor_id()
  returns uuid language sql security definer set search_path = public stable as $$
  select doctor_id from public.profiles where id = auth.uid();
$$;

-- ---------- triggers: auto-provision profile + child rows ----------
create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
declare did uuid;
begin
  -- link a patient to a physiotherapist by share code, if provided at signup
  if (new.raw_user_meta_data->>'doctor_code') is not null and length(new.raw_user_meta_data->>'doctor_code') > 0 then
    select id into did from public.profiles
      where code = upper(new.raw_user_meta_data->>'doctor_code') and role = 'doctor' limit 1;
  end if;
  insert into public.profiles (id, role, full_name, license_no, doctor_id, consent_health, consent_at, code)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'role','patient'),
          coalesce(new.raw_user_meta_data->>'full_name',''),
          new.raw_user_meta_data->>'license_no',
          did,
          coalesce((new.raw_user_meta_data->>'consent_health')::boolean, false),
          (new.raw_user_meta_data->>'consent_at')::timestamptz,
          case when coalesce(new.raw_user_meta_data->>'role','patient')='doctor'
               then upper(substr(translate(gen_random_uuid()::text,'-',''),1,6)) else null end)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_new_patient()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'patient' then
    insert into public.notif_settings(patient_id) values (new.id) on conflict do nothing;
    insert into public.gamification(patient_id)  values (new.id) on conflict do nothing;
  end if;
  return new;
end; $$;
drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created after insert on public.profiles
  for each row execute function public.handle_new_patient();

-- ---------- enable RLS (deny-by-default) ----------
alter table public.profiles      enable row level security;
alter table public.exercises     enable row level security;
alter table public.completions   enable row level security;
alter table public.feedback      enable row level security;
alter table public.notif_settings enable row level security;
alter table public.appointments  enable row level security;
alter table public.gamification  enable row level security;
alter table public.audit_log     enable row level security;

-- ---------- policies ----------
-- profiles: see self, my patients, and (for a patient) my own doctor
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or doctor_id = auth.uid() or id = public.my_doctor_id());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_update_doctor on public.profiles;
create policy profiles_update_doctor on public.profiles for update using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- exercises: doctor manages; patient reads own
drop policy if exists ex_select on public.exercises;
create policy ex_select on public.exercises for select using (patient_id = auth.uid() or public.is_patient_of_me(patient_id));
drop policy if exists ex_write on public.exercises;
create policy ex_write on public.exercises for all
  using (public.is_patient_of_me(patient_id)) with check (public.is_patient_of_me(patient_id));

-- completions: patient logs own; both read
drop policy if exists comp_select on public.completions;
create policy comp_select on public.completions for select using (patient_id = auth.uid() or public.is_patient_of_me(patient_id));
drop policy if exists comp_insert on public.completions;
create policy comp_insert on public.completions for insert with check (patient_id = auth.uid());

-- feedback: patient writes own; both read
drop policy if exists fb_select on public.feedback;
create policy fb_select on public.feedback for select using (patient_id = auth.uid() or public.is_patient_of_me(patient_id));
drop policy if exists fb_insert on public.feedback;
create policy fb_insert on public.feedback for insert with check (patient_id = auth.uid());

-- notif_settings: doctor manages; patient reads + adjusts own reminders
drop policy if exists ns_select on public.notif_settings;
create policy ns_select on public.notif_settings for select using (patient_id = auth.uid() or public.is_patient_of_me(patient_id));
drop policy if exists ns_write on public.notif_settings;
create policy ns_write on public.notif_settings for all
  using (patient_id = auth.uid() or public.is_patient_of_me(patient_id))
  with check (patient_id = auth.uid() or public.is_patient_of_me(patient_id));

-- appointments: doctor manages; patient reads own
drop policy if exists ap_select on public.appointments;
create policy ap_select on public.appointments for select using (patient_id = auth.uid() or public.is_patient_of_me(patient_id));
drop policy if exists ap_write on public.appointments;
create policy ap_write on public.appointments for all
  using (public.is_patient_of_me(patient_id)) with check (public.is_patient_of_me(patient_id));

-- gamification: patient owns; doctor reads
drop policy if exists gm_select on public.gamification;
create policy gm_select on public.gamification for select using (patient_id = auth.uid() or public.is_patient_of_me(patient_id));
drop policy if exists gm_write on public.gamification;
create policy gm_write on public.gamification for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- audit_log: insert-only by authenticated users; readable by the actor
drop policy if exists al_insert on public.audit_log;
create policy al_insert on public.audit_log for insert with check (actor_id = auth.uid());
drop policy if exists al_select on public.audit_log;
create policy al_select on public.audit_log for select using (actor_id = auth.uid());
