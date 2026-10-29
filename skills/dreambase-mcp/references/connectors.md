# Source authorization

list_connections lists configured source instances; list_connectors lists providers and whether an agent-issued authorization link is available. A provider without connectLinkAvailable must be connected in the Dreambase app.

For an authorized setup request, call request_connector_connection, present its URL, and let the user authorize in the browser. Poll get_connection_request every 5–10 seconds for a few minutes, keeping the user informed. Continue only when status is completed AND connectorConnected is true. On already_connected, inspect the connection. On expired or completed-but-disconnected, offer a fresh request under continuing authorization.

get_connection reads a stored catalog; it does not scan or approve source tools. An unscanned API/MCP connection needs an admin scan and enabled operations in the app. A listed provider or active row alone is not proof that the intended source operation can run. Use search_connection for full schemas and disclose stored-schema age limits.

Additional Supabase organizations must complete the specific connection request with a newly usable project; an older project is not proof the new request succeeded. Do not authorize a provider on the user's behalf or ask for credentials in chat.

Read list_connections.capabilities and get_connection.scanStatus before choosing an action or preview. inspect_connection means discovery has not established execution readiness. rollout_disabled requires a workspace admin to contact Dreambase, then scan and enable endpoints. preview_source refuses unclassified/mutating operations; saving is not a workaround. MCP previews recheck the live read-only declaration.
