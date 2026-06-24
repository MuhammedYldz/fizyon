-- Fizyon — 2026-06-24 backlog migration (idempotent; safe on the existing live DB).
-- Adds: booking_url, exercises.freq, appointment_slots, push_subscriptions, realtime publication.

alter table public.profiles  add column if not exists booking_url text;
alter table public.exercises add column if not exists freq int default 1;

create table if not exists public.appointment_slots (
  id         uuid primary key default gen_random_uuid(),
  doctor_id  uuid not null references public.profiles(id) on delete cascade,
  at         timestamptz not null,
  booked_by  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  sub        jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.appointment_slots  enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists slot_select on public.appointment_slots;
create policy slot_select on public.appointment_slots for select
  using (doctor_id = auth.uid() or doctor_id = public.my_doctor_id() or booked_by = auth.uid());
drop policy if exists slot_doctor_write on public.appointment_slots;
create policy slot_doctor_write on public.appointment_slots for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
drop policy if exists slot_patient_book on public.appointment_slots;
create policy slot_patient_book on public.appointment_slots for update
  using (doctor_id = public.my_doctor_id())
  with check (doctor_id = public.my_doctor_id() and booked_by = auth.uid());

drop policy if exists push_all on public.push_subscriptions;
create policy push_all on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.exercises;
  alter publication supabase_realtime add table public.appointments;
  alter publication supabase_realtime add table public.notif_settings;
  alter publication supabase_realtime add table public.profiles;
  alter publication supabase_realtime add table public.completions;
  alter publication supabase_realtime add table public.feedback;
  alter publication supabase_realtime add table public.appointment_slots;
exception when duplicate_object then null; end $$;
