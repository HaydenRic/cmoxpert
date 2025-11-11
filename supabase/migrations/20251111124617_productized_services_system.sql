/*
  # Productized Services System

  ## Overview
  Creates the foundation for offering productized marketing agency services through the platform.
  This enables subscription-based packages replacing traditional agency retainers.

  ## New Tables

  ### service_packages
  - `id` (uuid, primary key)
  - `name` (text) - Package name (e.g., "Marketing Command Center")
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Package description
  - `monthly_price` (integer) - Price in cents
  - `annual_price` (integer) - Annual pricing (if offered)
  - `features` (jsonb) - Array of included features
  - `deliverables` (jsonb) - Specific deliverables and cadence
  - `client_limit` (integer) - Max clients allowed per tier
  - `is_active` (boolean) - Whether package is currently offered
  - `sort_order` (integer) - Display order on pricing page
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### client_subscriptions
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key to clients) 
  - `package_id` (uuid, foreign key to service_packages)
  - `status` (text) - active, paused, cancelled, expired
  - `billing_cycle` (text) - monthly, annual
  - `current_period_start` (timestamptz)
  - `current_period_end` (timestamptz)
  - `cancel_at_period_end` (boolean)
  - `stripe_subscription_id` (text) - If using Stripe
  - `metadata` (jsonb) - Additional subscription data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### automated_deliverables
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key to clients)
  - `package_id` (uuid, foreign key to service_packages)
  - `deliverable_type` (text) - weekly_report, monthly_strategy, quarterly_review, etc.
  - `status` (text) - pending, generating, completed, failed
  - `scheduled_for` (timestamptz) - When to generate
  - `generated_at` (timestamptz) - When it was generated
  - `content` (jsonb) - The actual deliverable content
  - `sent_at` (timestamptz) - When delivered to client
  - `metadata` (jsonb) - Additional data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### client_success_metrics
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key to clients)
  - `subscription_id` (uuid, foreign key to client_subscriptions)
  - `period_start` (date)
  - `period_end` (date)
  - `value_delivered` (jsonb) - Tracked value metrics
  - `cost_saved` (integer) - Estimated cost saved vs agency
  - `performance_improvements` (jsonb) - Key metrics improved
  - `health_score` (integer) - Overall client health 0-100
  - `churn_risk` (text) - low, medium, high
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - CMOs can manage packages for their clients
  - Admins can manage all packages globally
*/

-- =====================================================
-- SERVICE PACKAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  monthly_price integer NOT NULL DEFAULT 0,
  annual_price integer,
  features jsonb DEFAULT '[]'::jsonb,
  deliverables jsonb DEFAULT '[]'::jsonb,
  client_limit integer,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active packages
CREATE POLICY "Anyone can view active packages"
  ON public.service_packages
  FOR SELECT
  USING (is_active = true);

-- Admins can manage all packages
CREATE POLICY "Admins can manage packages"
  ON public.service_packages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_slug ON public.service_packages(slug);
CREATE INDEX IF NOT EXISTS idx_service_packages_active ON public.service_packages(is_active);

-- =====================================================
-- CLIENT SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.client_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  stripe_subscription_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;

-- CMOs can view subscriptions for their clients
CREATE POLICY "CMOs can view client subscriptions"
  ON public.client_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_subscriptions.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- CMOs can manage subscriptions for their clients
CREATE POLICY "CMOs can manage client subscriptions"
  ON public.client_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_subscriptions.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_subscriptions.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client ON public.client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_package ON public.client_subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_status ON public.client_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_period_end ON public.client_subscriptions(current_period_end);

-- =====================================================
-- AUTOMATED DELIVERABLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.automated_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE RESTRICT,
  deliverable_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  scheduled_for timestamptz NOT NULL,
  generated_at timestamptz,
  content jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automated_deliverables ENABLE ROW LEVEL SECURITY;

-- CMOs can view deliverables for their clients
CREATE POLICY "CMOs can view client deliverables"
  ON public.automated_deliverables
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = automated_deliverables.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- CMOs can manage deliverables for their clients
CREATE POLICY "CMOs can manage client deliverables"
  ON public.automated_deliverables
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = automated_deliverables.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = automated_deliverables.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_client ON public.automated_deliverables(client_id);
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_package ON public.automated_deliverables(package_id);
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_status ON public.automated_deliverables(status);
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_scheduled ON public.automated_deliverables(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_automated_deliverables_type ON public.automated_deliverables(deliverable_type);

-- =====================================================
-- CLIENT SUCCESS METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.client_success_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.client_subscriptions(id) ON DELETE SET NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  value_delivered jsonb DEFAULT '{}'::jsonb,
  cost_saved integer DEFAULT 0,
  performance_improvements jsonb DEFAULT '{}'::jsonb,
  health_score integer CHECK (health_score >= 0 AND health_score <= 100),
  churn_risk text CHECK (churn_risk IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_success_metrics ENABLE ROW LEVEL SECURITY;

-- CMOs can view success metrics for their clients
CREATE POLICY "CMOs can view client success metrics"
  ON public.client_success_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_success_metrics.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- CMOs can manage success metrics for their clients
CREATE POLICY "CMOs can manage client success metrics"
  ON public.client_success_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_success_metrics.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_success_metrics.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_client ON public.client_success_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_subscription ON public.client_success_metrics(subscription_id);
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_period ON public.client_success_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_health ON public.client_success_metrics(health_score);
CREATE INDEX IF NOT EXISTS idx_client_success_metrics_churn_risk ON public.client_success_metrics(churn_risk);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp on service_packages
CREATE TRIGGER update_service_packages_updated_at
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at timestamp on client_subscriptions
CREATE TRIGGER update_client_subscriptions_updated_at
  BEFORE UPDATE ON public.client_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at timestamp on automated_deliverables
CREATE TRIGGER update_automated_deliverables_updated_at
  BEFORE UPDATE ON public.automated_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at timestamp on client_success_metrics
CREATE TRIGGER update_client_success_metrics_updated_at
  BEFORE UPDATE ON public.client_success_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED DEFAULT PACKAGES
-- =====================================================

INSERT INTO public.service_packages (name, slug, description, monthly_price, annual_price, features, deliverables, client_limit, sort_order) VALUES
(
  'Marketing Command Center',
  'command-center',
  'Replace basic agency retainers with automated insights and strategic recommendations',
  250000,
  2400000,
  '["Weekly performance reports", "Monthly strategy recommendations", "Real-time dashboard access", "Competitive intelligence alerts", "Budget optimization suggestions", "Email & Slack support"]'::jsonb,
  '[{"type": "weekly_report", "name": "Weekly Performance Report", "cadence": "weekly"}, {"type": "monthly_strategy", "name": "Monthly Strategy Recommendations", "cadence": "monthly"}, {"type": "competitive_alerts", "name": "Competitive Intelligence Alerts", "cadence": "real-time"}]'::jsonb,
  50,
  1
),
(
  'Strategic Advisor',
  'strategic-advisor',
  'Mid-tier agency replacement with deeper analytics and quarterly business reviews',
  500000,
  4800000,
  '["Everything in Command Center", "Quarterly business reviews", "Campaign performance scorecards", "A/B test recommendations", "Customer segment analysis", "Priority support", "Monthly strategy calls"]'::jsonb,
  '[{"type": "weekly_report", "name": "Weekly Performance Report", "cadence": "weekly"}, {"type": "monthly_strategy", "name": "Monthly Strategy Document", "cadence": "monthly"}, {"type": "quarterly_review", "name": "Quarterly Business Review", "cadence": "quarterly"}, {"type": "campaign_scorecard", "name": "Campaign Performance Scorecards", "cadence": "bi-weekly"}]'::jsonb,
  30,
  2
),
(
  'Full-Stack CMO',
  'full-stack-cmo',
  'Complete CMO replacement with dedicated strategic oversight and custom reporting',
  1000000,
  9600000,
  '["Everything in Strategic Advisor", "Dedicated account manager", "Custom dashboard development", "Weekly strategy calls", "Unlimited email/phone support", "Campaign planning & execution support", "Industry benchmark reporting", "Executive presentation decks"]'::jsonb,
  '[{"type": "weekly_report", "name": "Weekly Executive Report", "cadence": "weekly"}, {"type": "monthly_strategy", "name": "Monthly Strategic Plan", "cadence": "monthly"}, {"type": "quarterly_review", "name": "Quarterly Board Presentation", "cadence": "quarterly"}, {"type": "campaign_plan", "name": "Campaign Planning Documents", "cadence": "as-needed"}, {"type": "weekly_call", "name": "Weekly Strategy Call", "cadence": "weekly"}]'::jsonb,
  15,
  3
);
