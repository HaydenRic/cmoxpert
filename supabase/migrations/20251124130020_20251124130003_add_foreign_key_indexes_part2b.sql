/*
  # Add Missing Foreign Key Indexes - Part 2B
  
  Deals, Demos, Fintech, Fraud indexes
*/

-- Deals
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON public.deal_stage_history(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_deal_id ON public.deal_touchpoints(deal_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);

-- Demo Bookings
CREATE INDEX IF NOT EXISTS idx_demo_bookings_lead_id ON public.demo_bookings(lead_id);

-- Fintech
CREATE INDEX IF NOT EXISTS idx_fintech_integration_configs_user_id ON public.fintech_integration_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_campaign_id ON public.fintech_metrics_daily(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_user_id ON public.fintech_metrics_daily(user_id);

-- Fraud
CREATE INDEX IF NOT EXISTS idx_fraud_events_campaign_id ON public.fraud_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_client_id ON public.fraud_events(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_user_id ON public.fraud_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_client_id ON public.fraud_provider_signals(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_provider_signals_integration_id ON public.fraud_provider_signals(integration_id);