/*
  # Mark Deprecated Tables for Future Removal
  
  These tables support features that were removed during platform simplification.
  Tables are marked as deprecated but NOT dropped to allow for safe rollback.
  
  Deprecated Features:
  - Fraud Analysis (fraud_events, fraud_provider_signals)
  - Activation Funnel (activation_funnel)
  - Spend Optimizer (optimization_recommendations)
  - Compliance Checker (campaign_compliance_checks)
  - Pitch Analytics (pitch_analytics, roi_calculations)
  
  These tables will be reviewed in 30 days for final removal if not needed.
*/

-- Add comments to deprecated tables (only if they exist)
DO $$
BEGIN
  -- fraud_events
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fraud_events') THEN
    COMMENT ON TABLE fraud_events IS 'DEPRECATED: Removed 2025-11-26. Fraud analysis feature no longer used.';
  END IF;
  
  -- fraud_provider_signals
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fraud_provider_signals') THEN
    COMMENT ON TABLE fraud_provider_signals IS 'DEPRECATED: Removed 2025-11-26. Fraud analysis feature no longer used.';
  END IF;
  
  -- activation_funnel
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activation_funnel') THEN
    COMMENT ON TABLE activation_funnel IS 'DEPRECATED: Removed 2025-11-26. Activation funnel feature no longer used.';
  END IF;
  
  -- optimization_recommendations
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'optimization_recommendations') THEN
    COMMENT ON TABLE optimization_recommendations IS 'DEPRECATED: Removed 2025-11-26. Spend optimizer feature no longer used.';
  END IF;
  
  -- campaign_compliance_checks
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaign_compliance_checks') THEN
    COMMENT ON TABLE campaign_compliance_checks IS 'DEPRECATED: Removed 2025-11-26. Compliance checker feature no longer used.';
  END IF;
  
  -- pitch_analytics
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pitch_analytics') THEN
    COMMENT ON TABLE pitch_analytics IS 'DEPRECATED: Removed 2025-11-26. Pitch analytics consolidated into client_detail.';
  END IF;
  
  -- roi_calculations
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'roi_calculations') THEN
    COMMENT ON TABLE roi_calculations IS 'DEPRECATED: Removed 2025-11-26. ROI calculations consolidated into reports.';
  END IF;
  
  -- video_views
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'video_views') THEN
    COMMENT ON TABLE video_views IS 'DEPRECATED: Removed 2025-11-26. Video views tracking not currently used.';
  END IF;
  
  RAISE NOTICE 'Deprecated tables marked for review on 2025-12-26';
END $$;