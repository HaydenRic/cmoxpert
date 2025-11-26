/*
  # Drop Unused Indexes - Part 2: FinTech Integration Tables
  
  Removes indexes from FinTech-specific tables that are not being actively used.
  These tables support features that may be added in the future, but indexes
  are not needed until the features are implemented.
  
  Tables affected:
  - bank_connection_events
  - payment_processor_events
  - kyc_provider_events
  - fintech_integration_configs
  - fintech_metrics_daily
  - verification_attempts
  
  Security Impact: Reduces database overhead without affecting functionality
*/

-- Drop indexes from bank_connection_events
DROP INDEX IF EXISTS idx_bank_connection_events_client_id;
DROP INDEX IF EXISTS idx_bank_connection_events_integration_id;

-- Drop indexes from payment_processor_events
DROP INDEX IF EXISTS idx_payment_processor_events_client_id;
DROP INDEX IF EXISTS idx_payment_processor_events_integration_id;

-- Drop indexes from kyc_provider_events
DROP INDEX IF EXISTS idx_kyc_provider_events_client_id;
DROP INDEX IF EXISTS idx_kyc_provider_events_integration_id;

-- Drop indexes from fintech_integration_configs
DROP INDEX IF EXISTS idx_fintech_integration_configs_user_id;

-- Drop indexes from fintech_metrics_daily
DROP INDEX IF EXISTS idx_fintech_metrics_daily_campaign_id;
DROP INDEX IF EXISTS idx_fintech_metrics_daily_user_id;

-- Drop indexes from verification_attempts
DROP INDEX IF EXISTS idx_verification_attempts_client_id;
DROP INDEX IF EXISTS idx_verification_attempts_user_id;