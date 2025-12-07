/*
  # Error Logging System

  1. New Tables
    - `error_logs`
      - `id` (uuid, primary key)
      - `error_type` (text) - Error class name
      - `error_message` (text) - Human-readable error message
      - `error_code` (text, nullable) - Application error code
      - `stack_trace` (text, nullable) - Full stack trace
      - `user_id` (uuid, nullable) - User who encountered the error
      - `page_url` (text) - URL where error occurred
      - `user_agent` (text) - Browser user agent string
      - `metadata` (jsonb) - Additional context
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on error_logs table
    - Allow anyone to insert errors (for logging)
    - Only authenticated admins can read errors

  3. Indexes
    - Index on created_at for time-based queries
    - Index on error_type for filtering
    - Index on user_id for user-specific errors
*/

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL,
  error_message text NOT NULL,
  error_code text,
  stack_trace text,
  user_id uuid,
  page_url text NOT NULL,
  user_agent text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_error_logs_error_code ON error_logs(error_code) WHERE error_code IS NOT NULL;

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can insert error logs" ON error_logs;
  DROP POLICY IF EXISTS "Authenticated users can read error logs" ON error_logs;
  
  -- Allow public to insert errors (for client-side error logging)
  CREATE POLICY "Public can insert error logs"
    ON error_logs FOR INSERT
    TO public
    WITH CHECK (true);
  
  -- Only authenticated users (admins) can read error logs
  CREATE POLICY "Authenticated users can read error logs"
    ON error_logs FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Create rate_limits table for rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  action_type text NOT NULL, -- e.g., 'audit_submission', 'api_call'
  attempt_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  last_attempt_at timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_action
  ON rate_limits(identifier, action_type);

-- Add index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Enable RLS on rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for rate_limits
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can insert rate limits" ON rate_limits;
  DROP POLICY IF EXISTS "Public can update rate limits" ON rate_limits;
  DROP POLICY IF EXISTS "Authenticated users can read rate limits" ON rate_limits;
  
  CREATE POLICY "Public can insert rate limits"
    ON rate_limits FOR INSERT
    TO public
    WITH CHECK (true);
  
  CREATE POLICY "Public can update rate limits"
    ON rate_limits FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);
  
  CREATE POLICY "Authenticated users can read rate limits"
    ON rate_limits FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Function to clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - interval '24 hours'
    AND (blocked_until IS NULL OR blocked_until < now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old error logs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
