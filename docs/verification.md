# Verification for the 2.0.0 split

Checked on 2026-10-09:

- Six automated package/alias tests pass: canonical metadata, manifest drift,
  missing or symlinked resources, unexpected skills, size growth, exact archive
  contents, and source normalization boundaries.
- Portable plugin and MCP manifests pass the Agent Plugins 1.0.0 JSON schemas.
- Both Claude manifests pass `claude plugin validate --strict` with 2.1.293.
- The pinned official Cursor template validator passes. It reports only that
  hooks are absent, which is expected for this remote-MCP package.
- Published `plugins@1.3.4` installs this local plugin in isolated Claude,
  Cursor, and Codex stores. Repeat installation preserves existing sentinel
  settings and does not duplicate the registered plugin. Grok's native command
  is invoked with the expected arguments.
- A workspace-patched copy of that npm bundle passes discovery and installation
  tests for the short alias and old repository forms across all four targets.
  Its native Grok call receives the canonical new repository identity.
- Website, support, privacy, and terms endpoints respond successfully. OAuth
  metadata advertises PKCE S256 and registration, and unauthenticated MCP
  initialization returns the expected discovery challenge.
- The original four references, OpenAI skill dependency file, and 12 evaluation
  scenarios are preserved. The runtime skill occupies 27,789 bytes. The build's
  `dist/package-report.json` records the final archive size and file inventory.

Installer tests stub native client executables and, for alias tests, the network
clone. They verify installation wiring, resource preservation, source routing,
and repeat-install behavior. They do not verify a real client's UI, OAuth
session, tool discovery after sign-in, or model behavior.

Still required before marketplace submission:

- Integrate the alias helper into the publisher's installer source and publish
  its npm release. The patched bundle used for testing was not published.
- Run the behavioral evaluations and five positive/three negative review cases
  with a dedicated, seeded reviewer account, including experimental access
  where required.
- Record a real walkthrough and enter credentials through the secure portals.
- Complete domain verification, authenticated tool/annotation scans, and each
  platform's submission and policy attestations.
