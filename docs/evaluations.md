# Agent evaluations

`npm run evals` prints all scenarios as **not_run**. It makes no model calls and never selects a real workspace.

For an actual run, supply an executable adapter for the intended agent host/model and a named disposable fixture:

```
npm run evals -- --execute --adapter /absolute/path/to/host-adapter --fixture-workspace "Acme Review" --output /private/path/results.json
```

The adapter receives JSON on stdin: scenario, fixtureWorkspace and plugin source path. It installs/loads this plugin in the intended host, executes the scenario against that fixture, and returns JSON with `client`, `model`, `answer` and `toolCalls` (names or objects with name/arguments/result). Use real host transcripts; the runner cannot independently prove the provenance of adapter-supplied traces. No shell command string is evaluated. The runner enforces a two-minute deadline and 2 MiB output limit per case.

Write scenarios skip unless `--allow-writes` explicitly permits changes to the named disposable fixture. `--fixture` marks simulated-adapter results **fixture_checked**, never model evidence. Read-only scenarios still require source-operation authorization; fixtures must be isolated from customer systems.

Machine checks validate required/forbidden tool choices. A passing selection check becomes **needs_review**, not a behavioral pass: review every English assertion against the recorded trace and the known fixture answer. Retain the trace hash, exact plugin commit, deployed server commit, host/model configuration and reviewer verdict. Package tests and this runner's fixture tests do not complete marketplace evaluations.

Credential-like fields, bearer tokens, JWTs and callback code/state are redacted. Outputs are created mode 0600, and tests/eval-results is ignored. Review traces for other private data before sharing them. A new and an existing conversation must both exercise installation/onboarding; a generic CLI adapter does not prove host-triggered onboarding.
