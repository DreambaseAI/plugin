# Submission preparation

This repository prepares the package and public review cases. Credentials,
account creation, data seeding, a real walkthrough recording, and portal
submission cannot be inferred from the source code. Do not enter invented
accounts, placeholder recordings, or real customer data in a submission.

## Package

Run `npm run check:plugin`, `npm test`, `npm run build:plugin`, and
`npm run check:hosted`. Validate Claude strictly with
`claude plugin validate . --strict`. The package report records exact contents
and sizes. The runtime allowlist contains one skill, all its local references,
portable and compatibility manifests, the logo, README, and license.

The original OpenAI rejection text was unavailable. OpenAI documents a 100 MB
compressed ZIP cap and reports its compressed per-skill limit in the error.
Anthropic holds non-image/font files over 256 KiB and plugins over 512 files
for review. Our much smaller budgets are preventative project limits.

## Reviewer workspace and recording

Use a dedicated account containing sample data only, a workspace named Acme,
a `daily_signups` dataset with dates and signup counts, at least one dashboard,
a completed health report, and a sample source connection. Grant read scopes
for the read cases and the necessary write scopes and experimental audience
access for the planning, save, and connector cases. Configure a test provider
for connector authorization so reviewers do not access production resources.

Confirm the reviewer login works immediately without MFA, email/SMS codes,
magic links, or private-network access. Enter its credentials and access
instructions only in the secure portal. Do not commit them or add them to the
ZIP. Run all five positive and three negative cases in
`tests/submission-cases.json`; the manifest imports these cases using
`extensions.com.openai.review.test_cases`.

Record the test cases and supported-client workflows. Add the accessible HTTPS
recording URL as `extensions.com.openai.review.demo_recording_url`, synchronize
manifests, and rebuild the ZIP. The recording URL is intentionally absent until
a real recording exists. Existing 12 behavioral evaluations in `tests/evals.json`
must also be run against a connected client; static tests do not establish
model behavior.

## OpenAI

Open the existing Dreambase submission and upload the corrected ZIP using
**With MCP**, keeping the existing identity and endpoint. Confirm the verified
publisher identity, domain challenge, current tool scan, review cases, recording,
release notes, and secure reviewer access. Only one review can be active.
Resolve required findings before resubmitting.

The endpoint must expose explicit `readOnlyHint`, `openWorldHint`, and
`destructiveHint` annotations and justifications for each tool. These are
server-side checks; this packaging repo cannot repair missing server metadata.
Do not replace another listing's domain challenge token.

The OpenAI subtitle is “Analyze your Dreambase data”; category is Productivity.
Website, support, privacy, and terms links are provided. The optional brand
color is omitted. This package has no lifecycle hooks or app-ID references.

Sources: [submission](https://developers.openai.com/plugins/deploy/submission),
[error reference](https://developers.openai.com/plugins/deploy/submission-errors),
[portable packaging](https://developers.openai.com/plugins/build/plugins).

## Anthropic

Connect a GitHub account with write access to this repository in the intended
paid Claude organization. Submit the root plugin at
https://claude.ai/directory/manage, validate the exact commit, complete listing
and data-handling details, and submit for review. Use the existing submission
if one exists, rather than creating duplicate listings. The public repo,
readable files, README, license, and metadata support the directory checks.

If the hosted Dreambase MCP connector is not already submitted, submit that
endpoint separately from the same organization and pair it with the plugin.
Keep the same endpoint to avoid exposing two copies of the tools. An official
Claude Code marketplace listing is a separate partner channel.

Sources: [plugin submission](https://claude.com/docs/plugins/submit),
[checklist](https://claude.com/docs/plugins/pre-submission-checklist),
[connector and plugin listings](https://claude.com/docs/directory/publish).

## Cursor and Grok

Submit https://github.com/DreambaseAI/plugin at
https://cursor.com/marketplace/publish, or request a source update/re-index for
an existing listing. Run the current official Cursor validator first. Cursor
requires an open-source repository and reviews both listings and updates.

Grok reads Claude-compatible plugins and marketplaces. Test installation with
`grok plugin install DreambaseAI/plugin --trust` and OAuth with a real account.
No public xAI directory submission process was established by the documentation
review; repository installation is the supported distribution plan.

Sources: [Cursor reference](https://cursor.com/docs/reference/plugins),
[Cursor review](https://cursor.com/help/security-and-privacy/marketplace-security),
[Grok compatibility](https://docs.x.ai/build/features/skills-plugins-marketplaces).
