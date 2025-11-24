/*
  # Remove Unused Indexes - Part 3
  
  Removes remaining unused indexes
*/

-- Content Management Part 2
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
DROP INDEX IF EXISTS public.idx_seo_keywords_content_id;
DROP INDEX IF EXISTS public.idx_generated_content_brand_voice_id;
DROP INDEX IF EXISTS public.idx_generated_content_client_id;
DROP INDEX IF EXISTS public.idx_generated_content_parent_content_id;
DROP INDEX IF EXISTS public.idx_generated_content_user_id;

-- Integrations
DROP INDEX IF EXISTS public.idx_integrations_user_id;
DROP INDEX IF EXISTS public.idx_integration_sync_logs_integration_id;
DROP INDEX IF EXISTS public.idx_integration_sync_logs_mapping_id;
DROP INDEX IF EXISTS public.idx_integration_syncs_integration_id;
DROP INDEX IF EXISTS public.idx_integration_webhooks_integration_id;
DROP INDEX IF EXISTS public.idx_connected_accounts_client_id;
DROP INDEX IF EXISTS public.idx_connected_accounts_integration_id;
DROP INDEX IF EXISTS public.idx_google_search_console_properties_client_id;
DROP INDEX IF EXISTS public.idx_fintech_integration_configs_user_id;

-- Campaigns & Marketing
DROP INDEX IF EXISTS public.idx_marketing_campaigns_user_id;
DROP INDEX IF EXISTS public.idx_marketing_channel_metrics_client_id;
DROP INDEX IF EXISTS public.idx_marketing_channel_metrics_integration_id;
DROP INDEX IF EXISTS public.idx_campaign_compliance_checks_campaign_id;
DROP INDEX IF EXISTS public.idx_campaign_compliance_checks_user_id;
DROP INDEX IF EXISTS public.idx_campaign_predictions_client_id;
DROP INDEX IF EXISTS public.idx_campaign_touchpoints_touchpoint_id;

-- Competitors & Deals
DROP INDEX IF EXISTS public.idx_competitors_user_id;
DROP INDEX IF EXISTS public.idx_competitor_alerts_competitor_id;
DROP INDEX IF EXISTS public.idx_competitor_alerts_user_id;
DROP INDEX IF EXISTS public.idx_deals_client_id;
DROP INDEX IF EXISTS public.idx_deals_user_id;
DROP INDEX IF EXISTS public.idx_deals_stage;
DROP INDEX IF EXISTS public.idx_deal_stage_history_deal_id;
DROP INDEX IF EXISTS public.idx_deal_touchpoints_deal_id;

-- Miscellaneous
DROP INDEX IF EXISTS public.idx_demo_bookings_lead_id;
DROP INDEX IF EXISTS public.idx_pitch_analytics_lead_id;
DROP INDEX IF EXISTS public.idx_roi_calculations_lead_id;
DROP INDEX IF EXISTS public.idx_reports_client_id;
DROP INDEX IF EXISTS public.idx_revenue_forecasts_user_id;
DROP INDEX IF EXISTS public.idx_optimization_recommendations_client_id;
DROP INDEX IF EXISTS public.idx_optimization_recommendations_user_id;