/*
  # Add Missing Foreign Key Indexes - Part 3
  
  Integrations, KYC, Marketing indexes
*/

-- Google Search Console
CREATE INDEX IF NOT EXISTS idx_google_search_console_properties_client_id ON public.google_search_console_properties(client_id);

-- Integration Sync & Logs
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration_id ON public.integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_mapping_id ON public.integration_sync_logs(mapping_id);
CREATE INDEX IF NOT EXISTS idx_integration_syncs_integration_id ON public.integration_syncs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_integration_id ON public.integration_webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);

-- KYC Provider Events
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_client_id ON public.kyc_provider_events(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_integration_id ON public.kyc_provider_events(integration_id);

-- Marketing
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_client_id ON public.marketing_channel_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_integration_id ON public.marketing_channel_metrics(integration_id);