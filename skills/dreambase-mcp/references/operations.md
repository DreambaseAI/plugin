# Metrics context and observability

## Metrics

Inspect list_metrics and get_metric before creating a duplicate. Test datasetQuery with query_dataset: it must return exactly one row and one column aliased value. create_metric needs a durable dataset. A metric is a saved definition, independently of any UI collection.

update_metric changes supplied fields only. Changing datasetId or datasetQuery resets history; explain that before redefining. query_metric_history reads daily values, using each metricId as its quoted table name, with day, bucket_at and value. Use at most 20 metrics and the supported history window. Before delete_metric, name its affected UI collections and wait for a separate yes.

## Context and data domains

create_skill stores name and technicalContext exactly as supplied, with optional metadata. update_skill is a partial document update; null clears nullable fields. No generation request, source execution or internal agent is involved.

create_data_domain stores caller-authored rules, notes and links. update_data_domain preserves omitted fields and links, replaces a supplied rules object, and removes only links explicitly named in remove_items. Source links marked avoid are constraints. Writes require owner/admin access (or an agent pinned to the workspace) and the granular data-domains:write scope; account does not implicitly include this new permission.

## Observability and alerts

Read get_engineering_alerts and get_supabase_monitoring for completed-check findings. get_supabase_metrics and get_supabase_activity read collected metrics/logs; get_supabase_health_history reads historical checks and decisions. Report collection windows and missing access accurately. Bill figures are estimates, not invoices. Minute collection is system-managed; external agents cannot enable or disable it.

Alert decisions use set_engineering_alert_state or set_engineering_alert_states. validate_engineering_alert reads the project and can update the stored decision; distinguish verified fixes, pending confirmation and unsupported checks.

For authorized notifications, inspect get_observability_alerts before update_observability_alerts or adding/removing a delivery channel. Native MCP Events are protocol methods when the host supports them: discover observability.alert, let the host provide its callback/signing secret, and verify the stored live subscription. Otherwise use supported email, Slack or webhook channels. Installation alone does not authorize notification configuration.

## Recovery

Writes may execute a source or persist a record before a timeout. Never blind-retry: inspect the corresponding list/get state first. A name match alone is not proof of identity. Saving to the same datasetId does not make an external action idempotent. Explain unresolved ambiguity.

On NOT_FOUND, check workspace and IDs. On FORBIDDEN, relay the required scope, role, plan or availability. On an unscanned source, direct an admin to the app rather than retrying. Correct a deterministic validation error only when re-execution is safe. Reauthorize on UNAUTHENTICATED. For promotion conflicts, re-read and re-verify the snapshot before seeking consent again.
