# Data workflows

The server's get_tool_guide (also dreambase://guide/tool-usage) owns the detailed source shapes, limits, pagination and recovery contract. Read it rather than copying a recipe from another deployment.

Discover actual schemas and per-connection capabilities before execution. Use preview_source for a non-persisting bounded sample, then an authorized save_dataset and targeted query_dataset verification when persistence is wanted. If preview refuses an operation, explain the safety/capability requirement; never bypass that refusal through saving.

Confirm grain, join keys, time boundaries, currency/status definitions, missing periods and pagination. A source aggregate can establish a total; a sample cannot. Exact cross-dataset joins require a source definition that performs that join. List and select existing datasets and metrics before creating duplicates.

Scanned GET APIs and explicitly read-only scanned/live MCP tools are the supported remote preview operations. API/MCP preview reads one response; pagination is not walked. SQL is database-read-only. A provider's declared read-only behavior remains its contract, not a proof about arbitrary remote code.

Dataset source fields use connection_id; public workspace and dataset handles use workspaceId/datasetId. Follow the advertised schema rather than inventing casing aliases. New cursors belong to their operation, workspace and filters; restart the same list on an invalid/stale cursor.
