/*
  # Fix Function Search Paths
  
  1. Overview
    - Fixes functions with mutable search_path security issue
    - Sets explicit search_path to prevent SQL injection vulnerabilities
    
  2. Security Impact
    - Prevents search_path manipulation attacks
    - Ensures functions only access intended schemas
    - Follows PostgreSQL security best practices
    
  3. Functions Fixed
    - update_contacted_timestamp
    - update_updated_at_column
    - cleanup_old_rate_limits
    - cleanup_old_error_logs
    
  4. Implementation
    - Drops each function and recreates with SET search_path = public
    - Maintains original function logic and signatures
*/

-- =====================================================
-- FIX update_contacted_timestamp
-- =====================================================

DROP FUNCTION IF EXISTS public.update_contacted_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_contacted_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.contacted = true AND (OLD.contacted IS NULL OR OLD.contacted = false) THEN
    NEW.contacted_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger if it exists
DROP TRIGGER IF EXISTS update_contacted_timestamp_trigger ON public.marketing_audits;
CREATE TRIGGER update_contacted_timestamp_trigger
  BEFORE UPDATE ON public.marketing_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contacted_timestamp();

-- =====================================================
-- FIX update_updated_at_column
-- =====================================================

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for all tables that use this function
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_playbooks_updated_at ON public.playbooks;
CREATE TRIGGER update_playbooks_updated_at
  BEFORE UPDATE ON public.playbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FIX cleanup_old_rate_limits
-- =====================================================

DROP FUNCTION IF EXISTS public.cleanup_old_rate_limits();

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '1 hour'
    AND (blocked_until IS NULL OR blocked_until < now());
END;
$$;

-- =====================================================
-- FIX cleanup_old_error_logs
-- =====================================================

DROP FUNCTION IF EXISTS public.cleanup_old_error_logs();

CREATE OR REPLACE FUNCTION public.cleanup_old_error_logs()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.error_logs
  WHERE created_at < now() - interval '90 days';
END;
$$;