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
  mkdirSync(join(base, "skills/dreambase-echarts"));
  assert.throws(() => validate(base), /Only dreambase-mcp/);
  rmSync(join(base, "skills/dreambase-echarts"), { recursive: true });
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
  assert.ok(!entries.some((path) => /(^tests\/|^scripts\/|echarts|node_modules|\.git\/)/.test(path)));
  assert.equal(readJson("dist/package-report.json").archiveBytes, archive.length);
});
