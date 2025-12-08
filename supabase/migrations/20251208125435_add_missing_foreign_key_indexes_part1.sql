/*
  # Add Missing Foreign Key Indexes - Part 1
  
  1. Overview
    - Adds indexes for foreign key columns to improve query performance
    - Covers tables A-F (activation_funnel through fraud_provider_signals)
    
  2. Performance Impact
    - Significantly improves JOIN performance
    - Speeds up foreign key constraint checks
    - Reduces query execution time for related data lookups
    
  3. Tables Updated
    - activation_funnel: client_id, user_id
    - audit_follow_ups: audit_id
    - automated_deliverables: client_id, package_id
    - bank_connection_events: client_id, integration_id
    - brand_voice_examples: brand_voice_id
    - brand_voice_profiles: client_id
    - campaign_compliance_checks: campaign_id, user_id
    - campaign_predictions: client_id
    - campaign_touchpoints: touchpoint_id
    - client_contracts: client_id
    - client_documents: client_id
    - client_health_scores: client_id
    - client_kpi_targets: client_id
    - client_meetings: client_id
    - client_notes: client_id
    - client_subscriptions: client_id, package_id
    - client_success_metrics: client_id, subscription_id
    - clients: user_id
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
*/

-- activation_funnel
CREATE INDEX IF NOT EXISTS idx_activation_funnel_client_id ON public.activation_funnel(client_id);
CREATE INDEX IF NOT EXISTS idx_activation_funnel_user_id ON public.activation_funnel(user_id);

-- audit_follow_ups
CREATE INDEX IF NOT EXISTS idx_audit_follow_ups_audit_id ON public.audit_follow_ups(audit_id);

-- automated_deliverables
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_client_id ON public.automated_deliverables(client_id);
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_package_id ON public.automated_deliverables(package_id);

-- bank_connection_events
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_client_id ON public.bank_connection_events(client_id);
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_integration_id ON public.bank_connection_events(integration_id);

-- brand_voice_examples
CREATE INDEX IF NOT EXISTS idx_brand_voice_examples_brand_voice_id ON public.brand_voice_examples(brand_voice_id);

-- brand_voice_profiles
CREATE INDEX IF NOT EXISTS idx_brand_voice_profiles_client_id ON public.brand_voice_profiles(client_id);

-- campaign_compliance_checks
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_campaign_id ON public.campaign_compliance_checks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_user_id ON public.campaign_compliance_checks(user_id);

-- campaign_predictions
CREATE INDEX IF NOT EXISTS idx_campaign_predictions_client_id ON public.campaign_predictions(client_id);

-- campaign_touchpoints
CREATE INDEX IF NOT EXISTS idx_campaign_touchpoints_touchpoint_id ON public.campaign_touchpoints(touchpoint_id);

-- client_contracts
CREATE INDEX IF NOT EXISTS idx_client_contracts_client_id ON public.client_contracts(client_id);

-- client_documents
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON public.client_documents(client_id);

-- client_health_scores
CREATE INDEX IF NOT EXISTS idx_client_health_scores_client_id ON public.client_health_scores(client_id);

-- client_kpi_targets
CREATE INDEX IF NOT EXISTS idx_client_kpi_targets_client_id ON public.client_kpi_targets(client_id);

-- client_meetings
CREATE INDEX IF NOT EXISTS idx_client_meetings_client_id ON public.client_meetings(client_id);

-- client_notes
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON public.client_notes(client_id);

-- client_subscriptions
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client_id ON public.client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_package_id ON public.client_subscriptions(package_id);

-- client_success_metrics
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_client_id ON public.client_success_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_subscription_id ON public.client_success_metrics(subscription_id);

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- competitor_alerts
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_competitor_id ON public.competitor_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_user_id ON public.competitor_alerts(user_id);

-- competitors
CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON public.competitors(user_id);

-- connected_accounts
CREATE INDEX IF NOT EXISTS idx_connected_accounts_client_id ON public.connected_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_integration_id ON public.connected_accounts(integration_id);

-- content_ab_tests
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_parent_content_id ON public.content_ab_tests(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_variation_content_id ON public.content_ab_tests(variation_content_id);

-- content_approvals
CREATE INDEX IF NOT EXISTS idx_content_approvals_approver_id ON public.content_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_content_id ON public.content_approvals(content_id);

-- content_assets
CREATE INDEX IF NOT EXISTS idx_content_assets_content_id ON public.content_assets(content_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_uploaded_by ON public.content_assets(uploaded_by);

-- content_assignments
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_by ON public.content_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_to ON public.content_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_assignments_content_id ON public.content_assignments(content_id);

-- content_briefs
CREATE INDEX IF NOT EXISTS idx_content_briefs_calendar_id ON public.content_briefs(calendar_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_client_id ON public.content_briefs(client_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_created_by ON public.content_briefs(created_by);

-- content_calendar
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to ON public.content_calendar(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_calendar_client_id ON public.content_calendar(client_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_id ON public.content_calendar(content_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_created_by ON public.content_calendar(created_by);

-- content_comments
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_comment_id ON public.content_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_user_id ON public.content_comments(user_id);

-- content_seo_scores
CREATE INDEX IF NOT EXISTS idx_content_seo_scores_content_id ON public.content_seo_scores(content_id);

-- content_templates
CREATE INDEX IF NOT EXISTS idx_content_templates_client_id ON public.content_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_user_id ON public.content_templates(user_id);

-- content_versions
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by ON public.content_versions(created_by);

-- deal_stage_history
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON public.deal_stage_history(deal_id);

-- deal_touchpoints
CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_deal_id ON public.deal_touchpoints(deal_id);

-- deals
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);

-- demo_bookings
CREATE INDEX IF NOT EXISTS idx_demo_bookings_lead_id ON public.demo_bookings(lead_id);

-- fintech_integration_configs
CREATE INDEX IF NOT EXISTS idx_fintech_integration_configs_user_id ON public.fintech_integration_configs(user_id);

-- fintech_metrics_daily
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_campaign_id ON public.fintech_metrics_daily(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_user_id ON public.fintech_metrics_daily(user_id);

-- fraud_events
CREATE INDEX IF NOT EXISTS idx_fraud_events_campaign_id ON public.fraud_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_client_id ON public.fraud_events(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_user_id ON public.fraud_events(user_id);

-- fraud_provider_signals
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_client_id ON public.fraud_provider_signals(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_integration_id ON public.fraud_provider_signals(integration_id);