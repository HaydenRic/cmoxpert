/*
  # Fix Security and Performance Issues - Part 1

  ## Overview
  Fix indexes and RLS policies for better performance

  ## Changes
  1. Add missing foreign key indexes
  2. Optimize RLS policies with (select auth.uid()) pattern
  3. Remove duplicate permissive policies
  4. Drop unused indexes
*/

-- ============================================================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_fintech_integration_configs_user_id 
  ON public.fintech_integration_configs(user_id);

CREATE INDEX IF NOT EXISTS idx_fintech_metrics_daily_user_id 
  ON public.fintech_metrics_daily(user_id);

CREATE INDEX IF NOT EXISTS idx_fraud_events_campaign_id 
  ON public.fraud_events(campaign_id);

CREATE INDEX IF NOT EXISTS idx_oauth_states_client_id 
  ON public.oauth_states(client_id);

CREATE INDEX IF NOT EXISTS idx_pitch_analytics_lead_id 
  ON public.pitch_analytics(lead_id);

CREATE INDEX IF NOT EXISTS idx_roi_calculations_lead_id 
  ON public.roi_calculations(lead_id);

-- ============================================================================
-- PART 2: Optimize RLS Policies with (select auth.uid())
-- ============================================================================

-- payment_processor_events
DROP POLICY IF EXISTS "Users can view payment events for own clients" ON public.payment_processor_events;
CREATE POLICY "Users can view payment events for own clients"
  ON public.payment_processor_events FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- bank_connection_events
DROP POLICY IF EXISTS "Users can view bank events for own clients" ON public.bank_connection_events;
CREATE POLICY "Users can view bank events for own clients"
  ON public.bank_connection_events FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- kyc_provider_events
DROP POLICY IF EXISTS "Users can view KYC events for own clients" ON public.kyc_provider_events;
CREATE POLICY "Users can view KYC events for own clients"
  ON public.kyc_provider_events FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- user_events
DROP POLICY IF EXISTS "Users can view events for own clients" ON public.user_events;
CREATE POLICY "Users can view events for own clients"
  ON public.user_events FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert events for own clients" ON public.user_events;
CREATE POLICY "Users can insert events for own clients"
  ON public.user_events FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- fraud_events - Remove duplicate policies and create consolidated one
DROP POLICY IF EXISTS "Users can view fraud for own clients" ON public.fraud_events;
DROP POLICY IF EXISTS "Users can manage fraud for own clients" ON public.fraud_events;

CREATE POLICY "Users can access fraud for own clients"
  ON public.fraud_events FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- verification_attempts - Remove duplicate policies and create consolidated one
DROP POLICY IF EXISTS "Users can view verification for own clients" ON public.verification_attempts;
DROP POLICY IF EXISTS "Users can manage verification for own clients" ON public.verification_attempts;

CREATE POLICY "Users can access verification for own clients"
  ON public.verification_attempts FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- activation_funnel - Remove duplicate policies and create consolidated one
DROP POLICY IF EXISTS "Users can view activation for own clients" ON public.activation_funnel;
DROP POLICY IF EXISTS "Users can manage activation for own clients" ON public.activation_funnel;

CREATE POLICY "Users can access activation for own clients"
  ON public.activation_funnel FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- campaign_compliance_checks - Remove duplicate policies and create consolidated one
DROP POLICY IF EXISTS "Users can view own compliance checks" ON public.campaign_compliance_checks;
DROP POLICY IF EXISTS "Users can manage own compliance checks" ON public.campaign_compliance_checks;

CREATE POLICY "Users can access own compliance checks"
  ON public.campaign_compliance_checks FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- fintech_metrics_daily - Remove duplicate policies and create consolidated one
DROP POLICY IF EXISTS "Users can view metrics for own clients" ON public.fintech_metrics_daily;
DROP POLICY IF EXISTS "Users can manage metrics for own clients" ON public.fintech_metrics_daily;

CREATE POLICY "Users can access metrics for own clients"
  ON public.fintech_metrics_daily FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- oauth_states
DROP POLICY IF EXISTS "Users can manage own oauth states" ON public.oauth_states;
CREATE POLICY "Users can manage own oauth states"
  ON public.oauth_states FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM public.clients WHERE user_id = (select auth.uid())
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM public.clients WHERE user_id = (select auth.uid())
  ));

-- marketing_channel_metrics
DROP POLICY IF EXISTS "Users can view own marketing metrics" ON public.marketing_channel_metrics;
DROP POLICY IF EXISTS "Users can insert own marketing metrics" ON public.marketing_channel_metrics;
DROP POLICY IF EXISTS "Users can update own marketing metrics" ON public.marketing_channel_metrics;
DROP POLICY IF EXISTS "Users can delete own marketing metrics" ON public.marketing_channel_metrics;

CREATE POLICY "Users can access own marketing metrics"
  ON public.marketing_channel_metrics FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- competitors
DROP POLICY IF EXISTS "Users can manage own competitors" ON public.competitors;
CREATE POLICY "Users can manage own competitors"
  ON public.competitors FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- competitor_alerts
DROP POLICY IF EXISTS "Users can view own competitor alerts" ON public.competitor_alerts;
DROP POLICY IF EXISTS "Users can update own competitor alerts" ON public.competitor_alerts;

CREATE POLICY "Users can access own competitor alerts"
  ON public.competitor_alerts FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- fintech_integration_configs
DROP POLICY IF EXISTS "Users can manage integrations for own clients" ON public.fintech_integration_configs;
CREATE POLICY "Users can manage integrations for own clients"
  ON public.fintech_integration_configs FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- fraud_provider_signals
DROP POLICY IF EXISTS "Users can view fraud signals for own clients" ON public.fraud_provider_signals;
DROP POLICY IF EXISTS "Users can manage fraud signals for own clients" ON public.fraud_provider_signals;

CREATE POLICY "Users can access fraud signals for own clients"
  ON public.fraud_provider_signals FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
  );

-- competitor_metrics_history
DROP POLICY IF EXISTS "Users can view metrics for own competitors" ON public.competitor_metrics_history;
CREATE POLICY "Users can view metrics for own competitors"
  ON public.competitor_metrics_history FOR SELECT
  TO authenticated
  USING (
    competitor_id IN (
      SELECT id FROM public.competitors WHERE user_id = (select auth.uid())
    )
  );

-- campaign_predictions
DROP POLICY IF EXISTS "Users can manage own predictions" ON public.campaign_predictions;
CREATE POLICY "Users can manage own predictions"
  ON public.campaign_predictions FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- optimization_recommendations
DROP POLICY IF EXISTS "Users can manage own recommendations" ON public.optimization_recommendations;
CREATE POLICY "Users can manage own recommendations"
  ON public.optimization_recommendations FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- pricing_tiers - Remove duplicate policy
DROP POLICY IF EXISTS "Authenticated users can manage pricing tiers" ON public.pricing_tiers;