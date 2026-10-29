# Submission preparation for 3.0.0

The package contains dreambase-mcp and dreambase-setup plus the hosted MCP configuration. Run npm run check:plugin, npm test, npm run build:plugin and npm run check:hosted -- --origin https://the-explicit-deployment.example. Inspect the actual ZIP and its package report. CI additionally checks portable schemas, Claude compatibility, Cursor validation and isolated installer wiring.

## Contract and rollout

Release the revised server contract before submitting this package: direct dataset authoring; deterministic context documents; metric primitives; data-domain reads and writes; observability; system-controlled collection. The OpenAI server configuration declares OAuth with CIMD preference and explicit granular default scopes. New data-domain writes need granular OAuth consent. Existing grants must not silently gain the permission.

Register extensions.com.openai.onboardingSkill and test setup both in a new conversation and when installing during an existing one. Verify the signup, Supabase connection, original OAuth callback, returned tools and selected workspace. Test existing accounts, interrupted setup and expired authorization too.

## Reviewer setup

Use a dedicated reviewer account and sample-only Acme Review workspace. Provide a durable daily_signups fixture with four complete UTC weeks and known totals, saved signup metric/history, a safe source with known columns, editable context and data domains, and completed Supabase monitoring evidence. Grant the granular read/write scopes used by the cases and appropriate owner/admin, subscription and deployment access.

Keep reviewer credentials and exact login instructions only in secure portal fields. Verify that reviewers can authenticate without your private mailbox, phone, network or real customer data. Use a supported dedicated review account or reviewer-email flow. Never commit credentials or fabricated evidence.

Run the five positive and three negative cases in tests/submission-cases.json against the exact production endpoint/version. Record actual results and tool traces separately; package and schema validation are not behavioral passes. The broader tests/evals.json scenarios cover recovery and host differences.

## Real walkthrough

Record the actual client/setup skill, browser signup and Supabase connection, return to the agent, a bounded dataset/metric answer, context or domain storage, and observed monitoring. For a capable ChatGPT Work session, show native event discovery, callback verification, subscription, a matching test event, a nonmatching filter case, renewal and unsubscribe. For other clients demonstrate an authorized test delivery channel and explain its limits. Do not show secrets.

Verify readable playback and reviewer access, then set review.demo_recording_url to the actual HTTPS recording, synchronize manifests and rebuild. No recording URL is populated until a real recording is available. A script or local screenshot does not complete this requirement.

## Portal completion

Use the intended existing publisher/submission. Verify business or individual identity, domain ownership, all listing URLs and actual policy coverage, country targeting, commerce declarations, reviewer access and current tool/event scans. Confirm readOnlyHint, destructiveHint and openWorldHint match the actual production server. Inspect any linked connector-card UI and CSP. Required justifications or attestations, when requested by the portal, must come from the authorized publisher.

The public privacy policy must accurately explain saved context, snapshots, retention/deletion controls, model processing, connected provider access and event delivery. Do not infer these commitments from HTTP success or invent them in this repo.

Upload, submission and publication are separate actions. A valid ZIP does not prove portal readiness or guarantee acceptance. This source update does not deploy or submit.

Sources: https://developers.openai.com/plugins/deploy/submission and https://developers.openai.com/plugins/build/mcp-events.

Authentication configuration follows the [OpenAI packaging reference](https://developers.openai.com/plugins/build/plugins#configure-mcp-authentication). The upstream generic MCP schema does not model server extensions: validation checks the exact supported OpenAI profile before projecting the portable core. Do not remove the OAuth declaration merely to satisfy that generic schema.

Agent scenarios are runnable with an explicit host adapter and disposable fixture; see [evaluation instructions](evaluations.md). Default runs record not_run, never a behavioral pass. Hosted checks require the exact target origin and verify OAuth metadata/challenges; they do not exercise signed-in tools or prove directory acceptance.
