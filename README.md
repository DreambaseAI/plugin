# Dreambase

Connect your coding agent to Dreambase to query existing datasets, plan and save
new datasets, inspect dashboards and connections, manage dataset retention and
freshness, and review database health. This plugin bundles one focused skill,
`dreambase-mcp`, and the hosted Dreambase MCP connection.

## Install

The published installer currently accepts the real repository address:

```bash
npx plugins add DreambaseAI/plugin --yes
```

The planned short command, `npx plugins add dreambase/plugin --yes`, requires
the installer alias update described in [installer migration](https://github.com/DreambaseAI/plugin/blob/main/docs/installer-migration.md).
Until that update is published, use `DreambaseAI/plugin`.

Select a single client with `--target claude-code`, `--target cursor`,
`--target codex`, or `--target grok`. The installer otherwise uses detected
clients. Installing a plugin does not authorize your Dreambase account; OAuth
consent happens separately in your client.

For native Claude Code installation:

```bash
claude plugin marketplace add DreambaseAI/plugin
claude plugin install dreambase@dreambase
```

For native Codex installation:

```bash
codex plugin marketplace add DreambaseAI/plugin
codex plugin add dreambase@dreambase
```

Cursor can install the plugin from its marketplace once the listing is approved,
or through the installer above. Grok Build also accepts the Claude-compatible
plugin directly:

```bash
grok plugin install DreambaseAI/plugin --trust
```

## Connect and verify

Sign in at [Dreambase](https://app.dreambase.com), join or create a workspace,
and connect a data source in the app. Restart your agent client, connect its
Dreambase MCP server, and complete its browser-based OAuth consent flow.
Then ask the agent to call `whoami` and `list_workspaces`. An empty workspace
list means the signed-in account needs workspace membership.

The sole declared MCP endpoint is `https://app.dreambase.com/mcp`. The plugin
ships no local server, lifecycle hook, runtime package dependency, telemetry
script, or token. Authorized MCP calls send their arguments to Dreambase; source
planning and execution can also invoke your connected providers. Results depend
on OAuth scopes, workspace membership, account plan, and available deployment
features. Some dataset write tools are experimental and may not be advertised
for every account.

For example, ask to summarize your dashboards, query weekly signups from an
existing dataset, or review the latest database health report. Dataset planning
and saving are separate steps. Refreshing re-executes the source and can incur
usage. Promotion starts durable-storage usage and cannot currently be undone;
the skill requires a separate confirmation after verification.

## Optional skills and migration

Chart design, ECharts, public reporting, storytelling, presentations, industrial
schematics, micrographics, and skill creation live in
[DreambaseAI/skills](https://github.com/DreambaseAI/skills). Install them
independently when needed:

```bash
npx skills add DreambaseAI/skills --skill dreambase-echarts
```

Version 2.0.0 preserves the plugin and MCP skill identifiers but removes the
other eight skills from the plugin bundle. Existing users should update the
plugin or reinstall from this repository. Once the skills-repo migration lands,
its Claude and Codex catalogs redirect to this source; Cursor users should reinstall. Previously
installed optional skills can be installed separately from the skills library.

## Development

Node.js 20+ and the `zip` command are needed for development and packaging.
There are no npm dependencies and no install hooks.

```bash
npm run sync:manifests
npm run check:plugin
npm test
npm run build:plugin
npm run check:hosted
```

Edit `plugin.json` as the canonical metadata source, then synchronize the
compatibility manifests. The build emits `dist/dreambase-plugin.zip` and
`dist/package-report.json`. It copies only the runtime allowlist and enforces
project budgets of 64 KiB for the skill and 256 KiB for the complete ZIP; these
are internal limits, not marketplace quotas. Tests, development scripts,
submission documentation, and CI do not enter the ZIP.

See [submission preparation](https://github.com/DreambaseAI/plugin/blob/main/docs/submission.md) for platform-specific review
steps and the checks requiring authenticated accounts.

## Support and license

[Support](https://github.com/DreambaseAI/plugin/issues) ·
[Privacy](https://dreambase.com/legal/privacy) ·
[Terms](https://dreambase.com/legal/terms) · [MIT license](LICENSE)
