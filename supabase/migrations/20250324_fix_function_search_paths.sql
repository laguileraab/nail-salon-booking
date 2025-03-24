-- Migration: Fix Function Search Paths
-- Date: 2025-03-24
-- Purpose: Fix search_path mutable warnings by setting explicit search paths for all functions

-- Use ALTER FUNCTION to fix the search_path issues without recreating the functions
-- This preserves the original function logic while adding the security settings

-- Fix check_appointment_availability function
ALTER FUNCTION check_appointment_availability(appointment_date DATE, time_slot_id INTEGER, staff_id UUID)
SET search_path = public
SECURITY DEFINER;

-- Fix before_appointment_insert_update function
ALTER FUNCTION before_appointment_insert_update()
SET search_path = public
SECURITY DEFINER;

-- Fix update_modified_column function
ALTER FUNCTION update_modified_column()
SET search_path = public
SECURITY DEFINER;

-- Fix update_updated_at_column function
ALTER FUNCTION update_updated_at_column()
SET search_path = public
SECURITY DEFINER;
