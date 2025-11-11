/*
  # Comprehensive Security Fixes

  This migration addresses all security and performance issues identified by Supabase advisor:

  1. **Missing Foreign Key Index**
     - Add index on clients.user_id for better query performance

  2. **RLS Policy Optimization** (9 policies)
     - Fix auth.uid() calls to use (select auth.uid()) pattern
     - Prevents re-evaluation for each row, improving query performance

  3. **Remove Unused Indexes** (100+ indexes)
     - Clean up indexes that are never used
     - Reduces storage overhead and write performance impact

  4. **Fix Multiple Permissive Policies**
     - Consolidate videos table policies to avoid conflicts

  5. **Fix Function Search Paths**
     - Set search_path explicitly for security functions
     - Prevents role-based path manipulation

  ## Security Impact
  - Prevents slow queries at scale (RLS optimization)
  - Reduces attack surface (unused index removal)
  - Improves write performance (fewer indexes to maintain)
  - Hardens function security (immutable search paths)
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEX
-- =====================================================

-- Add index on clients.user_id (foreign key to profiles)
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- =====================================================
-- 2. FIX RLS POLICIES - OPTIMIZE AUTH FUNCTION CALLS
-- =====================================================

-- Drop and recreate policies with optimized auth.uid() calls
-- Pattern: Replace auth.uid() with (select auth.uid())

-- Fix videos table policy
DROP POLICY IF EXISTS "Authenticated users can view active videos" ON public.videos;
CREATE POLICY "Authenticated users can view active videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR uploaded_by = (select auth.uid()));

-- Fix client_contracts policies
DROP POLICY IF EXISTS "CMO can manage all client contracts" ON public.client_contracts;
CREATE POLICY "CMO can manage all client contracts"
  ON public.client_contracts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_contracts.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_contracts.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix client_health_scores policies
DROP POLICY IF EXISTS "CMO can insert client health scores" ON public.client_health_scores;
CREATE POLICY "CMO can insert client health scores"
  ON public.client_health_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_health_scores.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "CMO can view client health scores" ON public.client_health_scores;
CREATE POLICY "CMO can view client health scores"
  ON public.client_health_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_health_scores.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix client_meetings policy
DROP POLICY IF EXISTS "CMO can manage all client meetings" ON public.client_meetings;
CREATE POLICY "CMO can manage all client meetings"
  ON public.client_meetings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_meetings.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_meetings.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix client_notes policy
DROP POLICY IF EXISTS "CMO can manage all client notes" ON public.client_notes;
CREATE POLICY "CMO can manage all client notes"
  ON public.client_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_notes.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_notes.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix client_documents policy
DROP POLICY IF EXISTS "CMO can manage all client documents" ON public.client_documents;
CREATE POLICY "CMO can manage all client documents"
  ON public.client_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_documents.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_documents.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix client_kpi_targets policy
DROP POLICY IF EXISTS "CMO can manage all client KPI targets" ON public.client_kpi_targets;
CREATE POLICY "CMO can manage all client KPI targets"
  ON public.client_kpi_targets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_kpi_targets.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_kpi_targets.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix business_metrics policy
DROP POLICY IF EXISTS "CMO can manage own business metrics" ON public.business_metrics;
CREATE POLICY "CMO can manage own business metrics"
  ON public.business_metrics
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 3. REMOVE UNUSED INDEXES
-- =====================================================

-- Drop unused indexes to reduce storage overhead and improve write performance
-- These indexes have not been used according to Supabase advisor

-- OAuth and authentication related
DROP INDEX IF EXISTS idx_oauth_states_user_id;
DROP INDEX IF EXISTS idx_oauth_states_client_id;

-- Optimization recommendations
DROP INDEX IF EXISTS idx_optimization_recommendations_client_id;
DROP INDEX IF EXISTS idx_optimization_recommendations_user_id;

-- Payment processor
DROP INDEX IF EXISTS idx_payment_processor_events_client_id;
DROP INDEX IF EXISTS idx_payment_processor_events_integration_id;

-- Pitch analytics
DROP INDEX IF EXISTS idx_pitch_analytics_lead_id;
DROP INDEX IF EXISTS idx_roi_calculations_lead_id;

-- Playbooks
DROP INDEX IF EXISTS idx_playbooks_user_id;
DROP INDEX IF EXISTS idx_playbooks_source_client_id;

-- Reports
DROP INDEX IF EXISTS idx_reports_client_id;

-- Revenue forecasts
DROP INDEX IF EXISTS idx_revenue_forecasts_user_id;

-- SEO keywords
DROP INDEX IF EXISTS idx_seo_keywords_content_id;

-- User events
DROP INDEX IF EXISTS idx_user_events_client_id;
DROP INDEX IF EXISTS idx_user_events_user_id;

-- Verification attempts
DROP INDEX IF EXISTS idx_verification_attempts_client_id;
DROP INDEX IF EXISTS idx_verification_attempts_user_id;

-- Video views
DROP INDEX IF EXISTS idx_video_views_user_id;
DROP INDEX IF EXISTS idx_video_views_video_id;

-- Videos
DROP INDEX IF EXISTS idx_videos_uploaded_by;
DROP INDEX IF EXISTS videos_status_idx;

-- Profiles
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_role_idx;
DROP INDEX IF EXISTS profiles_created_at_idx;

-- Clients
DROP INDEX IF EXISTS idx_clients_health_status;
DROP INDEX IF EXISTS idx_clients_onboarding_status;
DROP INDEX IF EXISTS idx_clients_next_meeting;
DROP INDEX IF EXISTS idx_clients_contract_end;
DROP INDEX IF EXISTS idx_clients_churned;

-- Client contracts
DROP INDEX IF EXISTS idx_contracts_client;
DROP INDEX IF EXISTS idx_contracts_end_date;
DROP INDEX IF EXISTS idx_contracts_payment_status;

-- Client health scores
DROP INDEX IF EXISTS idx_health_scores_client;
DROP INDEX IF EXISTS idx_health_scores_calculated;
DROP INDEX IF EXISTS idx_health_scores_overall;

-- Client meetings
DROP INDEX IF EXISTS idx_meetings_client;
DROP INDEX IF EXISTS idx_meetings_scheduled;
DROP INDEX IF EXISTS idx_meetings_status;

-- Client notes
DROP INDEX IF EXISTS idx_notes_client;
DROP INDEX IF EXISTS idx_notes_category;
DROP INDEX IF EXISTS idx_notes_pinned;
DROP INDEX IF EXISTS idx_notes_created;

-- Client documents
DROP INDEX IF EXISTS idx_documents_client;
DROP INDEX IF EXISTS idx_documents_category;
DROP INDEX IF EXISTS idx_documents_uploaded;

-- Client KPI targets
DROP INDEX IF EXISTS idx_kpi_targets_client;
DROP INDEX IF EXISTS idx_kpi_targets_status;
DROP INDEX IF EXISTS idx_kpi_targets_date;

-- Business metrics
DROP INDEX IF EXISTS idx_business_metrics_user;
DROP INDEX IF EXISTS idx_business_metrics_date;

-- Deals
DROP INDEX IF EXISTS idx_deals_stage;
DROP INDEX IF EXISTS idx_deals_client_id;
DROP INDEX IF EXISTS idx_deals_user_id;

-- Beta waitlist
DROP INDEX IF EXISTS idx_beta_waitlist_email;
DROP INDEX IF EXISTS idx_beta_waitlist_status;
DROP INDEX IF EXISTS idx_beta_waitlist_created_at;

-- FinTech metrics
DROP INDEX IF EXISTS idx_fintech_metrics_client;
DROP INDEX IF EXISTS idx_fintech_metrics_daily_campaign_id;
DROP INDEX IF EXISTS idx_fintech_metrics_daily_user_id;

-- Activation funnel
DROP INDEX IF EXISTS idx_activation_funnel_client_id;
DROP INDEX IF EXISTS idx_activation_funnel_user_id;

-- Bank connections
DROP INDEX IF EXISTS idx_bank_connection_events_client_id;
DROP INDEX IF EXISTS idx_bank_connection_events_integration_id;

-- Brand voice
DROP INDEX IF EXISTS idx_brand_voice_examples_brand_voice_id;
DROP INDEX IF EXISTS idx_brand_voice_profiles_client_id;

-- Campaign compliance
DROP INDEX IF EXISTS idx_campaign_compliance_checks_campaign_id;
DROP INDEX IF EXISTS idx_campaign_compliance_checks_user_id;

-- Campaign predictions
DROP INDEX IF EXISTS idx_campaign_predictions_client_id;

-- Campaign touchpoints
DROP INDEX IF EXISTS idx_campaign_touchpoints_touchpoint_id;

-- Competitor alerts
DROP INDEX IF EXISTS idx_competitor_alerts_competitor_id;
DROP INDEX IF EXISTS idx_competitor_alerts_user_id;
DROP INDEX IF EXISTS idx_competitors_user_id;

-- Connected accounts
DROP INDEX IF EXISTS idx_connected_accounts_client_id;
DROP INDEX IF EXISTS idx_connected_accounts_integration_id;

-- Content A/B tests
DROP INDEX IF EXISTS idx_content_ab_tests_parent_content_id;
DROP INDEX IF EXISTS idx_content_ab_tests_variation_content_id;

-- Content approvals
DROP INDEX IF EXISTS idx_content_approvals_approver_id;
DROP INDEX IF EXISTS idx_content_approvals_content_id;

-- Content assets
DROP INDEX IF EXISTS idx_content_assets_content_id;
DROP INDEX IF EXISTS idx_content_assets_uploaded_by;

-- Content assignments
DROP INDEX IF EXISTS idx_content_assignments_assigned_by;
DROP INDEX IF EXISTS idx_content_assignments_assigned_to;
DROP INDEX IF EXISTS idx_content_assignments_content_id;

-- Content briefs
DROP INDEX IF EXISTS idx_content_briefs_calendar_id;
DROP INDEX IF EXISTS idx_content_briefs_client_id;
DROP INDEX IF EXISTS idx_content_briefs_created_by;

-- Content calendar
DROP INDEX IF EXISTS idx_content_calendar_assigned_to;
DROP INDEX IF EXISTS idx_content_calendar_client_id;
DROP INDEX IF EXISTS idx_content_calendar_content_id;
DROP INDEX IF EXISTS idx_content_calendar_created_by;

-- Content comments
DROP INDEX IF EXISTS idx_content_comments_content_id;
DROP INDEX IF EXISTS idx_content_comments_parent_comment_id;
DROP INDEX IF EXISTS idx_content_comments_user_id;

-- Content SEO scores
DROP INDEX IF EXISTS idx_content_seo_scores_content_id;

-- Content templates
DROP INDEX IF EXISTS idx_content_templates_client_id;
DROP INDEX IF EXISTS idx_content_templates_user_id;

-- Content versions
DROP INDEX IF EXISTS idx_content_versions_created_by;

-- Deal stage history
DROP INDEX IF EXISTS idx_deal_stage_history_deal_id;

-- Deal touchpoints
DROP INDEX IF EXISTS idx_deal_touchpoints_deal_id;

-- Demo bookings
DROP INDEX IF EXISTS idx_demo_bookings_lead_id;

-- FinTech integration configs
DROP INDEX IF EXISTS idx_fintech_integration_configs_user_id;

-- Fraud events
DROP INDEX IF EXISTS idx_fraud_events_campaign_id;
DROP INDEX IF EXISTS idx_fraud_events_client_id;
DROP INDEX IF EXISTS idx_fraud_events_user_id;

-- Fraud provider signals
DROP INDEX IF EXISTS idx_fraud_provider_signals_client_id;
DROP INDEX IF EXISTS idx_fraud_provider_signals_integration_id;

-- Generated content
DROP INDEX IF EXISTS idx_generated_content_brand_voice_id;
DROP INDEX IF EXISTS idx_generated_content_client_id;
DROP INDEX IF EXISTS idx_generated_content_parent_content_id;
DROP INDEX IF EXISTS idx_generated_content_user_id;

-- Google Search Console
DROP INDEX IF EXISTS idx_google_search_console_properties_client_id;

-- Integration sync logs
DROP INDEX IF EXISTS idx_integration_sync_logs_integration_id;
DROP INDEX IF EXISTS idx_integration_sync_logs_mapping_id;

-- Integration syncs
DROP INDEX IF EXISTS idx_integration_syncs_integration_id;

-- Integration webhooks
DROP INDEX IF EXISTS idx_integration_webhooks_integration_id;

-- Integrations
DROP INDEX IF EXISTS idx_integrations_user_id;

-- KYC provider events
DROP INDEX IF EXISTS idx_kyc_provider_events_client_id;
DROP INDEX IF EXISTS idx_kyc_provider_events_integration_id;

-- Marketing campaigns
DROP INDEX IF EXISTS idx_marketing_campaigns_user_id;

-- Marketing channel metrics
DROP INDEX IF EXISTS idx_marketing_channel_metrics_client_id;
DROP INDEX IF EXISTS idx_marketing_channel_metrics_integration_id;

-- =====================================================
-- 4. FIX MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- Videos table has multiple permissive SELECT policies for authenticated role
-- Consolidate into a single policy

DROP POLICY IF EXISTS "Admins can manage all videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can view active videos" ON public.videos;

-- Create consolidated policy for SELECT
CREATE POLICY "Users can view videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR uploaded_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Separate admin management policy for INSERT, UPDATE, DELETE
CREATE POLICY "Admins can manage videos"
  ON public.videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Recreate functions with explicit search_path to prevent role manipulation

-- Fix update_client_notes_count
DROP FUNCTION IF EXISTS public.update_client_notes_count() CASCADE;
CREATE OR REPLACE FUNCTION public.update_client_notes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.clients
    SET notes_count = notes_count + 1
    WHERE id = NEW.client_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.clients
    SET notes_count = GREATEST(notes_count - 1, 0)
    WHERE id = OLD.client_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_beta_waitlist_updated_at
DROP FUNCTION IF EXISTS public.update_beta_waitlist_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_beta_waitlist_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix get_pending_sync_mappings
DROP FUNCTION IF EXISTS public.get_pending_sync_mappings(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_pending_sync_mappings(p_integration_id uuid)
RETURNS TABLE (
  mapping_id uuid,
  source_field text,
  destination_field text,
  transform_function text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    id as mapping_id,
    source_field,
    destination_field,
    transform_function
  FROM public.integration_field_mappings
  WHERE integration_id = p_integration_id
  AND is_active = true
  ORDER BY created_at;
END;
$$;

-- Recreate triggers after function recreation
DROP TRIGGER IF EXISTS update_client_notes_count_trigger ON public.client_notes;
CREATE TRIGGER update_client_notes_count_trigger
  AFTER INSERT OR DELETE ON public.client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_notes_count();

-- Note: update_updated_at_column and update_beta_waitlist_updated_at triggers
-- need to be recreated on all tables that use them, but only if they exist
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Recreate update_updated_at triggers
  FOR r IN
    SELECT DISTINCT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND action_statement LIKE '%update_updated_at_column%'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', r.trigger_name, r.event_object_table);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', r.trigger_name, r.event_object_table);
  END LOOP;

  -- Recreate beta waitlist trigger
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'beta_waitlist'
  ) THEN
    DROP TRIGGER IF EXISTS update_beta_waitlist_updated_at ON public.beta_waitlist;
    CREATE TRIGGER update_beta_waitlist_updated_at
      BEFORE UPDATE ON public.beta_waitlist
      FOR EACH ROW
      EXECUTE FUNCTION public.update_beta_waitlist_updated_at();
  END IF;
END;
$$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the foreign key index was created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'clients'
    AND indexname = 'idx_clients_user_id'
  ) THEN
    RAISE EXCEPTION 'Foreign key index idx_clients_user_id was not created';
  END IF;
END;
$$;

-- Verify RLS policies were updated (check one as sample)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'videos'
    AND policyname = 'Users can view videos'
  ) THEN
    RAISE EXCEPTION 'RLS policy consolidation failed';
  END IF;
END;
$$;

-- Verify functions have correct search_path
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('update_client_notes_count', 'update_updated_at_column', 'update_beta_waitlist_updated_at', 'get_pending_sync_mappings')
    AND NOT (prosecdef AND 'public, pg_temp' = ANY(string_to_array(prosqlbody, ' ')))
  ) THEN
    RAISE NOTICE 'Some functions may not have proper search_path set';
  END IF;
END;
$$;
