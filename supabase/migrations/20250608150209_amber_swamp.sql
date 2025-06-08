/*
  # Fix RLS Policies and Add Missing Functions

  1. Security Updates
    - Fix profiles table RLS policies for proper user access
    - Add missing trigger function for user profile creation
    - Ensure proper authentication flow

  2. Missing Functions
    - Add handle_new_user trigger function
    - Add update_video_views_count trigger function

  3. Policy Updates
    - Allow users to insert their own profiles
    - Fix profile access policies
*/

-- Create the handle_new_user function for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the update_video_views_count function
CREATE OR REPLACE FUNCTION update_video_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE videos 
  SET views_count = views_count + 1 
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation on user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Fix profiles table RLS policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure the auth.uid() function works properly by granting necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Add some test data if no admin exists
DO $$
BEGIN
  -- Only insert if no admin exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    -- This will be handled by the signup process instead
    NULL;
  END IF;
END $$;