/*
  # Remove Unused Indexes - Part 2
  
  Removes 50 more unused indexes
*/

-- Videos & Marketing
DROP INDEX IF EXISTS public.idx_videos_uploaded_by;
DROP INDEX IF EXISTS public.videos_status_idx;
DROP INDEX IF EXISTS public.idx_video_views_user_id;
DROP INDEX IF EXISTS public.idx_video_views_video_id;
DROP INDEX IF EXISTS public.idx_beta_waitlist_email;
DROP INDEX IF EXISTS public.idx_beta_waitlist_status;
DROP INDEX IF EXISTS public.idx_beta_waitlist_created_at;
DROP INDEX IF EXISTS public.idx_marketing_audits_email;
DROP INDEX IF EXISTS public.idx_marketing_audits_status;
DROP INDEX IF EXISTS public.idx_marketing_audits_created;
DROP INDEX IF EXISTS public.idx_marketing_audits_score;
DROP INDEX IF EXISTS public.idx_marketing_audits_ip;
DROP INDEX IF EXISTS public.idx_audit_follow_ups_audit;
DROP INDEX IF EXISTS public.idx_audit_follow_ups_scheduled;
DROP INDEX IF EXISTS public.idx_audit_follow_ups_outcome;

-- Fintech & Analytics
DROP INDEX IF EXISTS public.idx_fintech_metrics_client;
DROP INDEX IF EXISTS public.idx_fintech_metrics_daily_campaign_id;
DROP INDEX IF EXISTS public.idx_fintech_metrics_daily_user_id;
DROP INDEX IF EXISTS public.idx_activation_funnel_client_id;
DROP INDEX IF EXISTS public.idx_activation_funnel_user_id;
DROP INDEX IF EXISTS public.idx_bank_connection_events_client_id;
DROP INDEX IF EXISTS public.idx_bank_connection_events_integration_id;
DROP INDEX IF EXISTS public.idx_fraud_events_campaign_id;
DROP INDEX IF EXISTS public.idx_fraud_events_client_id;
DROP INDEX IF EXISTS public.idx_fraud_events_user_id;
DROP INDEX IF EXISTS public.idx_fraud_provider_signals_client_id;
DROP INDEX IF EXISTS public.idx_fraud_provider_signals_integration_id;
DROP INDEX IF EXISTS public.idx_kyc_provider_events_client_id;
DROP INDEX IF EXISTS public.idx_kyc_provider_events_integration_id;
DROP INDEX IF EXISTS public.idx_payment_processor_events_client_id;
DROP INDEX IF EXISTS public.idx_payment_processor_events_integration_id;
DROP INDEX IF EXISTS public.idx_verification_attempts_client_id;
DROP INDEX IF EXISTS public.idx_verification_attempts_user_id;
DROP INDEX IF EXISTS public.idx_user_events_client_id;
DROP INDEX IF EXISTS public.idx_user_events_user_id;

-- Content Management Part 1
DROP INDEX IF EXISTS public.idx_brand_voice_examples_brand_voice_id;
DROP INDEX IF EXISTS public.idx_brand_voice_profiles_client_id;
DROP INDEX IF EXISTS public.idx_content_ab_tests_parent_content_id;
DROP INDEX IF EXISTS public.idx_content_ab_tests_variation_content_id;
DROP INDEX IF EXISTS public.idx_content_approvals_approver_id;
DROP INDEX IF EXISTS public.idx_content_approvals_content_id;
DROP INDEX IF EXISTS public.idx_content_assets_content_id;
DROP INDEX IF EXISTS public.idx_content_assets_uploaded_by;
DROP INDEX IF EXISTS public.idx_content_assignments_assigned_by;
DROP INDEX IF EXISTS public.idx_content_assignments_assigned_to;
DROP INDEX IF EXISTS public.idx_content_assignments_content_id;
DROP INDEX IF EXISTS public.idx_content_briefs_calendar_id;
DROP INDEX IF EXISTS public.idx_content_briefs_client_id;
DROP INDEX IF EXISTS public.idx_content_briefs_created_by;