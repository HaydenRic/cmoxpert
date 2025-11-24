/*
  # Remove Unused Indexes - Part 1
  
  Removes 50 unused indexes to improve write performance and reduce storage
*/

-- Profiles & Auth
DROP INDEX IF EXISTS public.profiles_email_idx;
DROP INDEX IF EXISTS public.profiles_role_idx;
DROP INDEX IF EXISTS public.profiles_created_at_idx;
DROP INDEX IF EXISTS public.idx_oauth_states_user_id;
DROP INDEX IF EXISTS public.idx_oauth_states_client_id;

-- Client Management
DROP INDEX IF EXISTS public.idx_clients_health_status;
DROP INDEX IF EXISTS public.idx_clients_onboarding_status;
DROP INDEX IF EXISTS public.idx_clients_next_meeting;
DROP INDEX IF EXISTS public.idx_clients_contract_end;
DROP INDEX IF EXISTS public.idx_clients_churned;
DROP INDEX IF EXISTS public.idx_contracts_client;
DROP INDEX IF EXISTS public.idx_contracts_end_date;
DROP INDEX IF EXISTS public.idx_contracts_payment_status;
DROP INDEX IF EXISTS public.idx_health_scores_client;
DROP INDEX IF EXISTS public.idx_health_scores_calculated;
DROP INDEX IF EXISTS public.idx_health_scores_overall;
DROP INDEX IF EXISTS public.idx_meetings_client;
DROP INDEX IF EXISTS public.idx_meetings_scheduled;
DROP INDEX IF EXISTS public.idx_meetings_status;
DROP INDEX IF EXISTS public.idx_notes_client;
DROP INDEX IF EXISTS public.idx_notes_category;
DROP INDEX IF EXISTS public.idx_notes_pinned;
DROP INDEX IF EXISTS public.idx_notes_created;
DROP INDEX IF EXISTS public.idx_documents_client;
DROP INDEX IF EXISTS public.idx_documents_category;
DROP INDEX IF EXISTS public.idx_documents_uploaded;
DROP INDEX IF EXISTS public.idx_kpi_targets_client;
DROP INDEX IF EXISTS public.idx_kpi_targets_status;
DROP INDEX IF EXISTS public.idx_kpi_targets_date;

-- Business & Packages
DROP INDEX IF EXISTS public.idx_business_metrics_user;
DROP INDEX IF EXISTS public.idx_business_metrics_date;
DROP INDEX IF EXISTS public.idx_service_packages_slug;
DROP INDEX IF EXISTS public.idx_service_packages_active;
DROP INDEX IF EXISTS public.idx_client_subscriptions_client;
DROP INDEX IF EXISTS public.idx_client_subscriptions_package;
DROP INDEX IF EXISTS public.idx_client_subscriptions_status;
DROP INDEX IF EXISTS public.idx_client_subscriptions_period_end;
DROP INDEX IF EXISTS public.idx_automated_deliverables_client;
DROP INDEX IF EXISTS public.idx_automated_deliverables_package;
DROP INDEX IF EXISTS public.idx_automated_deliverables_status;
DROP INDEX IF EXISTS public.idx_automated_deliverables_scheduled;
DROP INDEX IF EXISTS public.idx_automated_deliverables_type;
DROP INDEX IF EXISTS public.idx_playbooks_user_id;
DROP INDEX IF EXISTS public.idx_playbooks_source_client_id;
DROP INDEX IF EXISTS public.idx_client_success_metrics_client;
DROP INDEX IF EXISTS public.idx_client_success_metrics_subscription;
DROP INDEX IF EXISTS public.idx_client_success_metrics_period;
DROP INDEX IF EXISTS public.idx_client_success_metrics_health;
DROP INDEX IF EXISTS public.idx_client_success_metrics_churn_risk;