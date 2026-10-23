# Verification for 3.0.0

Record results against the exact source revision and package hash. Local manifest/package tests establish file integrity, allowlists and argument wiring. Isolated installer tests stub native clients; they do not prove UI, OAuth or behavior.

Required evidence includes: current local checks; exact ZIP inventory; supported-client setup; production signup and Supabase return; five positive/three negative review cases; real recording; authorized event subscription/delivery/renewal/unsubscribe; safe alternate-client delivery; publisher/domain verification and portal scans.

Until executed, each live case remains not run. docs/submission.md describes the reviewer fixtures and secure access requirements. Optional installer alias publication is separate from the canonical documented install path.

## Build verification — 2026-10-23

- Local plugin validator: passed, 19 runtime files, two packaged skills.
- Package/manifest tests: 6 passed.
- Agent Plugins 1.0 plugin schema and portable MCP core projection: passed using ajv-cli 5; exact OpenAI server profile validated separately.
- Claude Code 2.1.293 strict plugin/marketplace validation: passed.
- Cursor pinned template validator: passed; hooks warning is informational because this plugin has no hooks.
- Published plugins 1.3.4 installer harness: Claude Code, Cursor, Codex and Grok passed, including repeated installation, with native executables stubbed and isolated configuration directories.
- Hosted listing/legal/support URLs, protected resource metadata, OAuth S256/registration and MCP auth challenge: passed.

These checks do not exercise production login, Supabase consent or live MCP Events. The connected dev server still advertises the previous contract; deploy the revised server before behavioral review. New Supabase onboarding also requires workspace Observability access. The ZIP hash and exact inventory are recorded with the build evidence in Dream's feature implementation report.

## Local E2E verification — 2026-10-23

The sibling Dream worktree's isolated seeded stack passed five of seven planned flows: OAuth login/register return, fresh signup/email confirmation/setup, exact context and domain persistence through MCP/REST with database probes, retired-tool/route and legacy-scope denial, and redirect/interrupted-setup recovery. All 14 existing OAuth browser regressions passed. Full Dream Vitest: 944 files passed, 13,760 tests passed, 98 skipped.

Actual modern HTTP discovery advertises Events and declares observability.alert. This is not host event delivery evidence. Supabase's real provider challenged the authorized seeded fixture sign-in with hCaptcha before credentials were validated; consent/import/agent return remains blocked. Supported Work-host callback/delivery remains blocked pending a matching hosted deployment and host session. No local raw credentials/HARs are packaged or published.

## Branch review corrections — 2026-10-23

Restored the required OpenAI server OAuth declaration, CIMD preference and 13 granular default scopes. A dedicated regression fails against the original missing declaration. The exact OpenAI profile is validated before the generic core projection; unknown/missing auth fields fail rather than being stripped silently. An independent verifier extracted the built ZIP, compared it with source, checked all requested scopes against the server catalog and rejected nine malformed profiles. These are configuration/package checks, not evidence of portal acceptance or actual hosted CIMD negotiation.
