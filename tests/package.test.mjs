import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { archiveLimit, readJson, root, runtimeFiles } from "../scripts/lib.mjs";
import { validate } from "../scripts/validate.mjs";

function fixture(t) {
  const base = mkdtempSync(join(tmpdir(), "dreambase-package-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  for (const path of [...runtimeFiles, "tests/submission-cases.json"]) {
    mkdirSync(dirname(join(base, path)), { recursive: true });
    cpSync(join(root, path), join(base, path));
  }
  return base;
}

test("canonical plugin and all compatibility files validate", () => {
  assert.equal(validate().runtimeFileCount, runtimeFiles.length);
});

test("a stale compatibility manifest blocks packaging", (t) => {
  const base = fixture(t);
  const path = ".codex-plugin/plugin.json";
  const manifest = readJson(path, base);
  manifest.version = "1.0.0";
  writeFileSync(join(base, path), JSON.stringify(manifest));
  assert.throws(() => validate(base), /is stale/);
});

test("missing reference, symlink, extra skill, and skill growth are rejected", (t) => {
  const base = fixture(t);
  const path = join(base, "skills/dreambase-mcp/references/connectors.md");
  const original = readFileSync(path);
  rmSync(path);
  assert.throws(() => validate(base), /Missing runtime file/);
  symlinkSync(join(root, "skills/dreambase-mcp/references/connectors.md"), path);
  assert.throws(() => validate(base), /Runtime symlink/);
  rmSync(path);
  writeFileSync(path, original);
  mkdirSync(join(base, "skills/unexpected-skill"));
  assert.throws(() => validate(base), /Only product and setup/);
  rmSync(join(base, "skills/unexpected-skill"), { recursive: true });
  writeFileSync(path, "x".repeat(64 * 1024));
  assert.throws(() => validate(base), /internal cap/);
});

test("the built ZIP contains only installable runtime files", () => {
  execFileSync(process.execPath, [join(root, "scripts/build-plugin.mjs")]);
  const archive = readFileSync(join(root, "dist/dreambase-plugin.zip"));
  assert.ok(archive.length <= archiveLimit);
  const entries = [];
  // Read the central directory; this catches accidentally packaged directory
  // entries, scripts, evaluation files, and additional plugin roots.
  let end = archive.length - 22;
  while (end >= 0 && archive.readUInt32LE(end) !== 0x06054b50) end--;
  assert.ok(end >= 0, "Missing ZIP end-of-central-directory record");
  const count = archive.readUInt16LE(end + 10);
  let offset = archive.readUInt32LE(end + 16);
  for (let index = 0; index < count; index++) {
    assert.equal(archive.readUInt32LE(offset), 0x02014b50);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    entries.push(archive.subarray(offset + 46, offset + 46 + nameLength).toString("utf8"));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  assert.deepEqual(entries, runtimeFiles);
  assert.ok(!entries.some((path) => /(^tests\/|^scripts\/|unexpected-skill|node_modules|\.git\/)/.test(path)));
  assert.equal(readJson("dist/package-report.json").archiveBytes, archive.length);
});

test("OpenAI MCP connection declares OAuth and explicit data-domain write consent", () => {
  const auth = readJson("mcp.json").mcpServers.dreambase.extensions?.["com.openai"]?.auth;
  assert.equal(auth?.type, "oauth");
  assert.equal(auth.client.mode, "cimd");
  assert.ok(auth.defaultScopes.includes("data-domains:write"));
  assert.ok(auth.defaultScopes.includes("data-domains:read"));
  assert.ok(!auth.defaultScopes.includes("account"));
});

test("portable core projection retains server semantics and rejects auth drift", async () => {
  const { portableMcpCore } = await import("../scripts/portable-mcp.mjs");
  const config = readJson("mcp.json");
  const core = portableMcpCore(config);
  assert.deepEqual(core.mcpServers.dreambase, {
    type: "streamable-http", url: config.mcpServers.dreambase.url,
  });
  assert.ok(config.mcpServers.dreambase.extensions, "Projection must not mutate its input");
  const missingAuth = structuredClone(config);
  delete missingAuth.mcpServers.dreambase.extensions;
  assert.throws(() => portableMcpCore(missingAuth), /OpenAI profile/);
  const badAuth = structuredClone(config);
  badAuth.mcpServers.dreambase.extensions["com.openai"].auth.clientSecret = "must-not-ship";
  assert.throws(() => portableMcpCore(badAuth), /OpenAI profile/);
});
