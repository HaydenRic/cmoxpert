/*
  # Fix All Versions of get_pending_sync_mappings
  
  There are 3 overloaded versions of this function.
  Setting immutable search_path for all of them.
*/

-- Version 1: No arguments
DROP FUNCTION IF EXISTS public.get_pending_sync_mappings();

CREATE OR REPLACE FUNCTION public.get_pending_sync_mappings()
RETURNS TABLE (
  mapping_id uuid,
  integration_id uuid,
  source_field text,
  target_field text
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
    im.source_field,
    im.target_field
  FROM integration_field_mappings im
  WHERE im.is_active = true
    AND im.integration_id IN (
      SELECT id FROM integrations WHERE status = 'active'
    );
END;
$$;

-- Version 2: One UUID argument (already fixed earlier, but ensuring it's correct)
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

-- Version 3: UUID and integer arguments
DROP FUNCTION IF EXISTS public.get_pending_sync_mappings(uuid, integer);

CREATE OR REPLACE FUNCTION public.get_pending_sync_mappings(integration_uuid uuid, max_age_minutes integer)
RETURNS TABLE (
  id uuid,
  local_entity_type text,
  local_entity_id text,
  remote_entity_type text,
  remote_entity_id text,
  last_synced_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.id,
    im.local_entity_type,
    im.local_entity_id,
    im.remote_entity_type,
    im.remote_entity_id,
    im.last_synced_at
  FROM integration_mappings im
  WHERE im.integration_id = integration_uuid
    AND im.sync_status IN ('pending', 'error')
    AND (
      im.last_synced_at IS NULL 
      OR im.last_synced_at < now() - (max_age_minutes || ' minutes')::interval
    )
  ORDER BY im.last_synced_at ASC NULLS FIRST
  LIMIT 100;
END;
$$;