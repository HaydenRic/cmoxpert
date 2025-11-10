/*
  # Enhance Client Portfolio Management for Fractional CMO

  ## Overview
  This migration transforms the platform from generic user management to Fractional CMO
  client portfolio management. It adds business metrics, health tracking, and operational
  tools needed to manage FinTech clients effectively.

  ## New Tables

  ### 1. client_contracts
  Tracks contract details, billing, and renewal information for each client
  - Contract value (MRR)
  - Contract dates (start, end, renewal)
  - Tier level (Growth, Scale, Enterprise)
  - Payment status and billing cycle

  ### 2. client_health_scores
  Historical tracking of client health metrics over time
  - Overall health score (0-100)
  - CAC trend score
  - Fraud rate score
  - Activation rate score
  - Calculated timestamp

  ### 3. client_meetings
  Meeting history and upcoming client engagements
  - Meeting type (kickoff, review, strategy, emergency)
  - Scheduled date and duration
  - Meeting notes and outcomes
  - Action items and follow-ups

  ### 4. client_notes
  Internal notes and observations about clients
  - Note content with rich text support
  - Category (general, concern, opportunity, technical)
  - Priority level
  - Created by and timestamp

  ### 5. client_documents
  Document management for contracts, reports, presentations
  - File metadata (name, type, size)
  - Storage path in Supabase Storage
  - Document category (contract, report, presentation, other)
  - Upload tracking

  ### 6. client_kpi_targets
  Target KPIs and goals set for each client
  - KPI name (CAC, LTV:CAC, Fraud Rate, etc.)
  - Target value and current value
  - Target date for achievement
  - Status tracking

  ### 7. business_metrics
  CMO business operations metrics
  - Total MRR across all clients
  - Client count and capacity metrics
  - Utilization and bandwidth tracking
  - Monthly snapshot data

  ## Enhanced Existing Tables

  ### clients table additions:
  - company_size (enum: startup, growth, scale, enterprise)
  - contact_person (primary client contact name)
  - contact_email (primary client email)
  - contact_phone (optional phone)
  - monthly_spend (marketing budget per month)
  - contract_value (monthly recurring revenue from this client)
  - onboarding_status (enum: pending, in_progress, completed)
  - health_status (enum: thriving, stable, needs_attention, critical)
  - health_score (0-100 calculated score)
  - integration_status (jsonb: status of connected data sources)
  - last_report_date (when last report was generated)
  - next_meeting_date (upcoming meeting scheduled)
  - notes_count (quick reference for notes)
  - contract_start_date
  - contract_end_date
  - is_churned (boolean for tracking lost clients)

  ## Security
  - All tables have RLS enabled
  - All policies restrict access to authenticated user only (the CMO)
  - Audit trail with created_at timestamps
  - Proper indexes for performance

  ## Notes
  - This migration is designed for single-user (Fractional CMO) usage
  - All RLS policies use auth.uid() to ensure data privacy
  - Health scores are calculated based on client performance metrics
*/

-- =====================================================
-- 1. ENHANCE CLIENTS TABLE
-- =====================================================

-- Add new columns to clients table
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS company_size text DEFAULT 'growth' 
    CHECK (company_size IN ('startup', 'growth', 'scale', 'enterprise')),
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS monthly_spend numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_value numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'completed'
    CHECK (onboarding_status IN ('pending', 'in_progress', 'completed')),
  ADD COLUMN IF NOT EXISTS health_status text DEFAULT 'stable'
    CHECK (health_status IN ('thriving', 'stable', 'needs_attention', 'critical')),
  ADD COLUMN IF NOT EXISTS health_score integer DEFAULT 75 
    CHECK (health_score >= 0 AND health_score <= 100),
  ADD COLUMN IF NOT EXISTS integration_status jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_report_date timestamptz,
  ADD COLUMN IF NOT EXISTS next_meeting_date timestamptz,
  ADD COLUMN IF NOT EXISTS notes_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_start_date date,
  ADD COLUMN IF NOT EXISTS contract_end_date date,
  ADD COLUMN IF NOT EXISTS is_churned boolean DEFAULT false;

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_clients_health_status ON clients(health_status);
CREATE INDEX IF NOT EXISTS idx_clients_onboarding_status ON clients(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_clients_next_meeting ON clients(next_meeting_date);
CREATE INDEX IF NOT EXISTS idx_clients_contract_end ON clients(contract_end_date);
CREATE INDEX IF NOT EXISTS idx_clients_churned ON clients(is_churned);

-- =====================================================
-- 2. CLIENT CONTRACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL DEFAULT 'growth' 
    CHECK (tier IN ('growth', 'scale', 'enterprise')),
  mrr numeric(10,2) NOT NULL DEFAULT 0,
  contract_start_date date NOT NULL DEFAULT CURRENT_DATE,
  contract_end_date date,
  billing_cycle text DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  payment_status text DEFAULT 'active'
    CHECK (payment_status IN ('active', 'pending', 'overdue', 'cancelled')),
  auto_renewal boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMO can manage all client contracts"
  ON client_contracts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_contracts.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_contracts_client ON client_contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON client_contracts(contract_end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_payment_status ON client_contracts(payment_status);

-- =====================================================
-- 3. CLIENT HEALTH SCORES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  overall_score integer NOT NULL 
    CHECK (overall_score >= 0 AND overall_score <= 100),
  cac_trend_score integer DEFAULT 50
    CHECK (cac_trend_score >= 0 AND cac_trend_score <= 100),
  fraud_rate_score integer DEFAULT 50
    CHECK (fraud_rate_score >= 0 AND fraud_rate_score <= 100),
  activation_rate_score integer DEFAULT 50
    CHECK (activation_rate_score >= 0 AND activation_rate_score <= 100),
  engagement_score integer DEFAULT 50
    CHECK (engagement_score >= 0 AND engagement_score <= 100),
  calculated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMO can view client health scores"
  ON client_health_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_health_scores.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "CMO can insert client health scores"
  ON client_health_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_health_scores.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_health_scores_client ON client_health_scores(client_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_calculated ON client_health_scores(calculated_at);
CREATE INDEX IF NOT EXISTS idx_health_scores_overall ON client_health_scores(overall_score);

-- =====================================================
-- 4. CLIENT MEETINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  meeting_type text DEFAULT 'review'
    CHECK (meeting_type IN ('kickoff', 'review', 'strategy', 'emergency', 'other')),
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_notes text,
  action_items text[] DEFAULT '{}',
  attendees text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMO can manage all client meetings"
  ON client_meetings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_meetings.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_meetings_client ON client_meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON client_meetings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON client_meetings(status);

-- =====================================================
-- 5. CLIENT NOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  note_content text NOT NULL,
  category text DEFAULT 'general'
    CHECK (category IN ('general', 'concern', 'opportunity', 'technical', 'financial')),
  priority text DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMO can manage all client notes"
  ON client_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_notes.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_notes_client ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON client_notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON client_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_notes_created ON client_notes(created_at);

-- =====================================================
-- 6. CLIENT DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  storage_path text NOT NULL,
  document_category text DEFAULT 'other'
    CHECK (document_category IN ('contract', 'report', 'presentation', 'invoice', 'other')),
  description text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMO can manage all client documents"
  ON client_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_documents.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_documents_client ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON client_documents(document_category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded ON client_documents(uploaded_at);

-- =====================================================
-- 7. CLIENT KPI TARGETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_kpi_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  kpi_name text NOT NULL,
  kpi_category text DEFAULT 'marketing'
    CHECK (kpi_category IN ('marketing', 'revenue', 'activation', 'retention')),
  current_value numeric(12,2),
  target_value numeric(12,2) NOT NULL,
  unit text DEFAULT 'number',
  target_date date,
  status text DEFAULT 'in_progress'
    CHECK (status IN ('not_started', 'in_progress', 'achieved', 'at_risk', 'missed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_kpi_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMO can manage all client KPI targets"
  ON client_kpi_targets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_kpi_targets.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_kpi_targets_client ON client_kpi_targets(client_id);
CREATE INDEX IF NOT EXISTS idx_kpi_targets_status ON client_kpi_targets(status);
CREATE INDEX IF NOT EXISTS idx_kpi_targets_date ON client_kpi_targets(target_date);

-- =====================================================
-- 8. BUSINESS METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS business_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  total_mrr numeric(12,2) DEFAULT 0,
  active_clients integer DEFAULT 0,
  churned_clients integer DEFAULT 0,
  new_clients integer DEFAULT 0,
  total_reports_generated integer DEFAULT 0,
  avg_client_health_score integer,
  capacity_utilization numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMO can manage own business metrics"
  ON business_metrics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_business_metrics_user ON business_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_date ON business_metrics(metric_date);

-- =====================================================
-- 9. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update client notes count
CREATE OR REPLACE FUNCTION update_client_notes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clients 
    SET notes_count = notes_count + 1
    WHERE id = NEW.client_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clients 
    SET notes_count = GREATEST(0, notes_count - 1)
    WHERE id = OLD.client_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for notes count
DROP TRIGGER IF EXISTS trigger_update_notes_count ON client_notes;
CREATE TRIGGER trigger_update_notes_count
  AFTER INSERT OR DELETE ON client_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_client_notes_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_contracts_updated_at ON client_contracts;
CREATE TRIGGER update_client_contracts_updated_at
  BEFORE UPDATE ON client_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_meetings_updated_at ON client_meetings;
CREATE TRIGGER update_client_meetings_updated_at
  BEFORE UPDATE ON client_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_notes_updated_at ON client_notes;
CREATE TRIGGER update_client_notes_updated_at
  BEFORE UPDATE ON client_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_kpi_targets_updated_at ON client_kpi_targets;
CREATE TRIGGER update_client_kpi_targets_updated_at
  BEFORE UPDATE ON client_kpi_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();