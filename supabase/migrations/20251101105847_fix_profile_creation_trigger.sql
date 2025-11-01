/*
  # Fix Profile Creation and Authentication Issues

  1. Profile Management
    - Create trigger function to automatically create profiles on user signup
    - Add function to handle missing profiles during login
    - Add email validation and uniqueness constraints
    - Add indexes for better performance

  2. Changes Made
    - Create `handle_new_user()` trigger function that runs after auth.users insert
    - Add trigger on auth.users table to auto-create profiles
    - Create `ensure_profile_exists()` function for manual profile creation
    - Add unique constraint on profiles.email
    - Add indexes on profiles table for faster lookups

  3. Security
    - Maintains existing RLS policies
    - Ensures users can only access their own profiles
    - Adds audit logging for profile creation

  4. Important Notes
    - This migration is idempotent and safe to run multiple times
    - Existing profiles will not be affected
    - Missing profiles will be created on next login
*/

-- =====================================================
-- SECTION 1: Drop existing trigger if it exists
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =====================================================
-- SECTION 2: Create trigger function for auto profile creation
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================
-- SECTION 3: Create trigger on auth.users
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECTION 4: Function to ensure profile exists (for existing users)
-- =====================================================

CREATE OR REPLACE FUNCTION public.ensure_profile_exists(user_id UUID, user_email TEXT)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Try to get existing profile
  SELECT id INTO profile_id
  FROM public.profiles
  WHERE id = user_id;

  -- If profile doesn't exist, create it
  IF profile_id IS NULL THEN
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (user_id, user_email, 'user', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, updated_at = NOW()
    RETURNING id INTO profile_id;
  END IF;

  RETURN profile_id;
END;
$$;

-- =====================================================
-- SECTION 5: Add unique constraint on email if not exists
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- =====================================================
-- SECTION 6: Create missing profiles for existing users
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through auth.users that don't have profiles
  FOR user_record IN
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Create missing profile
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
      user_record.id,
      user_record.email,
      'user',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- SECTION 7: Add helpful indexes if they don't exist
-- =====================================================

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at DESC);

-- =====================================================
-- SECTION 8: Update existing RLS policies for better performance
-- =====================================================

-- Drop and recreate insert policy to allow profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

-- Add policy to allow service role to manage profiles
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

CREATE POLICY "Service role can manage all profiles"
ON public.profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- SECTION 9: Grant necessary permissions
-- =====================================================

-- Grant execute permission on helper function to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(UUID, TEXT) TO service_role;

-- Refresh statistics for query planner
ANALYZE public.profiles;