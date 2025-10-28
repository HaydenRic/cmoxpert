/*
  # FinTech Integration Tables

  ## Overview
  Adds specific integration support for FinTech-focused third-party services:
  - Payment processors (Stripe, PayPal, Square)
  - Banking/account aggregation (Plaid, TrueLayer, Yodlee)
  - KYC/Identity verification (Jumio, Onfido, Persona)
  - Fraud detection (Sift, Forter, Sardine)

  ## New Tables

  ### 1. `fintech_integration_configs` - Service-specific configurations
  ### 2. `payment_processor_events` - Transaction and payment events from processors
  ### 3. `bank_connection_events` - Bank linking and account aggregation events
  ### 4. `kyc_provider_events` - Identity verification results from providers
  ### 5. `fraud_provider_signals` - Real-time fraud signals from detection services

  ## Security
  - Encrypted credential storage
  - API keys stored separately from config
  - Webhook signature verification
*/

-- =====================================================
-- 1. FINTECH INTEGRATION CONFIGS
-- =====================================================

CREATE TABLE IF NOT EXISTS fintech_integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Integration identification
  integration_type text NOT NULL CHECK (integration_type IN (
    'payment_processor', 'bank_aggregation', 'kyc_verification', 'fraud_detection'
  )),
  provider_name text NOT NULL, -- 'stripe', 'plaid', 'jumio', 'sift'

  -- Configuration
  api_key_encrypted text, -- Encrypted API key
  api_secret_encrypted text, -- Encrypted secret
  webhook_secret text, -- For webhook signature verification
  environment text DEFAULT 'production' CHECK (environment IN ('sandbox', 'production')),
  config jsonb DEFAULT '{}'::jsonb, -- Provider-specific settings

  -- Status
  is_active boolean DEFAULT true,
  is_connected boolean DEFAULT false,
  last_sync_at timestamptz,
  last_error text,

  -- Limits and costs
  monthly_request_limit integer,
  cost_per_request decimal(8,4), -- Cost per API call
  monthly_spend_cap decimal(12,2),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(client_id, provider_name, environment)
);

CREATE INDEX IF NOT EXISTS idx_fintech_integrations_client ON fintech_integration_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_fintech_integrations_provider ON fintech_integration_configs(provider_name);
CREATE INDEX IF NOT EXISTS idx_fintech_integrations_type ON fintech_integration_configs(integration_type);

-- =====================================================
-- 2. PAYMENT PROCESSOR EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_processor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  integration_id uuid REFERENCES fintech_integration_configs(id) ON DELETE CASCADE,

  -- External references
  external_customer_id text, -- Stripe customer ID, etc.
  external_transaction_id text, -- Stripe payment intent ID, etc.
  external_event_id text UNIQUE, -- Provider's event ID for deduplication

  -- Event details
  event_type text NOT NULL CHECK (event_type IN (
    'customer_created', 'payment_succeeded', 'payment_failed',
    'refund_issued', 'subscription_created', 'subscription_cancelled',
    'chargeback_created', 'payout_paid'
  )),
  event_timestamp timestamptz NOT NULL,

  -- Financial data
  amount decimal(12,2),
  currency text DEFAULT 'USD',
  fee_amount decimal(12,2),
  net_amount decimal(12,2),

  -- Payment method
  payment_method_type text, -- 'card', 'bank_account', 'wallet'
  payment_method_details jsonb DEFAULT '{}'::jsonb,

  -- Risk and fraud
  risk_score decimal(3,2), -- Provider's fraud score
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_disputed boolean DEFAULT false,

  -- Metadata
  customer_email text,
  customer_metadata jsonb DEFAULT '{}'::jsonb,
  raw_event_data jsonb DEFAULT '{}'::jsonb,

  -- Processing
  processed boolean DEFAULT false,
  processed_at timestamptz,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_client ON payment_processor_events(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_integration ON payment_processor_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_customer ON payment_processor_events(external_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_type ON payment_processor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_events_timestamp ON payment_processor_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_events_processed ON payment_processor_events(processed);

-- =====================================================
-- 3. BANK CONNECTION EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS bank_connection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  integration_id uuid REFERENCES fintech_integration_configs(id) ON DELETE CASCADE,

  -- External references
  external_user_id text, -- Plaid user ID
  external_item_id text, -- Plaid item ID (represents bank connection)
  external_account_id text, -- Plaid account ID

  -- Event details
  event_type text NOT NULL CHECK (event_type IN (
    'link_session_started', 'bank_connected', 'bank_disconnected',
    'credentials_updated', 'transactions_synced', 'balance_updated',
    'auth_verified', 'error_occurred'
  )),
  event_timestamp timestamptz NOT NULL,

  -- Bank details
  institution_name text,
  institution_id text,
  account_type text, -- 'checking', 'savings', 'credit', 'investment'
  account_mask text, -- Last 4 digits

  -- Success/failure
  status text CHECK (status IN ('success', 'failed', 'pending', 'requires_user_action')),
  error_code text,
  error_message text,

  -- Data synced
  transactions_count integer,
  balance_amount decimal(12,2),

  -- Metadata
  user_email text,
  raw_event_data jsonb DEFAULT '{}'::jsonb,

  -- Processing
  processed boolean DEFAULT false,
  processed_at timestamptz,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_events_client ON bank_connection_events(client_id);
CREATE INDEX IF NOT EXISTS idx_bank_events_integration ON bank_connection_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_bank_events_user ON bank_connection_events(external_user_id);
CREATE INDEX IF NOT EXISTS idx_bank_events_type ON bank_connection_events(event_type);
CREATE INDEX IF NOT EXISTS idx_bank_events_status ON bank_connection_events(status);
CREATE INDEX IF NOT EXISTS idx_bank_events_processed ON bank_connection_events(processed);

-- =====================================================
-- 4. KYC PROVIDER EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS kyc_provider_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  integration_id uuid REFERENCES fintech_integration_configs(id) ON DELETE CASCADE,

  -- External references
  external_verification_id text, -- Jumio/Onfido verification ID
  external_user_id text,

  -- Event details
  event_type text NOT NULL CHECK (event_type IN (
    'verification_started', 'verification_pending', 'verification_completed',
    'document_uploaded', 'selfie_uploaded', 'approved', 'rejected', 'manual_review'
  )),
  event_timestamp timestamptz NOT NULL,

  -- Verification type
  verification_type text CHECK (verification_type IN (
    'identity', 'document', 'proof_of_address', 'liveness', 'accreditation'
  )),

  -- Result
  status text NOT NULL CHECK (status IN (
    'pending', 'approved', 'declined', 'expired', 'abandoned'
  )),
  rejection_reason text,
  rejection_category text CHECK (rejection_category IN (
    'document_expired', 'document_invalid', 'photo_quality',
    'name_mismatch', 'age_requirement', 'prohibited_country', 'watchlist_match'
  )),

  -- Document details
  document_type text, -- 'passport', 'drivers_license', 'national_id'
  document_country text,
  document_number_masked text,

  -- Extracted data
  full_name text,
  date_of_birth date,
  address text,
  extracted_data jsonb DEFAULT '{}'::jsonb,

  -- Risk assessment
  risk_score decimal(3,2),
  watchlist_hits jsonb DEFAULT '[]'::jsonb,

  -- Quality metrics
  image_quality_score decimal(3,2),
  liveness_score decimal(3,2),

  -- Cost tracking
  provider_cost decimal(8,2), -- Cost charged by KYC provider

  -- Metadata
  user_email text,
  raw_event_data jsonb DEFAULT '{}'::jsonb,

  -- Processing
  processed boolean DEFAULT false,
  processed_at timestamptz,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_events_client ON kyc_provider_events(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_events_integration ON kyc_provider_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_kyc_events_verification ON kyc_provider_events(external_verification_id);
CREATE INDEX IF NOT EXISTS idx_kyc_events_type ON kyc_provider_events(event_type);
CREATE INDEX IF NOT EXISTS idx_kyc_events_status ON kyc_provider_events(status);
CREATE INDEX IF NOT EXISTS idx_kyc_events_processed ON kyc_provider_events(processed);

-- =====================================================
-- 5. FRAUD PROVIDER SIGNALS
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_provider_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  integration_id uuid REFERENCES fintech_integration_configs(id) ON DELETE CASCADE,

  -- External references
  external_user_id text, -- Sift user ID
  external_session_id text,
  external_event_id text,

  -- Signal details
  signal_type text NOT NULL CHECK (signal_type IN (
    'risk_score_updated', 'abuse_detected', 'workflow_decision',
    'device_fingerprint', 'account_score_changed', 'watchlist_match'
  )),
  signal_timestamp timestamptz NOT NULL,

  -- Risk assessment
  risk_score decimal(5,2) NOT NULL, -- 0 to 100
  risk_level text CHECK (risk_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  previous_score decimal(5,2),

  -- Abuse types detected
  abuse_types text[], -- ['account_takeover', 'payment_fraud', 'promo_abuse']

  -- Device and behavioral signals
  device_fingerprint text,
  ip_address inet,
  is_vpn boolean,
  is_proxy boolean,
  is_tor boolean,
  is_emulator boolean,

  -- Decision
  recommended_action text CHECK (recommended_action IN (
    'allow', 'review', 'challenge', 'block'
  )),
  decision_reason text,

  -- Risk factors
  risk_factors jsonb DEFAULT '[]'::jsonb,
  anomaly_scores jsonb DEFAULT '{}'::jsonb,

  -- Metadata
  user_email text,
  raw_signal_data jsonb DEFAULT '{}'::jsonb,

  -- Processing
  processed boolean DEFAULT false,
  processed_at timestamptz,
  action_taken text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_client ON fraud_provider_signals(client_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_integration ON fraud_provider_signals(integration_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_user ON fraud_provider_signals(external_user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_type ON fraud_provider_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_risk ON fraud_provider_signals(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_timestamp ON fraud_provider_signals(signal_timestamp);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_processed ON fraud_provider_signals(processed);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE fintech_integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_processor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_provider_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_provider_signals ENABLE ROW LEVEL SECURITY;

-- Integration configs policies
CREATE POLICY "Users can manage integrations for own clients"
  ON fintech_integration_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fintech_integration_configs.client_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fintech_integration_configs.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Payment processor events policies
CREATE POLICY "Users can view payment events for own clients"
  ON payment_processor_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = payment_processor_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Bank connection events policies
CREATE POLICY "Users can view bank events for own clients"
  ON bank_connection_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = bank_connection_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- KYC provider events policies
CREATE POLICY "Users can view KYC events for own clients"
  ON kyc_provider_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = kyc_provider_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Fraud signals policies
CREATE POLICY "Users can view fraud signals for own clients"
  ON fraud_provider_signals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fraud_provider_signals.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage fraud signals for own clients"
  ON fraud_provider_signals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fraud_provider_signals.client_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = fraud_provider_signals.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- =====================================================
-- WEBHOOK PROCESSING FUNCTIONS
-- =====================================================

-- Function to process payment processor webhook
CREATE OR REPLACE FUNCTION process_payment_event(
  p_event_data jsonb
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
BEGIN
  -- Insert payment event and return ID
  INSERT INTO payment_processor_events (
    client_id,
    external_event_id,
    event_type,
    event_timestamp,
    amount,
    currency,
    raw_event_data
  )
  SELECT
    -- Extract from webhook payload
    (p_event_data->>'client_id')::uuid,
    p_event_data->>'id',
    p_event_data->>'type',
    (p_event_data->>'created')::timestamptz,
    (p_event_data->'data'->'object'->>'amount')::decimal / 100, -- Stripe amounts in cents
    p_event_data->'data'->'object'->>'currency',
    p_event_data
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link provider events to user_events table
CREATE OR REPLACE FUNCTION sync_provider_event_to_user_event()
RETURNS TRIGGER AS $$
BEGIN
  -- When KYC is approved, create user_event
  IF NEW.event_type = 'approved' AND NEW.status = 'approved' THEN
    INSERT INTO user_events (
      user_id,
      client_id,
      event_type,
      event_timestamp,
      provider_name,
      provider_status
    ) VALUES (
      auth.uid(), -- Assuming user is authenticated
      NEW.client_id,
      'kyc_completed',
      NEW.event_timestamp,
      'jumio', -- Extract from integration
      'approved'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync KYC events
CREATE TRIGGER kyc_event_to_user_event
  AFTER INSERT ON kyc_provider_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'approved')
  EXECUTE FUNCTION sync_provider_event_to_user_event();
