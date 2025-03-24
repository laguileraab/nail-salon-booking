-- Migration: User Role Management
-- Date: 2025-03-24

-- Make sure to drop the view first if it exists (this is causing the SECURITY DEFINER VIEW error)
DROP VIEW IF EXISTS admin_users_view;

-- Drop the policy first if it exists to avoid errors
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Make sure admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Create admin trigger function to update user roles with search_path set
CREATE OR REPLACE FUNCTION handle_user_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from updating their own role to admin
  IF (auth.uid() = NEW.id AND OLD.role <> 'admin' AND NEW.role = 'admin') THEN
    RAISE EXCEPTION 'Users cannot promote themselves to admin';
  END IF;
  
  -- Verify that role changes from non-admin to admin are done by admins
  IF (OLD.role <> 'admin' AND NEW.role = 'admin' AND 
      NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')) THEN
    RAISE EXCEPTION 'Only admins can promote users to admin role';
  END IF;
  
  -- Verify that role changes from admin are done by admins
  IF (OLD.role = 'admin' AND NEW.role <> 'admin' AND 
      NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')) THEN
    RAISE EXCEPTION 'Only admins can demote users from admin role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for role management
DROP TRIGGER IF EXISTS check_role_update_trigger ON profiles;
CREATE TRIGGER check_role_update_trigger
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_role_update();

-- Create admin function to get user data for admin views
CREATE OR REPLACE FUNCTION get_admin_users() 
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  is_active BOOLEAN,
  confirmed_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can access user information';
  END IF;
  
  RETURN QUERY 
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.role,
    p.created_at,
    p.last_login,
    p.is_active,
    u.confirmed_at,
    u.email_confirmed_at,
    u.last_sign_in_at
  FROM profiles p
  JOIN auth.users u ON p.id = u.id;
END;
$$ LANGUAGE plpgsql;

-- Create policy to ensure all users can select their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy to ensure admins can select all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Fix search_path mutable warnings for existing functions
CREATE OR REPLACE FUNCTION check_appointment_availability(
  appointment_date DATE,
  time_slot_id INTEGER,
  staff_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  SELECT COUNT(*) = 0 INTO is_available
  FROM appointments
  WHERE appointments.appointment_date = check_appointment_availability.appointment_date
    AND appointments.time_slot_id = check_appointment_availability.time_slot_id
    AND appointments.staff_id = check_appointment_availability.staff_id
    AND appointments.status <> 'cancelled';
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION before_appointment_insert_update()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if the appointment slot is available
  IF NOT check_appointment_availability(NEW.appointment_date, NEW.time_slot_id, NEW.staff_id) THEN
    RAISE EXCEPTION 'This appointment slot is already booked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for tables that have RLS enabled but no policies
-- Staff Schedule policies
DROP POLICY IF EXISTS "Staff can view own schedule" ON staff_schedule;
CREATE POLICY "Staff can view own schedule"
  ON staff_schedule FOR SELECT
  USING (staff_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all staff schedules" ON staff_schedule;
CREATE POLICY "Admins can manage all staff schedules"
  ON staff_schedule FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Staff Specialties policies
DROP POLICY IF EXISTS "Staff can view own specialties" ON staff_specialties;
CREATE POLICY "Staff can view own specialties"
  ON staff_specialties FOR SELECT
  USING (staff_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all staff specialties" ON staff_specialties;
CREATE POLICY "Admins can manage all staff specialties"
  ON staff_specialties FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
