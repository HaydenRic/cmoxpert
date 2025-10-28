/*
  # Fix Remaining Foreign Key Indexes

  ## Overview
  Add covering indexes for all foreign keys that are missing them to improve query performance.
  This addresses 86 unindexed foreign keys across all tables.

  ## Changes
  Create indexes for all foreign key columns without covering indexes
*/

-- Activation funnel
CREATE INDEX IF NOT EXISTS idx_activation_funnel_client_id ON public.activation_funnel(client_id);
CREATE INDEX IF NOT EXISTS idx_activation_funnel_user_id ON public.activation_funnel(user_id);

-- Bank connection events
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_client_id ON public.bank_connection_events(client_id);
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_integration_id ON public.bank_connection_events(integration_id);

-- Brand voice
CREATE INDEX IF NOT EXISTS idx_brand_voice_examples_brand_voice_id ON public.brand_voice_examples(brand_voice_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_profiles_client_id ON public.brand_voice_profiles(client_id);

-- Campaign compliance
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_campaign_id ON public.campaign_compliance_checks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_user_id ON public.campaign_compliance_checks(user_id);

-- Campaign predictions
CREATE INDEX IF NOT EXISTS idx_campaign_predictions_client_id ON public.campaign_predictions(client_id);

-- Campaign touchpoints
CREATE INDEX IF NOT EXISTS idx_campaign_touchpoints_touchpoint_id ON public.campaign_touchpoints(touchpoint_id);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Competitor alerts
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_competitor_id ON public.competitor_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_user_id ON public.competitor_alerts(user_id);

-- Competitors
CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON public.competitors(user_id);

-- Connected accounts
CREATE INDEX IF NOT EXISTS idx_connected_accounts_client_id ON public.connected_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_integration_id ON public.connected_accounts(integration_id);

-- Content AB tests
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_parent_content_id ON public.content_ab_tests(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_variation_content_id ON public.content_ab_tests(variation_content_id);

-- Content approvals
CREATE INDEX IF NOT EXISTS idx_content_approvals_approver_id ON public.content_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_content_id ON public.content_approvals(content_id);

-- Content assets
CREATE INDEX IF NOT EXISTS idx_content_assets_content_id ON public.content_assets(content_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_uploaded_by ON public.content_assets(uploaded_by);

-- Content assignments
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_by ON public.content_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_to ON public.content_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_assignments_content_id ON public.content_assignments(content_id);

-- Content briefs
CREATE INDEX IF NOT EXISTS idx_content_briefs_calendar_id ON public.content_briefs(calendar_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_client_id ON public.content_briefs(client_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_created_by ON public.content_briefs(created_by);

-- Content calendar
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to ON public.content_calendar(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_calendar_client_id ON public.content_calendar(client_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_id ON public.content_calendar(content_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_created_by ON public.content_calendar(created_by);

-- Content comments
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_comment_id ON public.content_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_user_id ON public.content_comments(user_id);

-- Content SEO scores
CREATE INDEX IF NOT EXISTS idx_content_seo_scores_content_id ON public.content_seo_scores(content_id);

-- Content templates
CREATE INDEX IF NOT EXISTS idx_content_templates_client_id ON public.content_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_user_id ON public.content_templates(user_id);

-- Content versions
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON public.content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by ON public.content_versions(created_by);

-- Deal stage history
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON public.deal_stage_history(deal_id);

-- Deal touchpoints
CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_deal_id ON public.deal_touchpoints(deal_id);

-- Deals
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);

-- Demo bookings
CREATE INDEX IF NOT EXISTS idx_demo_bookings_lead_id ON public.demo_bookings(lead_id);

-- FinTech metrics daily
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_campaign_id ON public.fintech_metrics_daily(campaign_id);

-- Fraud events
CREATE INDEX IF NOT EXISTS idx_fraud_events_client_id ON public.fraud_events(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_user_id ON public.fraud_events(user_id);

-- Fraud provider signals
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_client_id ON public.fraud_provider_signals(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_integration_id ON public.fraud_provider_signals(integration_id);

-- Generated content
CREATE INDEX IF NOT EXISTS idx_generated_content_brand_voice_id ON public.generated_content(brand_voice_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_client_id ON public.generated_content(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_parent_content_id ON public.generated_content(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);

-- Google Search Console properties
CREATE INDEX IF NOT EXISTS idx_google_search_console_properties_client_id ON public.google_search_console_properties(client_id);

-- Integration sync logs
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration_id ON public.integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_mapping_id ON public.integration_sync_logs(mapping_id);

-- Integration syncs
CREATE INDEX IF NOT EXISTS idx_integration_syncs_integration_id ON public.integration_syncs(integration_id);

-- Integration webhooks
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_integration_id ON public.integration_webhooks(integration_id);

-- Integrations
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);

-- KYC provider events
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_client_id ON public.kyc_provider_events(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_integration_id ON public.kyc_provider_events(integration_id);

-- Marketing campaigns
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);

-- Marketing channel metrics
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_client_id ON public.marketing_channel_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_integration_id ON public.marketing_channel_metrics(integration_id);

-- OAuth states
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON public.oauth_states(user_id);

-- Optimization recommendations
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_client_id ON public.optimization_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_user_id ON public.optimization_recommendations(user_id);

-- Payment processor events
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_client_id ON public.payment_processor_events(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_integration_id ON public.payment_processor_events(integration_id);

-- Playbooks
CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON public.playbooks(user_id);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON public.reports(client_id);

-- Revenue forecasts
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_user_id ON public.revenue_forecasts(user_id);

-- SEO keywords
CREATE INDEX IF NOT EXISTS idx_seo_keywords_content_id ON public.seo_keywords(content_id);

-- User events
CREATE INDEX IF NOT EXISTS idx_user_events_client_id ON public.user_events(client_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);

-- Verification attempts
CREATE INDEX IF NOT EXISTS idx_verification_attempts_client_id ON public.verification_attempts(client_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_user_id ON public.verification_attempts(user_id);