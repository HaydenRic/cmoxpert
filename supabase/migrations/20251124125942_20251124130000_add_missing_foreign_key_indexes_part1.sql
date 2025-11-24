/*
  # Add Missing Foreign Key Indexes - Part 1
  
  Adds indexes for foreign key columns (1-40 of 106)
  Essential for JOIN performance and referential integrity checks
*/

-- Activation & Audits
CREATE INDEX IF NOT EXISTS idx_activation_funnel_client_id ON public.activation_funnel(client_id);
CREATE INDEX IF NOT EXISTS idx_activation_funnel_user_id ON public.activation_funnel(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_follow_ups_audit_id ON public.audit_follow_ups(audit_id);

-- Automated Deliverables
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_client_id ON public.automated_deliverables(client_id);
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_package_id ON public.automated_deliverables(package_id);

-- Bank & Payment Events
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_client_id ON public.bank_connection_events(client_id);
CREATE INDEX IF NOT EXISTS idx_bank_connection_events_integration_id ON public.bank_connection_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_client_id ON public.payment_processor_events(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_integration_id ON public.payment_processor_events(integration_id);

-- Brand Voice
CREATE INDEX IF NOT EXISTS idx_brand_voice_examples_brand_voice_id ON public.brand_voice_examples(brand_voice_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_profiles_client_id ON public.brand_voice_profiles(client_id);

-- Campaigns
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_campaign_id ON public.campaign_compliance_checks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checks_user_id ON public.campaign_compliance_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_predictions_client_id ON public.campaign_predictions(client_id);
CREATE INDEX IF NOT EXISTS idx_campaign_touchpoints_touchpoint_id ON public.campaign_touchpoints(touchpoint_id);

-- Client Management Core
CREATE INDEX IF NOT EXISTS idx_client_contracts_client_id ON public.client_contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON public.client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_health_scores_client_id ON public.client_health_scores(client_id);
CREATE INDEX IF NOT EXISTS idx_client_kpi_targets_client_id ON public.client_kpi_targets(client_id);
CREATE INDEX IF NOT EXISTS idx_client_meetings_client_id ON public.client_meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON public.client_notes(client_id);

-- Client Subscriptions & Success
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client_id ON public.client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_package_id ON public.client_subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_client_id ON public.client_success_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_subscription_id ON public.client_success_metrics(subscription_id);

-- Competitors
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_competitor_id ON public.competitor_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_user_id ON public.competitor_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON public.competitors(user_id);

-- Connected Accounts
CREATE INDEX IF NOT EXISTS idx_connected_accounts_client_id ON public.connected_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_integration_id ON public.connected_accounts(integration_id);

-- Content AB Tests & Approvals
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_parent_content_id ON public.content_ab_tests(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_variation_content_id ON public.content_ab_tests(variation_content_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_approver_id ON public.content_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_content_id ON public.content_approvals(content_id);

-- Content Assets & Assignments
CREATE INDEX IF NOT EXISTS idx_content_assets_content_id ON public.content_assets(content_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_uploaded_by ON public.content_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_by ON public.content_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_to ON public.content_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_assignments_content_id ON public.content_assignments(content_id);