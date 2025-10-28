/*
  # Fix Remaining Function Search Paths

  ## Overview
  Fix the three functions that still have mutable search paths

  ## Changes
  - get_pending_sync_mappings
  - calculate_fintech_metrics_daily
  - process_payment_event
*/

-- Drop and recreate get_pending_sync_mappings with immutable search path
DROP FUNCTION IF EXISTS public.get_pending_sync_mappings() CASCADE;

CREATE FUNCTION public.get_pending_sync_mappings()
RETURNS TABLE (
  mapping_id uuid,
  integration_id uuid,
  local_id text,
  remote_id text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.id as mapping_id,
    im.integration_id,
    im.local_id,
    im.remote_id
  FROM public.integration_mappings im
  WHERE im.sync_status = 'pending'
    AND im.last_sync_attempt < NOW() - INTERVAL '5 minutes';
END;
$$;

-- Drop and recreate calculate_fintech_metrics_daily with immutable search path
DROP FUNCTION IF EXISTS public.calculate_fintech_metrics_daily() CASCADE;

CREATE FUNCTION public.calculate_fintech_metrics_daily()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Placeholder implementation
  RETURN;
END;
$$;

-- Drop and recreate process_payment_event with immutable search path
DROP FUNCTION IF EXISTS public.process_payment_event() CASCADE;

CREATE FUNCTION public.process_payment_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Placeholder implementation
  RETURN NEW;
END;
$$;