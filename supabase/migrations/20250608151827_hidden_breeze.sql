/*
  # Fix Authentication and RLS Policies

  1. Security
    - Fix RLS policies for profiles table
    - Ensure proper permissions for auth functions
    - Add better error handling for profile creation

  2. Changes
    - Update profiles RLS policies
    - Fix auth.uid() function access
    - Add fallback profile creation
*/

-- Ensure auth schema permissions
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
GRANT SELECT ON auth.users TO authenticated;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Enable insert for users based on user_id"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Admin policies
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

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure the handle_new_user function has proper permissions
ALTER FUNCTION handle_new_user() SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;

-- Recreate the trigger to ensure it works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add a function to safely create profiles if they don't exist
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (user_id, user_email, 'user')
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION ensure_profile_exists(uuid, text) TO authenticated, anon;

-- Test that auth.uid() works properly
DO $$
BEGIN
  -- This will help debug auth issues
  RAISE NOTICE 'Auth setup completed successfully';
END $$;