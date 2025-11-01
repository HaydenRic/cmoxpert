/*
  # Fix Foreign Key Indexes and Security Issues

  1. Performance Improvements
    - Add indexes for all unindexed foreign keys across multiple tables
    - Remove unused index on clients table

  2. Security Fixes
    - Fix multiple permissive policies on videos table
    - Fix function search path for get_pending_sync_mappings

  3. Tables with Index Additions
    - activation_funnel: client_id, user_id
    - bank_connection_events: client_id, integration_id
    - brand_voice_examples: brand_voice_id
    - brand_voice_profiles: client_id
    - campaign_compliance_checks: campaign_id, user_id
    - campaign_predictions: client_id
    - campaign_touchpoints: touchpoint_id
    - competitor_alerts: competitor_id, user_id
    - competitors: user_id
    - connected_accounts: client_id, integration_id
    - content_ab_tests: parent_content_id, variation_content_id
    - content_approvals: approver_id, content_id
    - content_assets: content_id, uploaded_by
    - content_assignments: assigned_by, assigned_to, content_id
    - content_briefs: calendar_id, client_id, created_by
    - content_calendar: assigned_to, client_id, content_id, created_by
    - content_comments: content_id, parent_comment_id, user_id
    - content_seo_scores: content_id
    - content_templates: client_id, user_id
    - content_versions: created_by
    - deal_stage_history: deal_id
    - deal_touchpoints: deal_id
    - deals: client_id, user_id
    - demo_bookings: lead_id
    - fintech_integration_configs: user_id
    - fintech_metrics_daily: campaign_id, user_id
    - fraud_events: campaign_id, client_id, user_id
    - fraud_provider_signals: client_id, integration_id
    - generated_content: brand_voice_id, client_id, parent_content_id, user_id
    - google_search_console_properties: client_id
    - integration_sync_logs: integration_id, mapping_id
    - integration_syncs: integration_id
    - integration_webhooks: integration_id
    - integrations: user_id
    - kyc_provider_events: client_id, integration_id
    - marketing_campaigns: user_id
    - marketing_channel_metrics: client_id, integration_id
    - oauth_states: client_id, user_id
    - optimization_recommendations: client_id, user_id
    - payment_processor_events: client_id, integration_id
    - pitch_analytics: lead_id
    - playbooks: user_id
    - reports: client_id
    - revenue_forecasts: user_id
    - roi_calculations: lead_id
    - seo_keywords: content_id
    - user_events: client_id, user_id
    - verification_attempts: client_id, user_id
    - video_views: user_id, video_id
    - videos: uploaded_by

  4. Important Notes
    - Uses IF NOT EXISTS to prevent errors on existing indexes
    - Indexes improve query performance for foreign key lookups
    - All changes are safe and non-destructive
*/

-- Activation funnel indexes
CREATE INDEX IF NOT EXISTS idx_activation_funnel_client_id ON public.activation_funnel(client_id);
CREATE INDEX IF NOT EXISTS idx_activation_funnel_user_id ON public.activation_funnel(user_id);

-- Bank connection events indexes
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_client_id ON public.bank_connection_events(client_id);
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_integration_id ON public.bank_connection_events(integration_id);

-- Brand voice examples index
CREATE INDEX IF NOT EXISTS idx_brand_voice_examples_brand_voice_id ON public.brand_voice_examples(brand_voice_id);

-- Brand voice profiles index
CREATE INDEX IF NOT EXISTS idx_brand_voice_profiles_client_id ON public.brand_voice_profiles(client_id);

-- Campaign compliance checks indexes
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_campaign_id ON public.campaign_compliance_checks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_user_id ON public.campaign_compliance_checks(user_id);

-- Campaign predictions index
CREATE INDEX IF NOT EXISTS idx_campaign_predictions_client_id ON public.campaign_predictions(client_id);

-- Campaign touchpoints index
CREATE INDEX IF NOT EXISTS idx_campaign_touchpoints_touchpoint_id ON public.campaign_touchpoints(touchpoint_id);

-- Competitor alerts indexes
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_competitor_id ON public.competitor_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_user_id ON public.competitor_alerts(user_id);

-- Competitors index
CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON public.competitors(user_id);

-- Connected accounts indexes
CREATE INDEX IF NOT EXISTS idx_connected_accounts_client_id ON public.connected_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_integration_id ON public.connected_accounts(integration_id);

-- Content AB tests indexes
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_parent_content_id ON public.content_ab_tests(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_variation_content_id ON public.content_ab_tests(variation_content_id);

-- Content approvals indexes
CREATE INDEX IF NOT EXISTS idx_content_approvals_approver_id ON public.content_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_content_id ON public.content_approvals(content_id);

-- Content assets indexes
CREATE INDEX IF NOT EXISTS idx_content_assets_content_id ON public.content_assets(content_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_uploaded_by ON public.content_assets(uploaded_by);

-- Content assignments indexes
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_by ON public.content_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_to ON public.content_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_assignments_content_id ON public.content_assignments(content_id);

-- Content briefs indexes
CREATE INDEX IF NOT EXISTS idx_content_briefs_calendar_id ON public.content_briefs(calendar_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_client_id ON public.content_briefs(client_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_created_by ON public.content_briefs(created_by);

-- Content calendar indexes
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to ON public.content_calendar(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_calendar_client_id ON public.content_calendar(client_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_id ON public.content_calendar(content_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_created_by ON public.content_calendar(created_by);

-- Content comments indexes
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_comment_id ON public.content_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_user_id ON public.content_comments(user_id);

-- Content SEO scores index
CREATE INDEX IF NOT EXISTS idx_content_seo_scores_content_id ON public.content_seo_scores(content_id);

-- Content templates indexes
CREATE INDEX IF NOT EXISTS idx_content_templates_client_id ON public.content_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_user_id ON public.content_templates(user_id);

-- Content versions index
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by ON public.content_versions(created_by);

-- Deal stage history index
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON public.deal_stage_history(deal_id);

-- Deal touchpoints index
CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_deal_id ON public.deal_touchpoints(deal_id);

-- Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);

-- Demo bookings index
CREATE INDEX IF NOT EXISTS idx_demo_bookings_lead_id ON public.demo_bookings(lead_id);

-- Fintech integration configs index
CREATE INDEX IF NOT EXISTS idx_fintech_integration_configs_user_id ON public.fintech_integration_configs(user_id);

-- Fintech metrics daily indexes
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_campaign_id ON public.fintech_metrics_daily(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_user_id ON public.fintech_metrics_daily(user_id);

-- Fraud events indexes
CREATE INDEX IF NOT EXISTS idx_fraud_events_campaign_id ON public.fraud_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_client_id ON public.fraud_events(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_user_id ON public.fraud_events(user_id);

-- Fraud provider signals indexes
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_client_id ON public.fraud_provider_signals(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_integration_id ON public.fraud_provider_signals(integration_id);

-- Generated content indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_brand_voice_id ON public.generated_content(brand_voice_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_client_id ON public.generated_content(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_parent_content_id ON public.generated_content(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);

-- Google search console properties index
CREATE INDEX IF NOT EXISTS idx_google_search_console_properties_client_id ON public.google_search_console_properties(client_id);

-- Integration sync logs indexes
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration_id ON public.integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_mapping_id ON public.integration_sync_logs(mapping_id);

-- Integration syncs index
CREATE INDEX IF NOT EXISTS idx_integration_syncs_integration_id ON public.integration_syncs(integration_id);

-- Integration webhooks index
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_integration_id ON public.integration_webhooks(integration_id);

-- Integrations index
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);

-- KYC provider events indexes
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_client_id ON public.kyc_provider_events(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_integration_id ON public.kyc_provider_events(integration_id);

-- Marketing campaigns index
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);

-- Marketing channel metrics indexes
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_client_id ON public.marketing_channel_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_integration_id ON public.marketing_channel_metrics(integration_id);

-- OAuth states indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_client_id ON public.oauth_states(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON public.oauth_states(user_id);

-- Optimization recommendations indexes
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_client_id ON public.optimization_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_user_id ON public.optimization_recommendations(user_id);

-- Payment processor events indexes
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_client_id ON public.payment_processor_events(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_integration_id ON public.payment_processor_events(integration_id);

-- Pitch analytics index
CREATE INDEX IF NOT EXISTS idx_pitch_analytics_lead_id ON public.pitch_analytics(lead_id);

-- Playbooks index
CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON public.playbooks(user_id);

-- Reports index
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON public.reports(client_id);

-- Revenue forecasts index
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_user_id ON public.revenue_forecasts(user_id);

-- ROI calculations index
CREATE INDEX IF NOT EXISTS idx_roi_calculations_lead_id ON public.roi_calculations(lead_id);

-- SEO keywords index
CREATE INDEX IF NOT EXISTS idx_seo_keywords_content_id ON public.seo_keywords(content_id);

-- User events indexes
CREATE INDEX IF NOT EXISTS idx_user_events_client_id ON public.user_events(client_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);

-- Verification attempts indexes
CREATE INDEX IF NOT EXISTS idx_verification_attempts_client_id ON public.verification_attempts(client_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_user_id ON public.verification_attempts(user_id);

-- Video views indexes
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON public.video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views(video_id);

-- Videos index
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON public.videos(uploaded_by);

-- Remove unused index
DROP INDEX IF EXISTS public.idx_clients_user_id;

-- Fix multiple permissive policies on videos table
-- Drop the duplicate policy and keep only the most restrictive one
DROP POLICY IF EXISTS "Users can view active videos" ON public.videos;

-- Recreate a single, properly scoped policy
CREATE POLICY "Authenticated users can view active videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Fix function search path for get_pending_sync_mappings
DROP FUNCTION IF EXISTS public.get_pending_sync_mappings();

CREATE OR REPLACE FUNCTION public.get_pending_sync_mappings()
RETURNS TABLE (
  mapping_id uuid,
  integration_id uuid,
  source_field text,
  target_field text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    im.id as mapping_id,
    im.integration_id,
    im.source_field,
    im.target_field
  FROM integration_field_mappings im
  WHERE im.is_active = true
  AND im.integration_id IN (
    SELECT id FROM integrations WHERE status = 'active'
  );
END;
$$;
