---
name: dreambase-setup
description: Set up Dreambase after installation or when a user wants to sign up, connect Supabase, return to their agent, or configure alerts and supported MCP Events subscriptions.
---

# Set up Dreambase

Guide account setup and source authorization, then verify actual readiness. Never request passwords, tokens, provider keys or webhook signing secrets in chat.

## Connect the account

1. Ask the host to connect/authenticate the packaged Dreambase MCP server when no authorized connection exists. The host starts OAuth in a browser. A tool call cannot create an account before authentication.
2. The user signs in or signs up on Dreambase, authorizes Supabase in the platform onboarding flow, and returns through the original OAuth consent callback to the initiating client. Preserve the host's original connection flow; never invent a client return URL or bypass consent.
3. Platform Supabase onboarding requires Observability access for the workspace. If the platform reports setup unavailable, explain the access requirement and direct the user to Dreambase support. Do not bypass the platform gate or claim a connection was created.
4. If the browser was closed, the flow expired, or the host still has no tools, restart the host's connection flow. Do not claim authentication succeeded merely because the user visited a page.
5. Once connected, call whoami and list_workspaces. Use the named workspace or let the user choose among several. Verify its Supabase connection using list_connectors and list_connections.
6. For an existing account that still needs Supabase, use request_connector_connection and poll get_connection_request. Proceed only on completed plus connectorConnected true. See the MCP skill's connectors reference for additional organizations and approval limits.

## Offer alert setup

Ask what the user wants monitored, project scope, severity, firing/resolution changes, destination and how the agent should respond. Existing authorization may already answer these; do not ask twice. Read get_observability_alerts before changing anything. Enabling alerts or creating destinations is a user-authorized configuration change, not an installation side effect. Minute metrics are system-managed.

### ChatGPT Work with native events

MCP Events requires a capable Work host (Work on ChatGPT web, or Work with Cloud selected on desktop) and MCP protocol 2026-07-28. Discover the host/server event capability; do not infer it solely from the product name. Workspace controls, user scopes and manager role still apply.

For an authorized subscription, enable the requested alert settings if needed, then ask the host to subscribe to observability.alert using the discovered event filters. The host supplies the callback URL and signing secret via events/subscribe. These are native protocol methods, not tools named subscribe or add_observability_alert_channel with kind mcp. Never invent callbacks or secrets.

Verify callback acceptance and inspect get_observability_alerts for a live matching mcp channel, its filters and expiry. Explain what the subscription hears and the requested response behavior. A live channel proves configuration; do not claim an event was delivered unless delivery evidence confirms it. The host renews expiring subscriptions. Use native unsubscribe to stop monitoring, or the supported channel-removal tool when appropriate.

### Other clients or unsupported event sessions

Offer supported email, Slack or HTTPS webhook channels. Use only a user-supplied/approved destination and the actual tool schema. If a required secret is involved, use the platform or a secure host mechanism; never expose it in the conversation. A delivery channel sends to that destination; it does not prove the current agent will wake up in the background. Explain that boundary and verify the saved configuration.

## Finish

Summarize the selected workspace, observed Supabase connection readiness, configured rules and verified destination/subscription state. Name any pending first check, missing permission, unsupported capability or unverified delivery. Offer a first bounded analytics or observability question using the main dreambase-mcp skill.
