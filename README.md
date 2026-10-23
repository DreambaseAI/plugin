# Dreambase

Connect agents to Dreambase for connected data, scratch datasets, saved metrics, workspace context and Supabase observability. The package includes dreambase-mcp for everyday operations and dreambase-setup for guided onboarding.

## Install and connect

```bash
npx plugins add DreambaseAI/plugin --yes
```

Native Claude Code:

```bash
claude plugin marketplace add DreambaseAI/plugin
claude plugin install dreambase@dreambase
```

Native Codex:

```bash
codex plugin marketplace add DreambaseAI/plugin
codex plugin add dreambase@dreambase
```

Complete the client's Dreambase OAuth flow. New users sign up on the platform, connect Supabase, and return to their original client connection. Run setup to verify the workspace and source and configure requested alerts. Installation and notification authorization are separate.

## What agents can do

Discover source schemas; author exact SQL/API/MCP dataset definitions; save and query scratch snapshots; retain verified data; manage dataset refresh schedules; define and query metrics; store caller-authored context documents and data-domain rules; inspect collected health, activity and metrics; configure authorized alert destinations.

The external surface uses primitives. Dataset authoring and context creation do not run Dreambase's internal generation agent. Minute collection is controlled by the system. Availability depends on scopes, workspace role, plan, analytics access and deployment.

ChatGPT Work sessions that support MCP Events can subscribe to observability.alert. Other clients can configure supported email, Slack or webhook destinations. Do not assume a channel will wake an unsupported client in the background.

## Privacy and support

Use only data you are authorized to access. Review the [privacy policy](https://dreambase.com/legal/privacy) and [terms](https://dreambase.com/legal/terms). Report issues through [support](https://github.com/DreambaseAI/plugin/issues), excluding credentials and private data.

## Development

Run npm run check:plugin, npm test, npm run build:plugin and npm run check:hosted. Review docs/submission.md before public submission. Static checks do not establish successful OAuth, model behavior, event delivery or directory acceptance.

MIT licensed. Hosted service: https://app.dreambase.com/mcp.

The OpenAI MCP profile declares OAuth with CIMD preference and explicit granular default scopes, including data-domain writes. Users authorize those scopes through the host’s normal OAuth flow. Existing account-only grants do not silently gain them. Legacy client overlays retain their native MCP format.

CI validates the exact supported OpenAI configuration and then checks an extension-free portable projection against the generic Agent Plugins 1.0 schema, which does not model OpenAI server extensions. The projection rejects unknown or missing authentication fields before removing the validated extension.
