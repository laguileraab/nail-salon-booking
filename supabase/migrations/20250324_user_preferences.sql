-- Migration: User Preferences
-- Date: 2025-03-24
-- Purpose: Add theme and language preferences to user profiles

-- Add theme and language preference columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'de', 'es'));

-- Create function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences() 
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- No special logic needed, just basic validation is handled by the CHECK constraints
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for preference updates
DROP TRIGGER IF EXISTS check_preferences_update_trigger ON profiles;
CREATE TRIGGER check_preferences_update_trigger
  BEFORE UPDATE OF theme_preference, language_preference ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences();

-- Make sure users can update their own preferences
DROP POLICY IF EXISTS "Users can update their own theme" ON profiles;
CREATE POLICY "Users can update their own theme"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (theme_preference IS NOT NULL OR language_preference IS NOT NULL)
  );

-- Create separate policy for read access to own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Make RLS active on profiles if not already
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
