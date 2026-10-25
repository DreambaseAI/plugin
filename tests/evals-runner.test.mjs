import test from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { evaluateTrace, runSuite, sanitizeTrace } from "../scripts/run-evals.mjs";
const scenario = { id: 1, name: "preview", prompt: "preview", assertions: ["Nothing persisted"], machine_checks: { forbid: ["save_dataset"], require_any: [["preview_source"]] } };
const trace = { client: "fixture-host", model: "fixture-model", answer: "Sample only", toolCalls: [{ name: "preview_source" }] };
test("planning never reports agent execution or a behavioral pass", () => {
  assert.equal(runSuite([scenario])[0].status, "not_run");
  assert.equal(evaluateTrace(scenario, trace).status, "needs_review");
  assert.equal(evaluateTrace(scenario, trace, { fixture: true }).status, "fixture_checked");
  assert.throws(() => runSuite([scenario], { execute: true }));
});
test("machine checks reject wrong tool usage and missing trace identity", () => {
  assert.equal(evaluateTrace(scenario, { ...trace, toolCalls: ["save_dataset"] }).status, "failed");
  assert.equal(evaluateTrace(scenario, {}).status, "failed");
  assert.equal(evaluateTrace(scenario, { ...trace, toolCalls: [null] }).status, "failed");
});
test("trace sanitization removes credential fields and callback bindings", () => {
  const sanitized = sanitizeTrace({ token: "private", answer: "Bearer private http://localhost/callback?code=private&state=private", nested: { password: "private" } });
  assert.ok(!JSON.stringify(sanitized).includes("private"));
});

test("adapter execution receives the named fixture, sanitizes traces and skips unapproved writes", () => {
  const dir = mkdtempSync(join(tmpdir(), "dreambase-eval-"));
  try {
    const adapter = join(dir, "fixture-adapter.mjs");
    writeFileSync(adapter, `#!/usr/bin/env node
import { readFileSync } from "node:fs";
const input = JSON.parse(readFileSync(0, "utf8"));
if (input.fixtureWorkspace !== "disposable-review" || !input.plugin || input.scenario.id !== 1) process.exit(2);
console.log(JSON.stringify({ client: "fixture-host", model: "fixture-model", answer: "Sample only", token: "private-token", toolCalls: ["preview_source"] }));
`, { mode: 0o700 });
    const result = runSuite([scenario, { ...scenario, id: 2, writes: true }], { execute: true, fixture: true, adapter, fixtureWorkspace: "disposable-review" });
    assert.equal(result[0].status, "fixture_checked");
    assert.equal(result[0].traceSha256.length, 64);
    assert.ok(!JSON.stringify(result).includes("private-token"));
    assert.equal(result[1].status, "skipped");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
