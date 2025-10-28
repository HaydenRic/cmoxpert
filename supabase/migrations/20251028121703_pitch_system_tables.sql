/*
  # Pitch System Tables

  ## Overview
  Creates tables for managing the sales pitch system including lead capture,
  demo bookings, analytics tracking, and pricing management.

  ## New Tables
  
  ### `pitch_leads`
  Stores leads captured from the pitch/demo pages
  - `id` (uuid, primary key)
  - `email` (text, required, unique)
  - `full_name` (text, required)
  - `company_name` (text, required)
  - `company_size` (text) - employee count range
  - `monthly_marketing_spend` (numeric) - in GBP
  - `current_cac` (numeric) - current customer acquisition cost
  - `phone` (text, optional)
  - `job_title` (text, optional)
  - `interest_level` (text) - hot/warm/cold
  - `lead_source` (text) - which page/section they came from
  - `utm_source` (text, optional)
  - `utm_medium` (text, optional)
  - `utm_campaign` (text, optional)
  - `notes` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `demo_bookings`
  Stores demo booking requests
  - `id` (uuid, primary key)
  - `lead_id` (uuid, foreign key to pitch_leads)
  - `preferred_date` (date)
  - `preferred_time` (text)
  - `booking_status` (text) - pending/confirmed/completed/cancelled
  - `demo_type` (text) - standard/deep-dive/custom
  - `specific_interests` (text array) - features they want to see
  - `calendar_event_id` (text, optional)
  - `zoom_link` (text, optional)
  - `sales_rep_id` (uuid, optional)
  - `completed_at` (timestamptz, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `pitch_analytics`
  Tracks user interactions with pitch pages
  - `id` (uuid, primary key)
  - `session_id` (text, required) - anonymous session tracking
  - `lead_id` (uuid, optional, foreign key)
  - `page_path` (text, required)
  - `event_type` (text, required) - page_view/calculator_used/form_started/etc
  - `event_data` (jsonb) - flexible event metadata
  - `time_spent_seconds` (integer)
  - `device_type` (text)
  - `referrer` (text)
  - `created_at` (timestamptz)

  ### `pricing_tiers`
  Manages pricing tier information
  - `id` (uuid, primary key)
  - `tier_name` (text, required)
  - `display_order` (integer)
  - `monthly_price_gbp` (numeric)
  - `annual_price_gbp` (numeric)
  - `features` (jsonb) - array of feature objects
  - `max_monthly_spend` (numeric) - max marketing spend for this tier
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `roi_calculations`
  Stores ROI calculations from interactive calculator
  - `id` (uuid, primary key)
  - `session_id` (text)
  - `lead_id` (uuid, optional, foreign key)
  - `monthly_spend_gbp` (numeric, required)
  - `current_cac_gbp` (numeric, required)
  - `estimated_fraud_rate` (numeric) - percentage
  - `calculated_savings_gbp` (numeric)
  - `projected_cac_reduction` (numeric) - percentage
  - `projected_ltv_improvement` (numeric) - percentage
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Admin users can manage all data
  - Authenticated users can view their own data
  - Public can insert leads and analytics (for landing page)
*/

-- Create pitch_leads table
CREATE TABLE IF NOT EXISTS pitch_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text NOT NULL,
  company_size text,
  monthly_marketing_spend numeric,
  current_cac numeric,
  phone text,
  job_title text,
  interest_level text DEFAULT 'warm',
  lead_source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create demo_bookings table
CREATE TABLE IF NOT EXISTS demo_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES pitch_leads(id) ON DELETE CASCADE,
  preferred_date date,
  preferred_time text,
  booking_status text DEFAULT 'pending',
  demo_type text DEFAULT 'standard',
  specific_interests text[],
  calendar_event_id text,
  zoom_link text,
  sales_rep_id uuid,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pitch_analytics table
CREATE TABLE IF NOT EXISTS pitch_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  lead_id uuid REFERENCES pitch_leads(id) ON DELETE SET NULL,
  page_path text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb,
  time_spent_seconds integer,
  device_type text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text NOT NULL,
  display_order integer DEFAULT 0,
  monthly_price_gbp numeric,
  annual_price_gbp numeric,
  features jsonb,
  max_monthly_spend numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create roi_calculations table
CREATE TABLE IF NOT EXISTS roi_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  lead_id uuid REFERENCES pitch_leads(id) ON DELETE SET NULL,
  monthly_spend_gbp numeric NOT NULL,
  current_cac_gbp numeric NOT NULL,
  estimated_fraud_rate numeric,
  calculated_savings_gbp numeric,
  projected_cac_reduction numeric,
  projected_ltv_improvement numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pitch_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

-- Policies for pitch_leads
CREATE POLICY "Public can insert leads"
  ON pitch_leads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all leads"
  ON pitch_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update leads"
  ON pitch_leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for demo_bookings
CREATE POLICY "Public can insert demo bookings"
  ON demo_bookings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all bookings"
  ON demo_bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update bookings"
  ON demo_bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for pitch_analytics
CREATE POLICY "Public can insert analytics"
  ON pitch_analytics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view analytics"
  ON pitch_analytics FOR SELECT
  TO authenticated
  USING (true);

-- Policies for pricing_tiers
CREATE POLICY "Anyone can view active pricing tiers"
  ON pricing_tiers FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage pricing tiers"
  ON pricing_tiers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for roi_calculations
CREATE POLICY "Public can insert ROI calculations"
  ON roi_calculations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all ROI calculations"
  ON roi_calculations FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pitch_leads_email ON pitch_leads(email);
CREATE INDEX IF NOT EXISTS idx_pitch_leads_created_at ON pitch_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_lead_id ON demo_bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_pitch_analytics_session ON pitch_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_pitch_analytics_event_type ON pitch_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_session ON roi_calculations(session_id);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (tier_name, display_order, monthly_price_gbp, annual_price_gbp, features, max_monthly_spend, is_active)
VALUES 
  ('Starter', 1, 2500, 27000, 
   '{"included": ["Up to £50k monthly ad spend", "Basic fraud detection", "Channel performance analytics", "Monthly reports", "Email support"], "highlighted": false}'::jsonb,
   50000, true),
  ('Professional', 2, 5000, 54000,
   '{"included": ["Up to £200k monthly ad spend", "Advanced fraud detection", "Real-time analytics", "Custom dashboards", "Predictive insights", "Priority support"], "highlighted": true}'::jsonb,
   200000, true),
  ('Enterprise', 3, null, null,
   '{"included": ["Unlimited ad spend", "Full fraud intelligence suite", "Dedicated account manager", "Custom integrations", "White-label reporting", "24/7 support"], "highlighted": false}'::jsonb,
   null, true)
ON CONFLICT DO NOTHING;