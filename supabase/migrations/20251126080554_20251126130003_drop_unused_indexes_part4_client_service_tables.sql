/*
  # Drop Unused Indexes - Part 4: Client & Service Tables
  
  Removes indexes from client service and subscription tables that are not
  being actively queried. Primary keys and essential foreign keys remain.
  
  Tables affected:
  - client_contracts
  - client_documents
  - client_health_scores
  - client_kpi_targets
  - client_meetings
  - client_notes
  - client_subscriptions
  - client_success_metrics
  - automated_deliverables
  - audit_follow_ups
  
  Security Impact: Reduces database overhead while maintaining core functionality
  
  Note: We keep the primary client relationship indexes but remove
  secondary indexes that are not being used in queries.
*/

-- Drop indexes from client_contracts
DROP INDEX IF EXISTS idx_client_contracts_client_id;

-- Drop indexes from client_documents
DROP INDEX IF EXISTS idx_client_documents_client_id;

-- Drop indexes from client_health_scores
DROP INDEX IF EXISTS idx_client_health_scores_client_id;

-- Drop indexes from client_kpi_targets
DROP INDEX IF EXISTS idx_client_kpi_targets_client_id;

-- Drop indexes from client_meetings
DROP INDEX IF EXISTS idx_client_meetings_client_id;

-- Drop indexes from client_notes
DROP INDEX IF EXISTS idx_client_notes_client_id;

-- Drop indexes from client_subscriptions
DROP INDEX IF EXISTS idx_client_subscriptions_client_id;
DROP INDEX IF EXISTS idx_client_subscriptions_package_id;

-- Drop indexes from client_success_metrics
DROP INDEX IF EXISTS idx_client_success_metrics_client_id;
DROP INDEX IF EXISTS idx_client_success_metrics_subscription_id;

-- Drop indexes from automated_deliverables
DROP INDEX IF EXISTS idx_automated_deliverables_client_id;
DROP INDEX IF EXISTS idx_automated_deliverables_package_id;

-- Drop indexes from audit_follow_ups
DROP INDEX IF EXISTS idx_audit_follow_ups_audit_id;