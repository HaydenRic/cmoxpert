/*
  # Fix profiles table INSERT policy
  
  1. Changes
    - Add INSERT policy to allow profile creation during signup
    - The trigger needs to be able to insert into profiles table
  
  2. Security
    - Policy allows authenticated users to insert their own profile
    - Uses auth.uid() to ensure users can only create their own profile
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create INSERT policy for profiles
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
