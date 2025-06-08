/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Current admin policies on profiles table create infinite recursion
    - Policies reference the profiles table within profiles table policies
    - This causes circular dependency when evaluating permissions

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid self-referencing
    - Use auth.jwt() to check user role instead of querying profiles table
    - Maintain security while eliminating recursion

  3. Changes
    - Remove recursive admin policies
    - Add role-based policies using JWT claims
    - Keep simple user-based policies intact
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new admin policies that don't cause recursion
-- These use auth.jwt() to check the role claim instead of querying the profiles table
CREATE POLICY "Admins can view all profiles via JWT"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() ->> 'user_role')::text, 'user') = 'admin'
    OR auth.uid() = id
  );

CREATE POLICY "Admins can update all profiles via JWT"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE((auth.jwt() ->> 'user_role')::text, 'user') = 'admin'
    OR auth.uid() = id
  )
  WITH CHECK (
    COALESCE((auth.jwt() ->> 'user_role')::text, 'user') = 'admin'
    OR auth.uid() = id
  );

-- Create a function to update JWT claims when profile role changes
CREATE OR REPLACE FUNCTION update_user_role_claim()
RETURNS TRIGGER AS $$
BEGIN
  -- This function would typically update the JWT claims
  -- For now, we'll just ensure the trigger exists for future use
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update role claims when profile role changes
DROP TRIGGER IF EXISTS on_profile_role_updated ON profiles;
CREATE TRIGGER on_profile_role_updated
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_role_claim();