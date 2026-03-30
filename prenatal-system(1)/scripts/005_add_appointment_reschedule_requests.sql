-- Create appointment reschedule requests table
create table if not exists public.appointment_reschedule_requests (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'proposed', 'approved', 'declined', 'cancelled')),
  preferred_datetime timestamp with time zone not null,
  patient_notes text,
  proposed_datetime timestamp with time zone,
  doctor_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists appointment_reschedule_requests_appointment_id_idx
  on public.appointment_reschedule_requests(appointment_id);

create index if not exists appointment_reschedule_requests_patient_id_idx
  on public.appointment_reschedule_requests(patient_id);

create index if not exists appointment_reschedule_requests_status_idx
  on public.appointment_reschedule_requests(status);

alter table public.appointment_reschedule_requests enable row level security;

drop policy if exists "Staff can view all appointment reschedule requests" on public.appointment_reschedule_requests;
drop policy if exists "Patients can view their own appointment reschedule requests" on public.appointment_reschedule_requests;
drop policy if exists "Patients can insert their own appointment reschedule requests" on public.appointment_reschedule_requests;
drop policy if exists "Staff can update appointment reschedule requests" on public.appointment_reschedule_requests;

create policy "Staff can view all appointment reschedule requests"
  on public.appointment_reschedule_requests for select
  using (public.is_staff());

create policy "Patients can view their own appointment reschedule requests"
  on public.appointment_reschedule_requests for select
  using (
    exists (
      select 1 from public.patients
      where patients.id = appointment_reschedule_requests.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Patients can insert their own appointment reschedule requests"
  on public.appointment_reschedule_requests for insert
  with check (
    status = 'pending'
    and exists (
      select 1 from public.patients
      where patients.id = appointment_reschedule_requests.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Staff can update appointment reschedule requests"
  on public.appointment_reschedule_requests for update
  using (public.is_staff());
