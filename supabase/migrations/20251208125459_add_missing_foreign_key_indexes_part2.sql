/*
  # Add Missing Foreign Key Indexes - Part 2
  
  1. Overview
    - Adds indexes for foreign key columns to improve query performance
    - Covers tables G-Z (generated_content through videos)
    
  2. Performance Impact
    - Significantly improves JOIN performance
    - Speeds up foreign key constraint checks
    - Reduces query execution time for related data lookups
    
  3. Tables Updated
    - generated_content: brand_voice_id, client_id, parent_content_id, user_id
    - google_search_console_properties: client_id
    - integration_sync_logs: integration_id, mapping_id
    - integration_syncs: integration_id
    - integration_webhooks: integration_id
    - integrations: user_id
    - kyc_provider_events: client_id, integration_id
    - marketing_audits: contacted_by
    - marketing_campaigns: user_id
    - marketing_channel_metrics: client_id, integration_id
    - oauth_states: client_id, user_id
    - optimization_recommendations: client_id, user_id
    - payment_processor_events: client_id, integration_id
    - pitch_analytics: lead_id
    - playbooks: source_client_id, user_id
    - reports: client_id
    - revenue_forecasts: user_id
    - roi_calculations: lead_id
    - seo_keywords: content_id
    - user_events: client_id, user_id
    - verification_attempts: client_id, user_id
    - video_views: user_id, video_id
    - videos: uploaded_by
*/

-- generated_content
CREATE INDEX IF NOT EXISTS idx_generated_content_brand_voice_id ON public.generated_content(brand_voice_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_client_id ON public.generated_content(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_parent_content_id ON public.generated_content(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);

-- google_search_console_properties
CREATE INDEX IF NOT EXISTS idx_google_search_console_properties_client_id ON public.google_search_console_properties(client_id);

-- integration_sync_logs
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration_id ON public.integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_mapping_id ON public.integration_sync_logs(mapping_id);

-- integration_syncs
CREATE INDEX IF NOT EXISTS idx_integration_syncs_integration_id ON public.integration_syncs(integration_id);

-- integration_webhooks
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_integration_id ON public.integration_webhooks(integration_id);

-- integrations
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);

-- kyc_provider_events
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_client_id ON public.kyc_provider_events(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_provider_events_integration_id ON public.kyc_provider_events(integration_id);

-- marketing_audits
CREATE INDEX IF NOT EXISTS idx_marketing_audits_contacted_by ON public.marketing_audits(contacted_by);

-- marketing_campaigns
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);

-- marketing_channel_metrics
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_client_id ON public.marketing_channel_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channel_metrics_integration_id ON public.marketing_channel_metrics(integration_id);

-- oauth_states
CREATE INDEX IF NOT EXISTS idx_oauth_states_client_id ON public.oauth_states(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON public.oauth_states(user_id);

-- optimization_recommendations
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_client_id ON public.optimization_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_user_id ON public.optimization_recommendations(user_id);

-- payment_processor_events
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_client_id ON public.payment_processor_events(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_processor_events_integration_id ON public.payment_processor_events(integration_id);

-- pitch_analytics
CREATE INDEX IF NOT EXISTS idx_pitch_analytics_lead_id ON public.pitch_analytics(lead_id);

-- playbooks
CREATE INDEX IF NOT EXISTS idx_playbooks_source_client_id ON public.playbooks(source_client_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON public.playbooks(user_id);

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON public.reports(client_id);

-- revenue_forecasts
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_user_id ON public.revenue_forecasts(user_id);

-- roi_calculations
CREATE INDEX IF NOT EXISTS idx_roi_calculations_lead_id ON public.roi_calculations(lead_id);

-- seo_keywords
CREATE INDEX IF NOT EXISTS idx_seo_keywords_content_id ON public.seo_keywords(content_id);

-- user_events
CREATE INDEX IF NOT EXISTS idx_user_events_client_id ON public.user_events(client_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);

-- verification_attempts
CREATE INDEX IF NOT EXISTS idx_verification_attempts_client_id ON public.verification_attempts(client_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_user_id ON public.verification_attempts(user_id);

-- video_views
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON public.video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views(video_id);

-- videos
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON public.videos(uploaded_by);