/*
  # FinTech-Specific Tracking System

  ## Overview
  This migration adds comprehensive FinTech-specific tracking capabilities including:
  - Fraud detection and attribution
  - User activation funnel (sign-up to first transaction)
  - Verification drop-off tracking
  - Compliance monitoring
  - FinTech metrics and KPIs

  ## New Tables

  ### 1. `user_events` - Core event tracking for FinTech user journeys
  - Tracks all user actions from sign-up through first transaction
  - Supports fraud flagging and verification tracking
  - Links to marketing attribution

  ### 2. `fraud_events` - Fraud detection and tracking
  - Records fraud indicators and flags
  - Attribution of fraud by marketing source
  - Cost calculation per fraudulent user

  ### 3. `verification_attempts` - KYC/verification funnel tracking
  - Identity verification attempts and outcomes
  - Drop-off analysis at each verification stage
  - Provider-specific tracking (Jumio, Onfido, Plaid)

  ### 4. `activation_funnel` - User activation tracking
  - Stages from sign-up to first transaction
  - Time-in-stage analysis
  - Conversion rates by cohort and channel

  ### 5. `compliance_rules` - Regulatory compliance monitoring
  - FCA, SEC, FINRA rule definitions
  - Jurisdiction-specific requirements
  - Auto-flagging criteria

  ### 6. `campaign_compliance_checks` - Campaign compliance audit trail
  - Pre-launch compliance verification
  - Risk scoring by jurisdiction
  - Violation tracking

  ### 7. `fintech_metrics_daily` - Aggregated daily metrics
  - CAC by channel with fraud adjustment
  - LTV:CAC ratios
  - Activation rates
  - Verification success rates

  ## Security
  - RLS enabled on all tables
  - User-scoped data access
  - Compliance data audit trails

  ## Performance
  - Indexes on user_id, timestamps, and channel fields
  - Materialized view for real-time metrics dashboard
*/

-- =====================================================
-- 1. USER EVENTS - Core FinTech Journey Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,

  -- Event identification
  event_type text NOT NULL CHECK (event_type IN (
    'account_created', 'email_verified', 'kyc_started', 'kyc_completed',
    'bank_linked', 'account_funded', 'first_transaction', 'second_transaction',
    'kyc_failed', 'bank_linking_failed', 'account_suspended', 'account_closed'
  )),
  event_timestamp timestamptz NOT NULL DEFAULT now(),

  -- Marketing attribution
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  marketing_channel text CHECK (marketing_channel IN (
    'organic_search', 'paid_search', 'social_organic', 'social_paid',
    'email', 'direct', 'referral', 'affiliate', 'comparison_site', 'partner'
  )),

  -- Fraud indicators
  is_flagged_fraud boolean DEFAULT false,
  fraud_score decimal(3,2), -- 0.00 to 1.00
  fraud_reason text,

  -- User context
  ip_address inet,
  user_agent text,
  device_type text CHECK (device_type IN ('mobile', 'desktop', 'tablet')),

  -- Financial data (for transaction events)
  transaction_amount decimal(12,2),
  transaction_currency text DEFAULT 'USD',

  -- Provider data (for verification events)
  provider_name text, -- 'jumio', 'onfido', 'plaid', 'stripe'
  provider_status text,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_client ON user_events(client_id);
CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON user_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_channel ON user_events(marketing_channel);
CREATE INDEX IF NOT EXISTS idx_user_events_fraud ON user_events(is_flagged_fraud);

-- =====================================================
-- 2. FRAUD EVENTS - Fraud Detection & Cost Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,

  -- Fraud details
  detected_at timestamptz NOT NULL DEFAULT now(),
  fraud_type text NOT NULL CHECK (fraud_type IN (
    'identity_theft', 'synthetic_identity', 'account_takeover',
    'payment_fraud', 'bonus_abuse', 'multiple_accounts', 'bot_traffic'
  )),
  confidence_score decimal(3,2) NOT NULL, -- 0.00 to 1.00

  -- Detection method
  detection_method text CHECK (detection_method IN (
    'manual_review', 'automated_rule', 'ml_model', 'provider_flag', 'behavioral_analysis'
  )),
  detection_provider text, -- 'sift', 'forter', 'internal'

  -- Marketing attribution
  marketing_source text,
  marketing_channel text,
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE SET NULL,

  -- Cost impact
  marketing_cost_wasted decimal(12,2) DEFAULT 0, -- CAC spent on this fraudulent user
  estimated_loss decimal(12,2) DEFAULT 0, -- Potential loss if not caught

  -- Status
  status text DEFAULT 'detected' CHECK (status IN (
    'detected', 'investigating', 'confirmed', 'false_positive', 'resolved'
  )),
  resolution_date timestamptz,
  resolution_notes text,

  -- Evidence
  fraud_indicators jsonb DEFAULT '[]'::jsonb,
  risk_signals jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_events_client ON fraud_events(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_user ON fraud_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_detected ON fraud_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_fraud_events_type ON fraud_events(fraud_type);
CREATE INDEX IF NOT EXISTS idx_fraud_events_channel ON fraud_events(marketing_channel);
CREATE INDEX IF NOT EXISTS idx_fraud_events_status ON fraud_events(status);

-- =====================================================
-- 3. VERIFICATION ATTEMPTS - KYC/Bank Linking Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,

  -- Verification details
  verification_type text NOT NULL CHECK (verification_type IN (
    'identity_verification', 'document_upload', 'bank_linking',
    'address_verification', 'phone_verification', 'accreditation_check'
  )),

  -- Provider information
  provider_name text NOT NULL, -- 'jumio', 'onfido', 'plaid', 'trulioo'
  provider_attempt_id text, -- External reference

  -- Attempt details
  attempt_number integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  time_spent_seconds integer,

  -- Outcome
  status text NOT NULL CHECK (status IN (
    'initiated', 'in_progress', 'submitted', 'under_review',
    'approved', 'rejected', 'failed', 'abandoned', 'expired'
  )),
  failure_reason text,
  failure_category text CHECK (failure_category IN (
    'document_quality', 'expired_document', 'name_mismatch',
    'address_mismatch', 'selfie_failed', 'bank_not_found',
    'insufficient_balance', 'technical_error', 'user_abandoned'
  )),

  -- Marketing attribution
  acquisition_channel text,
  acquisition_source text,

  -- Cost tracking
  provider_cost decimal(8,2) DEFAULT 0, -- Cost per verification attempt

  -- Metadata
  document_type text,
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_client ON verification_attempts(client_id);
CREATE INDEX IF NOT EXISTS idx_verification_type ON verification_attempts(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_attempts(status);
CREATE INDEX IF NOT EXISTS idx_verification_started ON verification_attempts(started_at);
CREATE INDEX IF NOT EXISTS idx_verification_channel ON verification_attempts(acquisition_channel);

-- =====================================================
-- 4. ACTIVATION FUNNEL - Stage-by-Stage Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS activation_funnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,

  -- Funnel stage
  stage text NOT NULL CHECK (stage IN (
    'registered', 'email_verified', 'profile_completed',
    'kyc_submitted', 'kyc_approved', 'bank_linked',
    'account_funded', 'first_transaction'
  )),

  -- Timing
  entered_at timestamptz NOT NULL DEFAULT now(),
  exited_at timestamptz,
  completed boolean DEFAULT false,
  time_in_stage_seconds integer,

  -- Marketing attribution
  cohort_date date NOT NULL,
  cohort_week integer, -- Week number of year
  cohort_month integer, -- Month number
  acquisition_channel text,
  acquisition_source text,
  acquisition_campaign text,

  -- User context
  user_country text,
  user_device_type text,

  -- Drop-off analysis
  dropped_off boolean DEFAULT false,
  drop_off_reason text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activation_user ON activation_funnel(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_client ON activation_funnel(client_id);
CREATE INDEX IF NOT EXISTS idx_activation_stage ON activation_funnel(stage);
CREATE INDEX IF NOT EXISTS idx_activation_cohort ON activation_funnel(cohort_date);
CREATE INDEX IF NOT EXISTS idx_activation_channel ON activation_funnel(acquisition_channel);
CREATE INDEX IF NOT EXISTS idx_activation_dropped ON activation_funnel(dropped_off);

-- =====================================================
-- 5. COMPLIANCE RULES - Regulatory Requirements
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Rule identification
  rule_code text UNIQUE NOT NULL, -- 'FCA_FINANCIAL_PROMO_001'
  rule_name text NOT NULL,
  regulatory_body text NOT NULL CHECK (regulatory_body IN (
    'FCA', 'SEC', 'FINRA', 'CFPB', 'ESMA', 'MAS', 'GDPR', 'CCPA'
  )),

  -- Jurisdiction
  jurisdiction text NOT NULL, -- 'UK', 'US', 'EU', 'SG'
  applies_to_products jsonb DEFAULT '[]'::jsonb, -- ['banking', 'lending', 'investment']

  -- Rule definition
  rule_type text NOT NULL CHECK (rule_type IN (
    'prohibited_claim', 'required_disclosure', 'content_restriction',
    'targeting_restriction', 'approval_required', 'risk_warning_required'
  )),
  rule_description text NOT NULL,

  -- Detection criteria
  keywords_prohibited jsonb DEFAULT '[]'::jsonb,
  keywords_required jsonb DEFAULT '[]'::jsonb,
  pattern_regex text,

  -- Severity
  severity text DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  potential_fine_amount decimal(12,2),

  -- Status
  is_active boolean DEFAULT true,
  effective_date date NOT NULL,
  sunset_date date,

  -- References
  regulation_url text,
  internal_policy_notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_body ON compliance_rules(regulatory_body);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_jurisdiction ON compliance_rules(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_active ON compliance_rules(is_active);

-- =====================================================
-- 6. CAMPAIGN COMPLIANCE CHECKS - Audit Trail
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Check details
  checked_at timestamptz NOT NULL DEFAULT now(),
  check_type text NOT NULL CHECK (check_type IN (
    'pre_launch', 'periodic_review', 'complaint_triggered', 'audit'
  )),

  -- Results
  overall_status text NOT NULL CHECK (overall_status IN (
    'compliant', 'needs_review', 'violations_found', 'blocked'
  )),
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),

  -- Violations found
  violations_found jsonb DEFAULT '[]'::jsonb, -- Array of rule_code + description
  rules_triggered text[], -- Array of rule_codes

  -- Jurisdictions checked
  jurisdictions_checked text[] NOT NULL DEFAULT '{}',

  -- Reviewer
  reviewed_by text,
  review_notes text,
  approved_at timestamptz,

  -- Action taken
  action_required text CHECK (action_required IN (
    'none', 'modify_copy', 'add_disclosure', 'restrict_targeting', 'pause_campaign', 'cancel_campaign'
  )),
  action_taken text,
  action_completed_at timestamptz,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_compliance_campaign ON campaign_compliance_checks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_user ON campaign_compliance_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_status ON campaign_compliance_checks(overall_status);
CREATE INDEX IF NOT EXISTS idx_campaign_compliance_checked ON campaign_compliance_checks(checked_at);

-- =====================================================
-- 7. FINTECH METRICS DAILY - Aggregated Metrics
-- =====================================================

CREATE TABLE IF NOT EXISTS fintech_metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Date
  metric_date date NOT NULL,

  -- Channel breakdown
  channel text NOT NULL,
  source text,
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE SET NULL,

  -- Volume metrics
  total_registrations integer DEFAULT 0,
  total_activations integer DEFAULT 0,
  total_transactions integer DEFAULT 0,

  -- Fraud metrics
  fraud_flags integer DEFAULT 0,
  fraud_rate decimal(5,4) DEFAULT 0, -- 0.0000 to 1.0000

  -- Verification metrics
  verification_attempts integer DEFAULT 0,
  verification_completions integer DEFAULT 0,
  verification_success_rate decimal(5,4) DEFAULT 0,

  -- Activation funnel metrics
  kyc_started integer DEFAULT 0,
  kyc_completed integer DEFAULT 0,
  bank_linked integer DEFAULT 0,
  funded_accounts integer DEFAULT 0,

  -- Cost metrics
  marketing_spend decimal(12,2) DEFAULT 0,
  fraud_waste decimal(12,2) DEFAULT 0, -- Marketing spend on fraudulent users
  verification_costs decimal(12,2) DEFAULT 0,

  -- CAC calculations
  cac_raw decimal(10,2), -- Before fraud adjustment
  cac_clean decimal(10,2), -- After removing fraud waste
  cac_to_activation decimal(10,2), -- Cost per activated user
  cac_to_transaction decimal(10,2), -- Cost per transacting user

  -- LTV metrics
  avg_transaction_value decimal(12,2) DEFAULT 0,
  total_revenue decimal(12,2) DEFAULT 0,
  ltv_estimate decimal(12,2) DEFAULT 0,
  ltv_cac_ratio decimal(5,2),

  -- Time metrics (in hours)
  avg_time_to_kyc_hours decimal(8,2),
  avg_time_to_funding_hours decimal(8,2),
  avg_time_to_first_transaction_hours decimal(8,2),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(client_id, metric_date, channel, source)
);

CREATE INDEX IF NOT EXISTS idx_fintech_metrics_client ON fintech_metrics_daily(client_id);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_date ON fintech_metrics_daily(metric_date);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_channel ON fintech_metrics_daily(channel);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_campaign ON fintech_metrics_daily(campaign_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fintech_metrics_daily ENABLE ROW LEVEL SECURITY;

-- User events policies
CREATE POLICY "Users can view events for own clients"
  ON user_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = user_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events for own clients"
  ON user_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = user_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Fraud events policies
CREATE POLICY "Users can view fraud for own clients"
  ON fraud_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fraud_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage fraud for own clients"
  ON fraud_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fraud_events.client_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fraud_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Verification attempts policies
CREATE POLICY "Users can view verification for own clients"
  ON verification_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = verification_attempts.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage verification for own clients"
  ON verification_attempts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = verification_attempts.client_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = verification_attempts.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Activation funnel policies
CREATE POLICY "Users can view activation for own clients"
  ON activation_funnel FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = activation_funnel.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage activation for own clients"
  ON activation_funnel FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = activation_funnel.client_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = activation_funnel.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Compliance rules (public read, restricted write)
CREATE POLICY "All authenticated users can view compliance rules"
  ON compliance_rules FOR SELECT
  TO authenticated
  USING (true);

-- Campaign compliance checks policies
CREATE POLICY "Users can view own compliance checks"
  ON campaign_compliance_checks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own compliance checks"
  ON campaign_compliance_checks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- FinTech metrics policies
CREATE POLICY "Users can view metrics for own clients"
  ON fintech_metrics_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fintech_metrics_daily.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage metrics for own clients"
  ON fintech_metrics_daily FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fintech_metrics_daily.client_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fintech_metrics_daily.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS FOR METRIC CALCULATIONS
-- =====================================================

-- Function to calculate daily FinTech metrics
CREATE OR REPLACE FUNCTION calculate_fintech_metrics_daily(
  p_client_id uuid,
  p_date date
)
RETURNS void AS $$
BEGIN
  -- Delete existing metrics for this date
  DELETE FROM fintech_metrics_daily
  WHERE client_id = p_client_id
  AND metric_date = p_date;

  -- Calculate and insert new metrics by channel
  INSERT INTO fintech_metrics_daily (
    client_id,
    user_id,
    metric_date,
    channel,
    source,
    total_registrations,
    fraud_flags,
    verification_attempts,
    verification_completions,
    kyc_started,
    kyc_completed,
    bank_linked,
    funded_accounts,
    total_activations
  )
  SELECT
    p_client_id,
    c.user_id,
    p_date,
    ue.marketing_channel as channel,
    ue.utm_source as source,
    COUNT(DISTINCT CASE WHEN ue.event_type = 'account_created' THEN ue.user_id END) as total_registrations,
    COUNT(DISTINCT CASE WHEN ue.is_flagged_fraud = true THEN ue.user_id END) as fraud_flags,
    COUNT(CASE WHEN ue.event_type = 'kyc_started' THEN 1 END) as verification_attempts,
    COUNT(CASE WHEN ue.event_type = 'kyc_completed' THEN 1 END) as verification_completions,
    COUNT(DISTINCT CASE WHEN ue.event_type = 'kyc_started' THEN ue.user_id END) as kyc_started,
    COUNT(DISTINCT CASE WHEN ue.event_type = 'kyc_completed' THEN ue.user_id END) as kyc_completed,
    COUNT(DISTINCT CASE WHEN ue.event_type = 'bank_linked' THEN ue.user_id END) as bank_linked,
    COUNT(DISTINCT CASE WHEN ue.event_type = 'account_funded' THEN ue.user_id END) as funded_accounts,
    COUNT(DISTINCT CASE WHEN ue.event_type = 'first_transaction' THEN ue.user_id END) as total_activations
  FROM user_events ue
  JOIN clients c ON c.id = ue.client_id
  WHERE ue.client_id = p_client_id
  AND DATE(ue.event_timestamp) = p_date
  AND ue.marketing_channel IS NOT NULL
  GROUP BY c.user_id, ue.marketing_channel, ue.utm_source;

  -- Update calculated rates
  UPDATE fintech_metrics_daily
  SET
    fraud_rate = CASE WHEN total_registrations > 0
      THEN (fraud_flags::decimal / total_registrations::decimal)
      ELSE 0 END,
    verification_success_rate = CASE WHEN verification_attempts > 0
      THEN (verification_completions::decimal / verification_attempts::decimal)
      ELSE 0 END,
    updated_at = now()
  WHERE client_id = p_client_id
  AND metric_date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA - Sample Compliance Rules
-- =====================================================

INSERT INTO compliance_rules (rule_code, rule_name, regulatory_body, jurisdiction, rule_type, rule_description, keywords_prohibited, severity, effective_date) VALUES
('FCA_FP_001', 'Prohibited Guarantees', 'FCA', 'UK', 'prohibited_claim', 'Cannot guarantee returns or promise specific financial outcomes', '["guaranteed returns", "risk-free", "no risk", "guaranteed profit"]', 'high', '2020-01-01'),
('SEC_INV_001', 'Investment Advice Disclaimer', 'SEC', 'US', 'required_disclosure', 'Must include disclaimer that content is not investment advice', '[]', 'high', '2020-01-01'),
('FINRA_COMM_001', 'Approval Required', 'FINRA', 'US', 'approval_required', 'All retail communications must be approved by principal', '[]', 'critical', '2020-01-01'),
('FCA_FP_002', 'Capital at Risk Warning', 'FCA', 'UK', 'risk_warning_required', 'Must include warning that capital is at risk for investment products', '[]', 'critical', '2020-01-01'),
('CFPB_LOAN_001', 'APR Disclosure', 'CFPB', 'US', 'required_disclosure', 'Must clearly disclose APR for lending products', '[]', 'high', '2020-01-01')
ON CONFLICT (rule_code) DO NOTHING;
