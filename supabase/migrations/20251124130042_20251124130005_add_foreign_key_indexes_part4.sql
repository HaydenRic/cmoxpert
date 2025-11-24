/*
  # Add Missing Foreign Key Indexes - Part 4
  
  OAuth, Optimization, Playbooks, Reports, SEO, Videos
*/

-- OAuth States
CREATE INDEX IF NOT EXISTS idx_oauth_states_client_id ON public.oauth_states(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON public.oauth_states(user_id);

-- Optimization & Pitch
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_client_id ON public.optimization_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_user_id ON public.optimization_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_analytics_lead_id ON public.pitch_analytics(lead_id);

-- Playbooks
CREATE INDEX IF NOT EXISTS idx_playbooks_source_client_id ON public.playbooks(source_client_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON public.playbooks(user_id);

-- Reports & Revenue
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON public.reports(client_id);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_user_id ON public.revenue_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_lead_id ON public.roi_calculations(lead_id);

-- SEO & User Events
CREATE INDEX IF NOT EXISTS idx_seo_keywords_content_id ON public.seo_keywords(content_id);
CREATE INDEX IF NOT EXISTS idx_user_events_client_id ON public.user_events(client_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);

-- Verification & Videos
CREATE INDEX IF NOT EXISTS idx_verification_attempts_client_id ON public.verification_attempts(client_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_user_id ON public.verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON public.video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON public.videos(uploaded_by);