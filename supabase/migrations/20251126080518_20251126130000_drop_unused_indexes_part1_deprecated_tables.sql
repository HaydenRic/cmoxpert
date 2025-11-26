/*
  # Drop Unused Indexes - Part 1: Deprecated Tables
  
  Removes indexes from tables that were deprecated during platform simplification.
  These indexes are no longer needed as the features have been removed.
  
  Tables affected:
  - activation_funnel (deprecated)
  - fraud_events (deprecated)
  - fraud_provider_signals (deprecated)
  - campaign_compliance_checks (deprecated)
  - optimization_recommendations (deprecated)
  - pitch_analytics (deprecated)
  - roi_calculations (deprecated)
  - video_views (deprecated)
  - videos (deprecated)
  
  Security Impact: Reduces database overhead and improves performance
*/

-- Drop indexes from activation_funnel (deprecated table)
DROP INDEX IF EXISTS idx_activation_funnel_client_id;
DROP INDEX IF EXISTS idx_activation_funnel_user_id;

-- Drop indexes from fraud_events (deprecated table)
DROP INDEX IF EXISTS idx_fraud_events_campaign_id;
DROP INDEX IF EXISTS idx_fraud_events_client_id;
DROP INDEX IF EXISTS idx_fraud_events_user_id;

-- Drop indexes from fraud_provider_signals (deprecated table)
DROP INDEX IF EXISTS idx_fraud_provider_signals_client_id;
DROP INDEX IF EXISTS idx_fraud_provider_signals_integration_id;

-- Drop indexes from campaign_compliance_checks (deprecated table)
DROP INDEX IF EXISTS idx_campaign_compliance_checks_campaign_id;
DROP INDEX IF EXISTS idx_campaign_compliance_checks_user_id;

-- Drop indexes from optimization_recommendations (deprecated table)
DROP INDEX IF EXISTS idx_optimization_recommendations_client_id;
DROP INDEX IF EXISTS idx_optimization_recommendations_user_id;

-- Drop indexes from pitch_analytics (deprecated table)
DROP INDEX IF EXISTS idx_pitch_analytics_lead_id;

-- Drop indexes from roi_calculations (deprecated table)
DROP INDEX IF EXISTS idx_roi_calculations_lead_id;

-- Drop indexes from video_views (deprecated table)
DROP INDEX IF EXISTS idx_video_views_user_id;
DROP INDEX IF EXISTS idx_video_views_video_id;

-- Drop indexes from videos (deprecated table)
DROP INDEX IF EXISTS idx_videos_uploaded_by;