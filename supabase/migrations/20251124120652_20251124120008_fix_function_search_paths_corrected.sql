/*
  # Fix Function Search Paths - Corrected
  
  Sets immutable search_path for security functions
*/

-- Fix update_client_notes_count
CREATE OR REPLACE FUNCTION public.update_client_notes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clients
    SET notes_count = COALESCE(notes_count, 0) + 1
    WHERE id = NEW.client_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clients
    SET notes_count = GREATEST(COALESCE(notes_count, 0) - 1, 0)
    WHERE id = OLD.client_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_beta_waitlist_updated_at
CREATE OR REPLACE FUNCTION public.update_beta_waitlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix get_pending_sync_mappings - drop and recreate
DROP FUNCTION IF EXISTS public.get_pending_sync_mappings(uuid);

CREATE OR REPLACE FUNCTION public.get_pending_sync_mappings(p_integration_id uuid)
RETURNS TABLE (
  mapping_id uuid,
  source_type text,
  source_id text,
  destination_type text,
  last_synced_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    im.id as mapping_id,
    im.source_type,
    im.source_id,
    im.destination_type,
    im.last_synced_at
  FROM integration_field_mappings im
  WHERE im.integration_id = p_integration_id
    AND (im.last_synced_at IS NULL OR im.last_synced_at < now() - interval '1 hour')
  ORDER BY im.last_synced_at NULLS FIRST
  LIMIT 100;
END;
$$;