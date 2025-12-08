/*
  # Fix Unused Indexes and Multiple Permissive Policies
  
  1. Overview
    - Drops unused indexes that are not being utilized
    - Consolidates duplicate/multiple permissive policies
    - Fixes RLS policy that re-evaluates auth functions
    
  2. Changes Made
    
    ### Unused Indexes Dropped
    - marketing_audits: status, follow_up_date, created_at, lead_quality, email, score
    - beta_waitlist: email, created_at, status
    - error_logs: created_at, error_type, user_id, error_code
    - rate_limits: window_start, blocked_until
    
    ### Multiple Permissive Policies Fixed
    - beta_waitlist: Consolidated INSERT and SELECT policies
    - marketing_audits: Consolidated INSERT, SELECT, and UPDATE policies
    
    ### RLS Optimization
    - Fixed marketing_audits admin delete policy to use (select auth.uid())
*/

-- =====================================================
-- DROP UNUSED INDEXES
-- =====================================================

-- marketing_audits unused indexes
DROP INDEX IF EXISTS public.idx_marketing_audits_status;
DROP INDEX IF EXISTS public.idx_marketing_audits_follow_up_date;
DROP INDEX IF EXISTS public.idx_marketing_audits_created_at;
DROP INDEX IF EXISTS public.idx_marketing_audits_lead_quality;
DROP INDEX IF EXISTS public.idx_marketing_audits_email;
DROP INDEX IF EXISTS public.idx_marketing_audits_score;

-- beta_waitlist unused indexes
DROP INDEX IF EXISTS public.idx_beta_waitlist_email;
DROP INDEX IF EXISTS public.idx_beta_waitlist_created_at;
DROP INDEX IF EXISTS public.idx_beta_waitlist_status;

-- error_logs unused indexes
DROP INDEX IF EXISTS public.idx_error_logs_created_at;
DROP INDEX IF EXISTS public.idx_error_logs_error_type;
DROP INDEX IF EXISTS public.idx_error_logs_user_id;
DROP INDEX IF EXISTS public.idx_error_logs_error_code;

-- rate_limits unused indexes
DROP INDEX IF EXISTS public.idx_rate_limits_window_start;
DROP INDEX IF EXISTS public.idx_rate_limits_blocked_until;

-- =====================================================
-- FIX MULTIPLE PERMISSIVE POLICIES - beta_waitlist
-- =====================================================

-- Drop duplicate INSERT policies
DROP POLICY IF EXISTS "Anyone can sign up for beta waitlist" ON public.beta_waitlist;
DROP POLICY IF EXISTS "Public can join beta waitlist" ON public.beta_waitlist;

-- Create single consolidated INSERT policy
CREATE POLICY "Anyone can join beta waitlist"
  ON public.beta_waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Drop duplicate SELECT policies
DROP POLICY IF EXISTS "Authenticated users can read beta waitlist" ON public.beta_waitlist;
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON public.beta_waitlist;

-- Create single consolidated SELECT policy
CREATE POLICY "Authenticated users can view beta waitlist"
  ON public.beta_waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FIX MULTIPLE PERMISSIVE POLICIES - marketing_audits
-- =====================================================

-- Drop duplicate INSERT policies
DROP POLICY IF EXISTS "Anyone can submit audits" ON public.marketing_audits;
DROP POLICY IF EXISTS "Public can submit marketing audits" ON public.marketing_audits;

-- Create single consolidated INSERT policy
CREATE POLICY "Anyone can submit marketing audits"
  ON public.marketing_audits
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Drop duplicate SELECT policies
DROP POLICY IF EXISTS "Admins can view all audits" ON public.marketing_audits;
DROP POLICY IF EXISTS "Authenticated users can read marketing audits" ON public.marketing_audits;

-- Create single consolidated SELECT policy
CREATE POLICY "Authenticated users can view all marketing audits"
  ON public.marketing_audits
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Drop duplicate UPDATE policies
DROP POLICY IF EXISTS "Admins can update audits" ON public.marketing_audits;
DROP POLICY IF EXISTS "Public can update own audit by email" ON public.marketing_audits;

-- Create single consolidated UPDATE policy
CREATE POLICY "Admins can update marketing audits"
  ON public.marketing_audits
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- FIX RLS POLICY THAT RE-EVALUATES AUTH FUNCTIONS
-- =====================================================

-- Drop and recreate the admin delete policy with optimized auth check
DROP POLICY IF EXISTS "Admins can delete audits" ON public.marketing_audits;

CREATE POLICY "Admins can delete marketing audits"
  ON public.marketing_audits
  FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );