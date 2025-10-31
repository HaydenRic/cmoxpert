/*
  # Setup Admin User

  1. Changes
    - Creates a function to automatically promote the first user to admin role
    - Creates a trigger that runs after profile creation to check if this is the first user
    - If it's the first user (no other profiles exist), sets their role to 'admin'

  2. Security
    - Uses SECURITY DEFINER to allow the function to update the role
    - Only affects the first user account created in the system
    - All subsequent users will have the default 'user' role

  3. Usage
    - Simply sign up through the application UI
    - The first account created will automatically become an admin
    - You can also manually promote users to admin using: 
      UPDATE profiles SET role = 'admin' WHERE email = 'youremail@example.com';
*/

-- Function to auto-promote first user to admin
CREATE OR REPLACE FUNCTION auto_promote_first_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing profiles (excluding the one being inserted)
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- If this is the first user, make them admin
  IF user_count = 1 THEN
    NEW.role := 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_profile_created_check_admin ON profiles;

-- Create trigger to run before insert on profiles
CREATE TRIGGER on_profile_created_check_admin
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_promote_first_admin();

-- Manual promotion helper comment
-- To manually promote a user to admin, run:
-- UPDATE profiles SET role = 'admin', updated_at = now() WHERE email = 'your-email@example.com';
