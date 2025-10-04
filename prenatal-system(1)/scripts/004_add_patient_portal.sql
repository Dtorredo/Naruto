-- Add user_id to patients table to link patients to auth accounts
alter table public.patients add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Create index for faster lookups
create index if not exists patients_user_id_idx on public.patients(user_id);

-- Update profiles table to support patient role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('doctor', 'nurse', 'admin', 'patient'));

-- Drop existing RLS policies
drop policy if exists "Authenticated users can view patients" on public.patients;
drop policy if exists "Authenticated users can insert patients" on public.patients;
drop policy if exists "Authenticated users can update patients" on public.patients;
drop policy if exists "Authenticated users can delete patients" on public.patients;

drop policy if exists "Authenticated users can view prenatal records" on public.prenatal_records;
drop policy if exists "Authenticated users can insert prenatal records" on public.prenatal_records;
drop policy if exists "Authenticated users can update prenatal records" on public.prenatal_records;
drop policy if exists "Authenticated users can delete prenatal records" on public.prenatal_records;

drop policy if exists "Authenticated users can view appointments" on public.appointments;
drop policy if exists "Authenticated users can insert appointments" on public.appointments;
drop policy if exists "Authenticated users can update appointments" on public.appointments;
drop policy if exists "Authenticated users can delete appointments" on public.appointments;

drop policy if exists "Authenticated users can view checkup records" on public.checkup_records;
drop policy if exists "Authenticated users can insert checkup records" on public.checkup_records;
drop policy if exists "Authenticated users can update checkup records" on public.checkup_records;

drop policy if exists "Authenticated users can view prescriptions" on public.prescriptions;
drop policy if exists "Authenticated users can insert prescriptions" on public.prescriptions;
drop policy if exists "Authenticated users can update prescriptions" on public.prescriptions;

drop policy if exists "Authenticated users can view vaccinations" on public.vaccinations;
drop policy if exists "Authenticated users can insert vaccinations" on public.vaccinations;
drop policy if exists "Authenticated users can update vaccinations" on public.vaccinations;

-- Enhanced RLS Policies for patients
-- Staff can view all patients, patients can only view their own record
create policy "Staff can view all patients"
  on public.patients for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Patients can view their own record"
  on public.patients for select
  using (user_id = auth.uid());

create policy "Staff can insert patients"
  on public.patients for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can update patients"
  on public.patients for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can delete patients"
  on public.patients for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

-- Enhanced RLS Policies for prenatal_records
create policy "Staff can view all prenatal records"
  on public.prenatal_records for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Patients can view their own prenatal records"
  on public.prenatal_records for select
  using (
    exists (
      select 1 from public.patients
      where patients.id = prenatal_records.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Staff can insert prenatal records"
  on public.prenatal_records for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can update prenatal records"
  on public.prenatal_records for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can delete prenatal records"
  on public.prenatal_records for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

-- Enhanced RLS Policies for appointments
create policy "Staff can view all appointments"
  on public.appointments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Patients can view their own appointments"
  on public.appointments for select
  using (
    exists (
      select 1 from public.patients
      where patients.id = appointments.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Staff can insert appointments"
  on public.appointments for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can update appointments"
  on public.appointments for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can delete appointments"
  on public.appointments for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

-- Enhanced RLS Policies for checkup_records
create policy "Staff can view all checkup records"
  on public.checkup_records for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Patients can view their own checkup records"
  on public.checkup_records for select
  using (
    exists (
      select 1 from public.patients
      where patients.id = checkup_records.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Staff can insert checkup records"
  on public.checkup_records for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can update checkup records"
  on public.checkup_records for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

-- Enhanced RLS Policies for prescriptions
create policy "Staff can view all prescriptions"
  on public.prescriptions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Patients can view their own prescriptions"
  on public.prescriptions for select
  using (
    exists (
      select 1 from public.patients
      where patients.id = prescriptions.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Staff can insert prescriptions"
  on public.prescriptions for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can update prescriptions"
  on public.prescriptions for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

-- Enhanced RLS Policies for vaccinations
create policy "Staff can view all vaccinations"
  on public.vaccinations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Patients can view their own vaccinations"
  on public.vaccinations for select
  using (
    exists (
      select 1 from public.patients
      where patients.id = vaccinations.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Staff can insert vaccinations"
  on public.vaccinations for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );

create policy "Staff can update vaccinations"
  on public.vaccinations for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('doctor', 'nurse', 'admin')
    )
  );
