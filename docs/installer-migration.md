# Installer source migration

The public npm `plugins` package inspected for this split is version 1.3.4.
It already supports Claude Code, Cursor, Codex, and Grok Build. Its published
metadata names `https://github.com/vercel-labs/plugins`, which was inaccessible
from the workspace. The publisher's writable source checkout is required to
implement and publish the changes below. The plugin repository itself cannot
make a nonexistent GitHub owner/repo alias resolve.

The ready-to-integrate implementation is
[`integrations/plugins/source-alias.mjs`](../integrations/plugins/source-alias.mjs),
with unit coverage in `tests/source-alias.test.mjs`. Import it into the publisher
source (or convert it to TypeScript), call it at the start of `cmdInstall` and
`cmdDiscover`, and use the returned source for the entire command. This helper
has not been integrated into or published as the npm installer release.

## Source normalization

Before cloning, discovering, computing cache or marketplace names, or passing
a source to a native client, normalize these GitHub repo identities:

| Input identity | Canonical source |
| --- | --- |
| `dreambase/plugin` | `DreambaseAI/plugin` |
| `DreambaseAI/skills` | `DreambaseAI/plugin` |
| `DreambaseAI/plugin` | `DreambaseAI/plugin` |

Match owner/repo case-insensitively for GitHub shorthand, HTTPS GitHub URLs,
and GitHub SSH URLs, accepting an optional `.git` suffix. Leave unrelated
repositories, local paths, and non-GitHub URLs unchanged. Preserve original
input for diagnostics, but install from the canonical identity. Apply this in
both `add` and `discover`.

In the inspected bundle, `resolveSource` only converts shorthand to a literal
GitHub URL. `cmdInstall` continues passing its original source to `installPlugins`,
and `getGrokNativeSource` passes it to `grok plugin install`. Therefore changing
only `resolveSource` will still break Grok installation. Canonicalize once at
each command entrypoint and use the result throughout the command.

The package does not install externally sourced marketplace entries: it reports
them as remote plugins. Normalize the old skills repo directly rather than
depending on its redirect catalog. Native Claude and Codex clients can use
their own remote-source catalogs.

## Acceptance checks

Test alias and canonical forms, HTTPS and SSH spellings, the old repo, unrelated
repos, and local paths. Confirm discovery finds only `dreambase-mcp`, and that
the Grok native command receives `DreambaseAI/plugin`. Preserve existing user
settings and verify repeated installation does not duplicate the plugin.

The integration harness in `tests/installer-smoke.mjs` tests the published
installer against this plugin using isolated directories and stub native
executables. It verifies packaging and installation wiring; it does not prove
that OAuth or the client UI works. After the alias change is built, run it with
`--bundle /absolute/path/to/installer/dist/index.js --aliases` and run the alias-specific
unit tests in the installer source repo before publishing.
