-- Nail Salon Booking App Schema for Supabase

-- Create profiles table (extends the default auth.users table)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  first_name text,
  last_name text,
  email text not null,
  phone text,
  address text,
  city text,
  postal_code text,
  created_at timestamp with time zone default now(),
  role text default 'client' check (role in ('client', 'admin', 'staff')) not null,
  avatar_url text,
  last_login timestamp with time zone,
  is_active boolean default true not null,
  constraint profiles_email_key unique (email)
);

-- Create staff table
create table public.staff (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  bio text,
  position text not null,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean default true not null,
  constraint staff_email_key unique (email)
);

-- Create services table
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  duration integer not null, -- in minutes
  category text not null,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean default true not null
);

-- Create promotions table
create table public.promotions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  discount_type text check (discount_type in ('percentage', 'fixed_amount')) not null,
  discount_value decimal(10, 2) not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  code text unique,
  is_active boolean default true not null,
  service_id uuid references public.services(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  usage_limit integer,
  current_usage integer default 0
);

-- Create appointments table
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id) on delete restrict not null,
  service_id uuid references public.services(id) on delete restrict not null,
  staff_id uuid references public.staff(id) on delete restrict not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')) not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  promotion_id uuid references public.promotions(id) on delete set null
);

-- Create feedback table
create table public.feedback (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id) on delete cascade not null,
  appointment_id uuid references public.appointments(id) on delete set null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  staff_id uuid references public.staff(id) on delete set null,
  service_id uuid references public.services(id) on delete set null
);

-- Create business_settings table
create table public.business_settings (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  country text not null,
  phone text not null,
  email text not null,
  website text,
  logo_url text,
  currency text default 'USD' not null,
  tax_rate decimal(5, 2) default 0.00,
  working_hours jsonb not null default '{
    "monday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "tuesday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "wednesday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "thursday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "friday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "saturday": {"open": "10:00", "close": "16:00", "isOpen": true},
    "sunday": {"open": "10:00", "close": "16:00", "isOpen": false}
  }'::jsonb,
  min_appointment_notice integer default 2, -- hours
  appointment_buffer integer default 15, -- minutes
  max_future_booking_days integer default 60, -- days
  cancellation_policy text,
  updated_at timestamp with time zone default now()
);

-- Staff schedule table
create table public.staff_schedule (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references public.staff(id) on delete cascade not null,
  day_of_week text check (day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) not null,
  start_time time not null,
  end_time time not null,
  is_working boolean default true not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (staff_id, day_of_week)
);

-- Staff specialties junction table
create table public.staff_specialties (
  staff_id uuid references public.staff(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (staff_id, service_id)
);

-- Enable RLS (Row Level Security) after tables are created
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.feedback enable row level security;
alter table public.business_settings enable row level security;
alter table public.promotions enable row level security;
alter table public.staff enable row level security;
alter table public.staff_schedule enable row level security;
alter table public.staff_specialties enable row level security;

-- Indexes for performance
create index idx_appointments_client_id on public.appointments(client_id);
create index idx_appointments_staff_id on public.appointments(staff_id);
create index idx_appointments_service_id on public.appointments(service_id);
create index idx_appointments_start_time on public.appointments(start_time);
create index idx_appointments_status on public.appointments(status);
create index idx_feedback_client_id on public.feedback(client_id);
create index idx_staff_specialties_staff_id on public.staff_specialties(staff_id);
create index idx_staff_specialties_service_id on public.staff_specialties(service_id);

-- RLS Policies

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Services policies
create policy "Services are viewable by everyone."
  on public.services for select
  using (true);

create policy "Only admins can modify services."
  on public.services for insert
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

create policy "Only admins can update services."
  on public.services for update
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

create policy "Only admins can delete services."
  on public.services for delete
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Appointments policies
create policy "Appointments are viewable by the client, staff member, or admin."
  on public.appointments for select
  using (
    auth.uid() = client_id or
    exists (select 1 from public.staff where staff.id = appointments.staff_id and staff.user_id = auth.uid()) or
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Clients can create appointments."
  on public.appointments for insert
  with check (auth.uid() = client_id);

create policy "Clients can update their own appointments."
  on public.appointments for update
  using (auth.uid() = client_id and status not in ('completed', 'cancelled'));

create policy "Staff can update appointments they're assigned to."
  on public.appointments for update
  using (exists (select 1 from public.staff where staff.id = appointments.staff_id and staff.user_id = auth.uid()));

create policy "Admins can manage all appointments."
  on public.appointments for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Feedback policies
create policy "Feedbacks are viewable by everyone."
  on public.feedback for select
  using (true);

create policy "Clients can create feedback for their own appointments."
  on public.feedback for insert
  with check (auth.uid() = client_id);

create policy "Clients can update their own feedback."
  on public.feedback for update
  using (auth.uid() = client_id);

create policy "Admins can manage all feedback."
  on public.feedback for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Business settings policies
create policy "Business settings are viewable by everyone."
  on public.business_settings for select
  using (true);

create policy "Only admins can modify business settings."
  on public.business_settings for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Promotions policies
create policy "Promotions are viewable by everyone."
  on public.promotions for select
  using (true);

create policy "Only admins can modify promotions."
  on public.promotions for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Staff policies
create policy "Staff profiles are viewable by everyone."
  on public.staff for select
  using (true);

create policy "Staff can update their own profile."
  on public.staff for update
  using (auth.uid() = user_id);

create policy "Only admins can manage staff."
  on public.staff for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Functions and Triggers

-- Function to check appointment availability
create or replace function public.check_appointment_availability(
  p_staff_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_appointment_id uuid default null
) returns boolean as $$
declare
  conflicting_count integer;
begin
  -- Check if there's any conflicting appointment (overlapping time)
  select count(*)
  into conflicting_count
  from public.appointments
  where staff_id = p_staff_id
    and status in ('pending', 'confirmed')
    and (id != p_appointment_id or p_appointment_id is null) -- Exclude the current appointment if updating
    and (
      (start_time <= p_start_time and end_time > p_start_time) or
      (start_time < p_end_time and end_time >= p_end_time) or
      (start_time >= p_start_time and end_time <= p_end_time)
    );
    
  return conflicting_count = 0;
end;
$$ language plpgsql security definer;

-- Trigger to check appointment availability before insert or update
create or replace function public.before_appointment_insert_update()
returns trigger as $$
declare
  service_duration integer;
  appointment_buffer integer;
begin
  -- Get service duration
  select duration into service_duration
  from public.services
  where id = NEW.service_id;
  
  -- Get appointment buffer
  select appointment_buffer into appointment_buffer
  from public.business_settings
  limit 1;
  
  -- Calculate end time if not provided
  if NEW.end_time is null then
    NEW.end_time = NEW.start_time + (service_duration || ' minutes')::interval;
  end if;
  
  -- Check availability
  if not public.check_appointment_availability(
    NEW.staff_id, 
    NEW.start_time, 
    NEW.end_time + (appointment_buffer || ' minutes')::interval,
    NEW.id
  ) then
    raise exception 'The selected time slot is not available.';
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

create trigger check_appointment_availability
  before insert or update on public.appointments
  for each row execute procedure public.before_appointment_insert_update();

-- Function to auto-update updated_at column
create or replace function public.update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply the updated_at trigger to all tables with updated_at column
create trigger update_profiles_modtime
  before update on public.profiles
  for each row execute procedure public.update_modified_column();

create trigger update_staff_modtime
  before update on public.staff
  for each row execute procedure public.update_modified_column();

create trigger update_services_modtime
  before update on public.services
  for each row execute procedure public.update_modified_column();

create trigger update_appointments_modtime
  before update on public.appointments
  for each row execute procedure public.update_modified_column();

create trigger update_feedback_modtime
  before update on public.feedback
  for each row execute procedure public.update_modified_column();

create trigger update_business_settings_modtime
  before update on public.business_settings
  for each row execute procedure public.update_modified_column();

create trigger update_promotions_modtime
  before update on public.promotions
  for each row execute procedure public.update_modified_column();

-- Sample data insert (optional - remove for production)
-- INSERT INTO public.business_settings (business_name, address, city, postal_code, country, phone, email)
-- VALUES ('Glamour Nails Salon', '123 Beauty Street', 'Fashion City', '12345', 'United States', '(555) 123-4567', 'info@glamournails.com');
