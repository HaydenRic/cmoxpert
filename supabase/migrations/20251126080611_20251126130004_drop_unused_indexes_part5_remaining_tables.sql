/*
  # Drop Unused Indexes - Part 5: Remaining Tables
  
  Removes remaining unused indexes from various tables including:
  - Competitive intelligence
  - Integrations
  - Marketing analytics
  - Sales/deals
  - User events
  
  Tables affected:
  - competitor_alerts
  - competitors
  - connected_accounts
  - integration_sync_logs
  - integration_syncs
  - integration_webhooks
  - integrations
  - marketing_campaigns
  - marketing_channel_metrics
  - google_search_console_properties
  - oauth_states
  - deal_stage_history
  - deal_touchpoints
  - deals
  - demo_bookings
  - campaign_predictions
  - campaign_touchpoints
  - user_events
  - revenue_forecasts
  - playbooks
  - reports
  - generated_content
  - clients (specific unused index)
  
  Security Impact: Final cleanup of unused indexes across all tables
*/

-- Drop indexes from competitor tables
DROP INDEX IF EXISTS idx_competitor_alerts_competitor_id;
DROP INDEX IF EXISTS idx_competitor_alerts_user_id;
DROP INDEX IF EXISTS idx_competitors_user_id;

-- Drop indexes from integration tables
DROP INDEX IF EXISTS idx_connected_accounts_client_id;
DROP INDEX IF EXISTS idx_connected_accounts_integration_id;
DROP INDEX IF EXISTS idx_integration_sync_logs_integration_id;
DROP INDEX IF EXISTS idx_integration_sync_logs_mapping_id;
DROP INDEX IF EXISTS idx_integration_syncs_integration_id;
DROP INDEX IF EXISTS idx_integration_webhooks_integration_id;
DROP INDEX IF EXISTS idx_integrations_user_id;
DROP INDEX IF EXISTS idx_google_search_console_properties_client_id;

-- Drop indexes from marketing tables
DROP INDEX IF EXISTS idx_marketing_campaigns_user_id;
DROP INDEX IF EXISTS idx_marketing_channel_metrics_client_id;
DROP INDEX IF EXISTS idx_marketing_channel_metrics_integration_id;

-- Drop indexes from OAuth tables
DROP INDEX IF EXISTS idx_oauth_states_client_id;
DROP INDEX IF EXISTS idx_oauth_states_user_id;

-- Drop indexes from deal/sales tables
DROP INDEX IF EXISTS idx_deal_stage_history_deal_id;
DROP INDEX IF EXISTS idx_deal_touchpoints_deal_id;
DROP INDEX IF EXISTS idx_deals_client_id;
DROP INDEX IF EXISTS idx_deals_user_id;
DROP INDEX IF EXISTS idx_demo_bookings_lead_id;

-- Drop indexes from campaign analytics
DROP INDEX IF EXISTS idx_campaign_predictions_client_id;
DROP INDEX IF EXISTS idx_campaign_touchpoints_touchpoint_id;

-- Drop indexes from user events
DROP INDEX IF EXISTS idx_user_events_client_id;
DROP INDEX IF EXISTS idx_user_events_user_id;

-- Drop indexes from other tables
DROP INDEX IF EXISTS idx_revenue_forecasts_user_id;
DROP INDEX IF EXISTS idx_playbooks_source_client_id;
DROP INDEX IF EXISTS idx_playbooks_user_id;
DROP INDEX IF EXISTS idx_reports_client_id;

-- Drop indexes from generated_content
DROP INDEX IF EXISTS idx_generated_content_brand_voice_id;
DROP INDEX IF EXISTS idx_generated_content_client_id;
DROP INDEX IF EXISTS idx_generated_content_parent_content_id;
DROP INDEX IF EXISTS idx_generated_content_user_id;

-- Drop unused index from clients table (foreign key indexes remain via constraints)
DROP INDEX IF EXISTS idx_clients_user_id;