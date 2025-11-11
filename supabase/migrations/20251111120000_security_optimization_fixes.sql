/*
  # Security and Performance Optimization Fixes

  1. Indexes
    - Add missing index for clients.user_id foreign key
    - Drop unused indexes to reduce maintenance overhead

  2. RLS Policies
    - Optimize auth function calls using (select auth.uid()) pattern for better performance
    - Fix multiple permissive policies on videos table

  3. Functions
    - Set proper search_path for functions with SECURITY DEFINER

  4. Security Notes
    - Leaked password protection must be enabled in Supabase dashboard auth settings
*/

-- =====================================================
-- PART 1: Add Missing Foreign Key Index
-- =====================================================

-- Add index for clients.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- =====================================================
-- PART 2: Drop Unused Indexes
-- =====================================================

-- OAuth and integrations (unused)
DROP INDEX IF EXISTS public.idx_oauth_states_user_id;
DROP INDEX IF EXISTS public.idx_oauth_states_client_id;

-- Optimization recommendations (unused)
DROP INDEX IF EXISTS public.idx_optimization_recommendations_client_id;
DROP INDEX IF EXISTS public.idx_optimization_recommendations_user_id;

-- Payment processor events (unused)
DROP INDEX IF EXISTS public.idx_payment_processor_events_client_id;
DROP INDEX IF EXISTS public.idx_payment_processor_events_integration_id;

-- Pitch analytics (unused)
DROP INDEX IF EXISTS public.idx_pitch_analytics_lead_id;

-- Playbooks (unused)
DROP INDEX IF EXISTS public.idx_playbooks_user_id;
DROP INDEX IF EXISTS public.idx_playbooks_source_client_id;

-- Reports (unused)
DROP INDEX IF EXISTS public.idx_reports_client_id;

-- Revenue forecasts (unused)
DROP INDEX IF EXISTS public.idx_revenue_forecasts_user_id;

-- ROI calculations (unused)
DROP INDEX IF EXISTS public.idx_roi_calculations_lead_id;

-- SEO keywords (unused)
DROP INDEX IF EXISTS public.idx_seo_keywords_content_id;

-- User events (unused)
DROP INDEX IF EXISTS public.idx_user_events_client_id;
DROP INDEX IF EXISTS public.idx_user_events_user_id;

-- Verification attempts (unused)
DROP INDEX IF EXISTS public.idx_verification_attempts_client_id;
DROP INDEX IF EXISTS public.idx_verification_attempts_user_id;

-- Video views (unused)
DROP INDEX IF EXISTS public.idx_video_views_user_id;
DROP INDEX IF EXISTS public.idx_video_views_video_id;

-- Videos (unused)
DROP INDEX IF EXISTS public.idx_videos_uploaded_by;
DROP INDEX IF EXISTS public.videos_status_idx;

-- Profiles (unused)
DROP INDEX IF EXISTS public.profiles_email_idx;
DROP INDEX IF EXISTS public.profiles_role_idx;
DROP INDEX IF EXISTS public.profiles_created_at_idx;

-- Clients (unused)
DROP INDEX IF EXISTS public.idx_clients_health_status;
DROP INDEX IF EXISTS public.idx_clients_onboarding_status;
DROP INDEX IF EXISTS public.idx_clients_next_meeting;
DROP INDEX IF EXISTS public.idx_clients_contract_end;
DROP INDEX IF EXISTS public.idx_clients_churned;

-- Client contracts (unused)
DROP INDEX IF EXISTS public.idx_contracts_client;
DROP INDEX IF EXISTS public.idx_contracts_end_date;
DROP INDEX IF EXISTS public.idx_contracts_payment_status;

-- Client health scores (unused)
DROP INDEX IF EXISTS public.idx_health_scores_client;
DROP INDEX IF EXISTS public.idx_health_scores_calculated;
DROP INDEX IF EXISTS public.idx_health_scores_overall;

-- Client meetings (unused)
DROP INDEX IF EXISTS public.idx_meetings_client;
DROP INDEX IF EXISTS public.idx_meetings_scheduled;
DROP INDEX IF EXISTS public.idx_meetings_status;

-- Client notes (unused)
DROP INDEX IF EXISTS public.idx_notes_client;
DROP INDEX IF EXISTS public.idx_notes_category;
DROP INDEX IF EXISTS public.idx_notes_pinned;
DROP INDEX IF EXISTS public.idx_notes_created;

-- Client documents (unused)
DROP INDEX IF EXISTS public.idx_documents_client;
DROP INDEX IF EXISTS public.idx_documents_category;
DROP INDEX IF EXISTS public.idx_documents_uploaded;

-- Client KPI targets (unused)
DROP INDEX IF EXISTS public.idx_kpi_targets_client;
DROP INDEX IF EXISTS public.idx_kpi_targets_status;
DROP INDEX IF EXISTS public.idx_kpi_targets_date;

-- Business metrics (unused)
DROP INDEX IF EXISTS public.idx_business_metrics_user;
DROP INDEX IF EXISTS public.idx_business_metrics_date;

-- Deals (unused)
DROP INDEX IF EXISTS public.idx_deals_stage;
DROP INDEX IF EXISTS public.idx_deals_client_id;
DROP INDEX IF EXISTS public.idx_deals_user_id;

-- Beta waitlist (unused)
DROP INDEX IF EXISTS public.idx_beta_waitlist_email;
DROP INDEX IF EXISTS public.idx_beta_waitlist_status;
DROP INDEX IF EXISTS public.idx_beta_waitlist_created_at;

-- FinTech metrics (unused)
DROP INDEX IF EXISTS public.idx_fintech_metrics_client;
DROP INDEX IF EXISTS public.idx_fintech_metrics_daily_campaign_id;
DROP INDEX IF EXISTS public.idx_fintech_metrics_daily_user_id;

-- Activation funnel (unused)
DROP INDEX IF EXISTS public.idx_activation_funnel_client_id;
DROP INDEX IF EXISTS public.idx_activation_funnel_user_id;

-- All other unused indexes
DROP INDEX IF EXISTS public.idx_bank_connection_events_client_id;
DROP INDEX IF EXISTS public.idx_bank_connection_events_integration_id;
DROP INDEX IF EXISTS public.idx_brand_voice_examples_brand_voice_id;
DROP INDEX IF EXISTS public.idx_brand_voice_profiles_client_id;
DROP INDEX IF EXISTS public.idx_campaign_compliance_checks_campaign_id;
DROP INDEX IF EXISTS public.idx_campaign_compliance_checks_user_id;
DROP INDEX IF EXISTS public.idx_campaign_predictions_client_id;
DROP INDEX IF EXISTS public.idx_campaign_touchpoints_touchpoint_id;
DROP INDEX IF EXISTS public.idx_competitor_alerts_competitor_id;
DROP INDEX IF EXISTS public.idx_competitor_alerts_user_id;
DROP INDEX IF EXISTS public.idx_competitors_user_id;
DROP INDEX IF EXISTS public.idx_connected_accounts_client_id;
DROP INDEX IF EXISTS public.idx_connected_accounts_integration_id;
DROP INDEX IF EXISTS public.idx_content_ab_tests_parent_content_id;
DROP INDEX IF EXISTS public.idx_content_ab_tests_variation_content_id;
DROP INDEX IF EXISTS public.idx_content_approvals_approver_id;
DROP INDEX IF EXISTS public.idx_content_approvals_content_id;
DROP INDEX IF EXISTS public.idx_content_assets_content_id;
DROP INDEX IF EXISTS public.idx_content_assets_uploaded_by;
DROP INDEX IF EXISTS public.idx_content_assignments_assigned_by;
DROP INDEX IF EXISTS public.idx_content_assignments_assigned_to;
DROP INDEX IF EXISTS public.idx_content_assignments_content_id;
DROP INDEX IF EXISTS public.idx_content_briefs_calendar_id;
DROP INDEX IF EXISTS public.idx_content_briefs_client_id;
DROP INDEX IF EXISTS public.idx_content_briefs_created_by;
DROP INDEX IF EXISTS public.idx_content_calendar_assigned_to;
DROP INDEX IF EXISTS public.idx_content_calendar_client_id;
DROP INDEX IF EXISTS public.idx_content_calendar_content_id;
DROP INDEX IF EXISTS public.idx_content_calendar_created_by;
DROP INDEX IF EXISTS public.idx_content_comments_content_id;
DROP INDEX IF EXISTS public.idx_content_comments_parent_comment_id;
DROP INDEX IF EXISTS public.idx_content_comments_user_id;
DROP INDEX IF EXISTS public.idx_content_seo_scores_content_id;
DROP INDEX IF EXISTS public.idx_content_templates_client_id;
DROP INDEX IF EXISTS public.idx_content_templates_user_id;
DROP INDEX IF EXISTS public.idx_content_versions_created_by;
DROP INDEX IF EXISTS public.idx_deal_stage_history_deal_id;
DROP INDEX IF EXISTS public.idx_deal_touchpoints_deal_id;
DROP INDEX IF EXISTS public.idx_demo_bookings_lead_id;
DROP INDEX IF EXISTS public.idx_fintech_integration_configs_user_id;
DROP INDEX IF EXISTS public.idx_fraud_events_campaign_id;
DROP INDEX IF EXISTS public.idx_fraud_events_client_id;
DROP INDEX IF EXISTS public.idx_fraud_events_user_id;
DROP INDEX IF EXISTS public.idx_fraud_provider_signals_client_id;
DROP INDEX IF EXISTS public.idx_fraud_provider_signals_integration_id;
DROP INDEX IF EXISTS public.idx_generated_content_brand_voice_id;
DROP INDEX IF EXISTS public.idx_generated_content_client_id;
DROP INDEX IF EXISTS public.idx_generated_content_parent_content_id;
DROP INDEX IF EXISTS public.idx_generated_content_user_id;
DROP INDEX IF EXISTS public.idx_google_search_console_properties_client_id;
DROP INDEX IF EXISTS public.idx_integration_sync_logs_integration_id;
DROP INDEX IF EXISTS public.idx_integration_sync_logs_mapping_id;
DROP INDEX IF EXISTS public.idx_integration_syncs_integration_id;
DROP INDEX IF EXISTS public.idx_integration_webhooks_integration_id;
DROP INDEX IF EXISTS public.idx_integrations_user_id;
DROP INDEX IF EXISTS public.idx_kyc_provider_events_client_id;
DROP INDEX IF EXISTS public.idx_kyc_provider_events_integration_id;
DROP INDEX IF EXISTS public.idx_marketing_campaigns_user_id;
DROP INDEX IF EXISTS public.idx_marketing_channel_metrics_client_id;
DROP INDEX IF EXISTS public.idx_marketing_channel_metrics_integration_id;

-- =====================================================
-- PART 3: Optimize RLS Policies
-- =====================================================

-- Videos table: Fix multiple permissive policies and optimize auth calls
DROP POLICY IF EXISTS "Authenticated users can view active videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can manage all videos" ON public.videos;

CREATE POLICY "Users can view active videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage videos"
  ON public.videos
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())) = 'admin'
  );

-- Client contracts: Optimize auth calls
DROP POLICY IF EXISTS "CMO can manage all client contracts" ON public.client_contracts;

CREATE POLICY "CMO can manage client contracts"
  ON public.client_contracts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_contracts.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_contracts.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- Client health scores: Optimize auth calls
DROP POLICY IF EXISTS "CMO can insert client health scores" ON public.client_health_scores;
DROP POLICY IF EXISTS "CMO can view client health scores" ON public.client_health_scores;

CREATE POLICY "CMO can view client health scores"
  ON public.client_health_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_health_scores.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "CMO can insert client health scores"
  ON public.client_health_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_health_scores.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- Client meetings: Optimize auth calls
DROP POLICY IF EXISTS "CMO can manage all client meetings" ON public.client_meetings;

CREATE POLICY "CMO can manage client meetings"
  ON public.client_meetings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_meetings.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_meetings.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- Client notes: Optimize auth calls
DROP POLICY IF EXISTS "CMO can manage all client notes" ON public.client_notes;

CREATE POLICY "CMO can manage client notes"
  ON public.client_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_notes.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_notes.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- Client documents: Optimize auth calls
DROP POLICY IF EXISTS "CMO can manage all client documents" ON public.client_documents;

CREATE POLICY "CMO can manage client documents"
  ON public.client_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_documents.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_documents.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- Client KPI targets: Optimize auth calls
DROP POLICY IF EXISTS "CMO can manage all client KPI targets" ON public.client_kpi_targets;

CREATE POLICY "CMO can manage client KPI targets"
  ON public.client_kpi_targets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_kpi_targets.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_kpi_targets.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- Business metrics: Optimize auth calls
DROP POLICY IF EXISTS "CMO can manage own business metrics" ON public.business_metrics;

CREATE POLICY "CMO can manage own business metrics"
  ON public.business_metrics
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 4: Fix Function Search Paths
-- =====================================================

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_client_notes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE clients
  SET notes_count = (
    SELECT COUNT(*) FROM client_notes WHERE client_id = NEW.client_id
  )
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_beta_waitlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.get_pending_sync_mappings(uuid);

CREATE FUNCTION public.get_pending_sync_mappings(p_integration_id uuid)
RETURNS TABLE (
  mapping_id uuid,
  source_table text,
  destination_table text,
  field_mappings jsonb,
  sync_frequency text,
  last_sync timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ism.id,
    ism.source_table,
    ism.destination_table,
    ism.field_mappings,
    ism.sync_frequency,
    ism.last_sync
  FROM integration_sync_mappings ism
  WHERE ism.integration_id = p_integration_id
  AND ism.enabled = true
  AND (
    ism.last_sync IS NULL
    OR (
      CASE ism.sync_frequency
        WHEN 'realtime' THEN ism.last_sync < now() - interval '1 minute'
        WHEN 'hourly' THEN ism.last_sync < now() - interval '1 hour'
        WHEN 'daily' THEN ism.last_sync < now() - interval '1 day'
        WHEN 'weekly' THEN ism.last_sync < now() - interval '7 days'
        ELSE false
      END
    )
  )
  ORDER BY ism.last_sync ASC NULLS FIRST;
END;
$$;
