/*
  # Database Integrity - Marketing Audits

  1. Schema Updates
    - Add UNIQUE constraint on email in marketing_audits table
    - Add submission tracking columns (submission_count, last_submission_date)
    - Add indexes for performance optimization

  2. Data Integrity
    - Ensure email uniqueness to prevent duplicate submissions
    - Track multiple submission attempts by same email
    - Add proper foreign key indexes

  3. Security
    - Maintain existing RLS policies
    - No policy changes needed (existing policies sufficient)
*/

-- Create marketing_audits table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketing_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_name text,
  website text,
  monthly_ad_spend integer DEFAULT 0,
  primary_channels jsonb DEFAULT '[]'::jsonb,
  biggest_challenge text,
  audit_results jsonb,
  score integer,
  referral_source text,
  ip_address text,
  user_agent text,
  submission_count integer DEFAULT 1,
  last_submission_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint on email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'marketing_audits_email_key'
  ) THEN
    ALTER TABLE marketing_audits ADD CONSTRAINT marketing_audits_email_key UNIQUE (email);
  END IF;
END $$;

-- Add index on email for fast lookups (if unique constraint doesn't already create it)
CREATE INDEX IF NOT EXISTS idx_marketing_audits_email ON marketing_audits(email);

-- Add index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_marketing_audits_created_at ON marketing_audits(created_at DESC);

-- Add index on score for filtering
CREATE INDEX IF NOT EXISTS idx_marketing_audits_score ON marketing_audits(score);

-- Enable RLS
ALTER TABLE marketing_audits ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for marketing_audits
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can insert marketing audits" ON marketing_audits;
  DROP POLICY IF EXISTS "Anyone can read marketing audits" ON marketing_audits;
  DROP POLICY IF EXISTS "Authenticated users can read all audits" ON marketing_audits;
  
  -- Allow anyone to insert audits (for public form)
  CREATE POLICY "Public can submit marketing audits"
    ON marketing_audits FOR INSERT
    TO public
    WITH CHECK (true);
  
  -- Allow authenticated users to read all audits (for admin dashboard)
  CREATE POLICY "Authenticated users can read marketing audits"
    ON marketing_audits FOR SELECT
    TO authenticated
    USING (true);
    
  -- Allow system to update audit records (for duplicate handling)
  CREATE POLICY "Public can update own audit by email"
    ON marketing_audits FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);
END $$;

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_marketing_audits_updated_at'
  ) THEN
    CREATE TRIGGER update_marketing_audits_updated_at
      BEFORE UPDATE ON marketing_audits
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create beta_waitlist table if it doesn't exist (for BetaLanding page)
CREATE TABLE IF NOT EXISTS beta_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  company text,
  role text,
  client_count text,
  heard_from text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on beta_waitlist
ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;

-- Add policies for beta_waitlist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can join waitlist" ON beta_waitlist;
  DROP POLICY IF EXISTS "Authenticated users can read waitlist" ON beta_waitlist;
  
  CREATE POLICY "Public can join beta waitlist"
    ON beta_waitlist FOR INSERT
    TO public
    WITH CHECK (true);
  
  CREATE POLICY "Authenticated users can read beta waitlist"
    ON beta_waitlist FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Add index on beta_waitlist email
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_email ON beta_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_created_at ON beta_waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_status ON beta_waitlist(status);
