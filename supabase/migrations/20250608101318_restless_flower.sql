/*
  # Fix user signup trigger

  1. Database Function
    - Create or replace `handle_new_user` function that automatically creates a profile when a new user signs up
    - Function creates a profile record with the user's ID and email from auth.users

  2. Trigger Setup
    - Create trigger on `auth.users` table to call the function when new users are inserted
    - Ensures every new signup automatically gets a profile record

  3. Security
    - Function runs with security definer privileges to bypass RLS during profile creation
    - This is necessary since the trigger runs in a system context
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$;

-- Drop the trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();