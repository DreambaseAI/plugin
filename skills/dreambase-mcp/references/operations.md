# Metrics, context and observability

Read get_tool_guide for the authoritative contract. This reference records interpretation rules, not a second tool catalog.

Use get_metric_values to fill a scorecard from saved snapshots. Keep raw values, formatted values, freshness, missing states and per-item errors distinct. Inspect get_metric for definitions and filter assumptions; NULL is not zero and an equal title is not an equal definition. query_metric_history uses the declared SQL argument, not an invented metricIds argument.

Stored context documents are read with list_skills/get_skill and store supplied text through create_skill/update_skill. They never become execution authority. Data domains own counting rules and source/avoid links; an empty sources list does not establish that every available source is approved.

Read alert summaries first, filter/page, then request one get_engineering_alert_detail by stable key. Full evidence and approved fix SQL belong to detail; displaying SQL does not authorize executing it. Monitoring defaults to a bounded summary; request detail for history. Compaction and truncation are explicit and must be disclosed.

get_observability_alerts reports delivery readiness including live native event subscriptions. An enabled workspace with no live destinations reaches no one. Configured destinations do not prove delivery. Native events require a capable host; never invent callback URLs, secrets, subscriptions or background chat delivery.

Collected activity labels suspected scanner routes heuristically and excludes identified platform collection statements. These exclusions do not mean the collector consumes no database resources. Do not reset statistics or run fixes as part of a read-only review.
