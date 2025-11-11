/*
  # Marketing Audit System for Lead Generation

  ## Overview
  Creates infrastructure for free marketing audits that generate qualified leads.
  This is the top-of-funnel lead magnet before prospects see pricing.

  ## New Tables

  ### marketing_audits
  - `id` (uuid, primary key)
  - `email` (text, not null) - Lead's email for follow-up
  - `company_name` (text) - Company name
  - `website` (text) - Website URL for analysis
  - `monthly_ad_spend` (integer) - Current monthly spend in cents
  - `primary_channels` (jsonb) - Array of channels they use
  - `biggest_challenge` (text) - Self-reported main challenge
  - `audit_results` (jsonb) - Generated audit findings
  - `score` (integer) - Overall health score 0-100
  - `status` (text) - new, contacted, converted, lost
  - `referral_source` (text) - How they found us
  - `ip_address` (text) - For fraud detection
  - `user_agent` (text) - Browser info
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### audit_follow_ups
  - `id` (uuid, primary key)
  - `audit_id` (uuid, foreign key to marketing_audits)
  - `follow_up_type` (text) - email, call, demo
  - `scheduled_for` (timestamptz)
  - `completed_at` (timestamptz)
  - `notes` (text)
  - `outcome` (text) - responded, no_response, converted
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Public can submit audits (no auth required)
  - Only authenticated admins can view audit results
  - Rate limiting via IP address tracking
*/

-- =====================================================
-- MARKETING AUDITS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.marketing_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_name text,
  website text,
  monthly_ad_spend integer,
  primary_channels jsonb DEFAULT '[]'::jsonb,
  biggest_challenge text,
  audit_results jsonb DEFAULT '{}'::jsonb,
  score integer CHECK (score >= 0 AND score <= 100),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  referral_source text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_audits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can submit audits"
  ON public.marketing_audits
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can submit audits"
  ON public.marketing_audits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can view audits
CREATE POLICY "Admins can view all audits"
  ON public.marketing_audits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update audits
CREATE POLICY "Admins can update audits"
  ON public.marketing_audits
  FOR UPDATE
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
CREATE INDEX IF NOT EXISTS idx_marketing_audits_email ON public.marketing_audits(email);
CREATE INDEX IF NOT EXISTS idx_marketing_audits_status ON public.marketing_audits(status);
CREATE INDEX IF NOT EXISTS idx_marketing_audits_created ON public.marketing_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_audits_score ON public.marketing_audits(score);
CREATE INDEX IF NOT EXISTS idx_marketing_audits_ip ON public.marketing_audits(ip_address);

-- =====================================================
-- AUDIT FOLLOW UPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES public.marketing_audits(id) ON DELETE CASCADE,
  follow_up_type text NOT NULL CHECK (follow_up_type IN ('email', 'call', 'demo', 'other')),
  scheduled_for timestamptz NOT NULL,
  completed_at timestamptz,
  notes text,
  outcome text CHECK (outcome IN ('responded', 'no_response', 'converted', 'not_interested')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_follow_ups ENABLE ROW LEVEL SECURITY;

-- Only admins can manage follow-ups
CREATE POLICY "Admins can manage follow-ups"
  ON public.audit_follow_ups
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
CREATE INDEX IF NOT EXISTS idx_audit_follow_ups_audit ON public.audit_follow_ups(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_follow_ups_scheduled ON public.audit_follow_ups(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_audit_follow_ups_outcome ON public.audit_follow_ups(outcome);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp on marketing_audits
CREATE TRIGGER update_marketing_audits_updated_at
  BEFORE UPDATE ON public.marketing_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at timestamp on audit_follow_ups
CREATE TRIGGER update_audit_follow_ups_updated_at
  BEFORE UPDATE ON public.audit_follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- HELPER FUNCTION - Rate Limiting
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_audit_rate_limit(p_ip_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Check how many audits from this IP in last hour
  SELECT COUNT(*)
  INTO recent_count
  FROM public.marketing_audits
  WHERE ip_address = p_ip_address
  AND created_at > now() - interval '1 hour';

  -- Allow max 3 audits per hour per IP
  RETURN recent_count < 3;
END;
$$;
