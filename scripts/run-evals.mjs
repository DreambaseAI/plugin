#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, chmodSync } from "node:fs";
import { isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

export function sanitizeTrace(value) {
  if (Array.isArray(value)) return value.map(sanitizeTrace);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /token|authorization|cookie|password|secret|api[_-]?key|code_verifier/i.test(key) ? "[redacted]" : sanitizeTrace(item)]));
  if (typeof value === "string") return value.replace(/Bearer\s+[^\s"']+/gi, "Bearer [redacted]").replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]").replace(/([?&](?:code|state|token|api_key)=)[^&#\s]+/gi, "$1[redacted]");
  return value;
}

export function evaluateTrace(scenario, trace, { fixture = false } = {}) {
  if (!trace || typeof trace.answer !== "string" || !Array.isArray(trace.toolCalls) || typeof trace.client !== "string" || typeof trace.model !== "string") return { status: "failed", reason: "Adapter must return answer, toolCalls, client and model." };
  if (trace.toolCalls.some(call => !(typeof call === "string" && call.length) && !(call && typeof call === "object" && typeof call.name === "string" && call.name.length))) return { status: "failed", reason: "Malformed tool trace entry." };
  const calls = trace.toolCalls.map(call => typeof call === "string" ? call : call.name);
  const checks = scenario.machine_checks ?? {};
  const failures = [...(checks.forbid ?? []).filter(name => calls.includes(name)).map(name => `Forbidden tool: ${name}`),
    ...(checks.require_any ?? []).filter(group => !group.some(name => calls.includes(name))).map(group => `Missing one of: ${group.join(", ")}`)];
  if (failures.length) return { status: "failed", failures };
  // English assertions remain review work: passing a tool-name check does not prove reasoning.
  return { status: fixture ? "fixture_checked" : "needs_review", machineChecksPassed: true,
    assertions: scenario.assertions.map(assertion => ({ assertion, status: "unreviewed" })) };
}

export function runSuite(scenarios, options = {}) {
  if (options.execute && (!options.adapter || !isAbsolute(options.adapter) || !options.fixtureWorkspace)) throw new Error("Execution requires --adapter /absolute/executable and --fixture-workspace naming a disposable workspace. No live workspace is selected implicitly.");
  return scenarios.map(scenario => {
    if (!options.execute) return { id: scenario.id, name: scenario.name, status: "not_run", prompt: scenario.prompt, assertions: scenario.assertions };
    if (scenario.writes && !options.allowWrites) return { id: scenario.id, name: scenario.name, status: "skipped", reason: "Write scenario requires --allow-writes for the named disposable fixture." };
    const input = JSON.stringify({ scenario, fixtureWorkspace: options.fixtureWorkspace, plugin: new URL("../", import.meta.url).pathname });
    const run = spawnSync(options.adapter, [], { input, encoding: "utf8", timeout: 120000, maxBuffer: 2 * 1024 * 1024, shell: false });
    if (run.error || run.status !== 0) return { id: scenario.id, name: scenario.name, status: "failed", reason: "Adapter failed or exceeded its deadline/output limit." };
    let trace;
    try { trace = JSON.parse(run.stdout); } catch { return { id: scenario.id, name: scenario.name, status: "failed", reason: "Adapter did not return JSON." }; }
    const sanitized = sanitizeTrace(trace);
    return { id: scenario.id, name: scenario.name, ...evaluateTrace(scenario, trace, { fixture: options.fixture }),
      traceSha256: createHash("sha256").update(JSON.stringify(sanitized)).digest("hex"), trace: sanitized };
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2); const arg = flag => args[args.indexOf(flag) + 1];
  try {
    const suite = JSON.parse(readFileSync(new URL("../tests/evals.json", import.meta.url), "utf8"));
    const results = runSuite(suite.evals, { execute: args.includes("--execute"), adapter: args.includes("--adapter") ? arg("--adapter") : undefined,
      fixtureWorkspace: args.includes("--fixture-workspace") ? arg("--fixture-workspace") : undefined,
      fixture: args.includes("--fixture"), allowWrites: args.includes("--allow-writes") });
    const report = JSON.stringify({ generatedAt: new Date().toISOString(), results,
      note: "Machine checks cover tool selection only. needs_review means English assertions require human or independent grading against the recorded trace; fixture_checked is not model evidence." }, null, 2);
    if (args.includes("--output")) { writeFileSync(arg("--output"), report + "\n", { mode: 0o600 }); chmodSync(arg("--output"), 0o600); } else console.log(report);
    process.exitCode = results.some(result => result.status === "failed") ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
