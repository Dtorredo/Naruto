-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table for doctors/staff
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('doctor', 'nurse', 'admin')),
  specialization text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create patients table
create table if not exists public.patients (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  email text,
  phone text not null,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  blood_type text,
  allergies text,
  medical_history text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prenatal_records table
create table if not exists public.prenatal_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  lmp_date date not null, -- Last Menstrual Period
  edd_date date not null, -- Expected Delivery Date
  gravida integer, -- Number of pregnancies
  para integer, -- Number of births
  current_week integer,
  current_trimester integer check (current_trimester in (1, 2, 3)),
  pregnancy_status text check (pregnancy_status in ('active', 'completed', 'terminated')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create appointments table
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references public.profiles(id) on delete set null,
  appointment_date timestamp with time zone not null,
  duration_minutes integer default 30,
  appointment_type text not null check (appointment_type in ('checkup', 'ultrasound', 'consultation', 'emergency', 'follow-up')),
  status text not null check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create checkup_records table
create table if not exists public.checkup_records (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  prenatal_record_id uuid references public.prenatal_records(id) on delete cascade,
  weight_kg numeric(5,2),
  blood_pressure text,
  fundal_height_cm numeric(4,1),
  fetal_heart_rate integer,
  urine_test_results text,
  blood_test_results text,
  ultrasound_notes text,
  complaints text,
  diagnosis text,
  recommendations text,
  next_visit_date date,
  performed_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prescriptions table
create table if not exists public.prescriptions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  checkup_record_id uuid references public.checkup_records(id) on delete cascade,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  instructions text,
  prescribed_by uuid references public.profiles(id) on delete set null,
  prescribed_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vaccinations table
create table if not exists public.vaccinations (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  vaccine_name text not null,
  vaccine_date date not null,
  administered_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.prenatal_records enable row level security;
alter table public.appointments enable row level security;
alter table public.checkup_records enable row level security;
alter table public.prescriptions enable row level security;
alter table public.vaccinations enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for patients (all authenticated users can access)
create policy "Authenticated users can view patients"
  on public.patients for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert patients"
  on public.patients for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update patients"
  on public.patients for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete patients"
  on public.patients for delete
  using (auth.role() = 'authenticated');

-- RLS Policies for prenatal_records
create policy "Authenticated users can view prenatal records"
  on public.prenatal_records for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert prenatal records"
  on public.prenatal_records for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update prenatal records"
  on public.prenatal_records for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete prenatal records"
  on public.prenatal_records for delete
  using (auth.role() = 'authenticated');

-- RLS Policies for appointments
create policy "Authenticated users can view appointments"
  on public.appointments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert appointments"
  on public.appointments for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update appointments"
  on public.appointments for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete appointments"
  on public.appointments for delete
  using (auth.role() = 'authenticated');

-- RLS Policies for checkup_records
create policy "Authenticated users can view checkup records"
  on public.checkup_records for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert checkup records"
  on public.checkup_records for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update checkup records"
  on public.checkup_records for update
  using (auth.role() = 'authenticated');

-- RLS Policies for prescriptions
create policy "Authenticated users can view prescriptions"
  on public.prescriptions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert prescriptions"
  on public.prescriptions for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update prescriptions"
  on public.prescriptions for update
  using (auth.role() = 'authenticated');

-- RLS Policies for vaccinations
create policy "Authenticated users can view vaccinations"
  on public.vaccinations for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert vaccinations"
  on public.vaccinations for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update vaccinations"
  on public.vaccinations for update
  using (auth.role() = 'authenticated');
