/*
  # Fix Security Issues - Part 3: Function Search Paths (with CASCADE)

  ## Overview
  Fix search_path for all functions flagged as mutable for security
  Drop with CASCADE to handle dependent triggers, then recreate everything

  ## Changes
  Drop and recreate functions with SET search_path = public, pg_temp
  Recreate any dependent triggers
*/

-- Drop existing functions with CASCADE to handle triggers
DROP FUNCTION IF EXISTS public.get_pending_sync_mappings() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_fintech_metrics_daily() CASCADE;
DROP FUNCTION IF EXISTS public.process_payment_event() CASCADE;
DROP FUNCTION IF EXISTS public.sync_provider_event_to_user_event() CASCADE;
DROP FUNCTION IF EXISTS public.delete_expired_oauth_states() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_marketing_metrics() CASCADE;
DROP FUNCTION IF EXISTS public.get_unread_alert_count(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.archive_old_alerts() CASCADE;
DROP FUNCTION IF EXISTS public.snapshot_competitor_metrics() CASCADE;

-- Recreate get_pending_sync_mappings
CREATE FUNCTION public.get_pending_sync_mappings()
RETURNS TABLE (
  mapping_id uuid,
  integration_id uuid,
  local_id text,
  remote_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.id as mapping_id,
    im.integration_id,
    im.local_id,
    im.remote_id
  FROM integration_mappings im
  WHERE im.sync_status = 'pending'
    AND im.last_sync_attempt < NOW() - INTERVAL '5 minutes';
END;
$$;

-- Recreate calculate_fintech_metrics_daily
CREATE FUNCTION public.calculate_fintech_metrics_daily()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN;
END;
$$;

-- Recreate process_payment_event
CREATE FUNCTION public.process_payment_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- Recreate sync_provider_event_to_user_event
CREATE FUNCTION public.sync_provider_event_to_user_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO user_events (
    client_id,
    user_id,
    event_type,
    event_data,
    timestamp,
    channel_source
  ) VALUES (
    NEW.client_id,
    NEW.user_id,
    NEW.event_type,
    NEW.event_data,
    NEW.timestamp,
    'provider_sync'
  );
  RETURN NEW;
END;
$$;

-- Recreate delete_expired_oauth_states
CREATE FUNCTION public.delete_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM oauth_states
  WHERE expires_at < NOW();
END;
$$;

-- Recreate calculate_marketing_metrics
CREATE FUNCTION public.calculate_marketing_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN;
END;
$$;

-- Recreate get_unread_alert_count
CREATE FUNCTION public.get_unread_alert_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  alert_count integer;
BEGIN
  SELECT COUNT(*)
  INTO alert_count
  FROM competitor_alerts
  WHERE user_id = p_user_id
    AND is_read = false;
  
  RETURN COALESCE(alert_count, 0);
END;
$$;

-- Recreate archive_old_alerts
CREATE FUNCTION public.archive_old_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE competitor_alerts
  SET is_read = true
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND is_read = false;
END;
$$;

-- Recreate snapshot_competitor_metrics
CREATE FUNCTION public.snapshot_competitor_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN;
END;
$$;

-- Recreate triggers that were dropped
DO $$
BEGIN
  -- Recreate KYC event to user event trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kyc_provider_events') THEN
    CREATE TRIGGER kyc_event_to_user_event
      AFTER INSERT ON public.kyc_provider_events
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_provider_event_to_user_event();
  END IF;

  -- Recreate payment event trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_processor_events') THEN
    CREATE TRIGGER payment_event_to_user_event
      AFTER INSERT ON public.payment_processor_events
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_provider_event_to_user_event();
  END IF;

  -- Recreate bank event trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_connection_events') THEN
    CREATE TRIGGER bank_event_to_user_event
      AFTER INSERT ON public.bank_connection_events
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_provider_event_to_user_event();
  END IF;

  -- Recreate fraud signal trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fraud_provider_signals') THEN
    CREATE TRIGGER fraud_signal_to_user_event
      AFTER INSERT ON public.fraud_provider_signals
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_provider_event_to_user_event();
  END IF;
END $$;