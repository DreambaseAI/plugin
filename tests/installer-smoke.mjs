import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { root } from "../scripts/lib.mjs";

const temporary = mkdtempSync(join(tmpdir(), "dreambase-installer-"));
try {
  const bundleOption = process.argv.indexOf("--bundle");
  let bundle;
  if (bundleOption >= 0) {
    assert.ok(process.argv[bundleOption + 1], "--bundle needs a built installer path");
    bundle = resolve(process.argv[bundleOption + 1]);
  } else {
    execFileSync("npm", ["pack", "plugins@1.3.4", "--pack-destination", temporary], { cwd: temporary, stdio: "pipe" });
    execFileSync("tar", ["-xzf", join(temporary, "plugins-1.3.4.tgz"), "-C", temporary]);
    bundle = join(temporary, "package/dist/index.js");
  }
  const preload = join(temporary, "isolate.mjs");
  // Override Node's homedir helper only in the tested subprocess. The user's
  // HOME and real client configurations are never changed.
  writeFileSync(preload, `import os from "node:os";
import { syncBuiltinESMExports } from "node:module";
os.homedir = () => process.env.DREAMBASE_TEST_USER_DIR;
syncBuiltinESMExports();
`);
  const source = join(temporary, "source");
  cpSync(root, source, {
    recursive: true,
    filter: (path) => ![".git", "node_modules", "dist", ".context"].includes(path.split("/").at(-1)),
  });
  function walk(dir) {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    });
  }
  const fixtures = join(temporary, "bin");
  mkdirSync(fixtures);
  for (const command of ["claude", "cursor", "codex", "grok"]) {
    writeFileSync(join(fixtures, command), '#!/bin/sh\nprintf "%s\\n" "$0 $*" >> "$DREAMBASE_NATIVE_LOG"\nexit 0\n', { mode: 0o755 });
  }
  for (const target of ["claude-code", "cursor", "codex", "grok"]) {
    const userDir = join(temporary, target);
    mkdirSync(join(userDir, ".claude"), { recursive: true });
    writeFileSync(join(userDir, ".claude/settings.json"), JSON.stringify({ env: { DREAMBASE_SENTINEL: "keep" } }));
    mkdirSync(join(userDir, ".codex"), { recursive: true });
    writeFileSync(join(userDir, ".codex/config.toml"), 'model = "keep-existing-model"\n');
    const log = join(temporary, `${target}.native.log`);
    const env = { ...process.env, PATH: `${fixtures}:${process.env.PATH}`, DREAMBASE_TEST_USER_DIR: userDir, DREAMBASE_NATIVE_LOG: log, DISABLE_TELEMETRY: "1", DO_NOT_TRACK: "1", NO_COLOR: "1" };
    const run = (args) => execFileSync(process.execPath, ["--import", preload, bundle, ...args], { env, cwd: temporary, encoding: "utf8", stdio: "pipe" });
    const discovery = run(["discover", source]);
    assert.match(discovery, /Found 1 local plugin\(s\)/);
    assert.match(discovery, /dreambase\s+1 skill, mcp/);
    assert.doesNotMatch(discovery, /dreambase-echarts/);
    run(["add", source, "--target", target, "--yes"]);
    run(["add", source, "--target", target, "--yes"]);
    const settings = JSON.parse(readFileSync(join(userDir, ".claude/settings.json"), "utf8"));
    assert.equal(settings.env.DREAMBASE_SENTINEL, "keep");
    assert.match(readFileSync(join(userDir, ".codex/config.toml"), "utf8"), /keep-existing-model/);
    if (target === "grok") {
      assert.match(readFileSync(log, "utf8"), /grok plugin install .* --trust/);
    } else {
      const skillFiles = walk(userDir).filter((path) => path.endsWith("skills/dreambase-mcp/SKILL.md"));
      assert.ok(skillFiles.length > 0, `No installed MCP skill for ${target}`);
      for (const path of skillFiles) {
        assert.deepEqual(readFileSync(path), readFileSync(join(root, "skills/dreambase-mcp/SKILL.md")));
        assert.ok(existsSync(join(dirname(path), "references/dataset-lifecycle.md")));
      }
      assert.ok(!walk(userDir).some((path) => path.includes("dreambase-echarts")));
      if (target === "codex") {
        const marketplace = JSON.parse(readFileSync(join(userDir, ".agents/plugins/marketplace.json"), "utf8"));
        assert.equal(marketplace.plugins.filter((plugin) => plugin.name === "dreambase").length, 1);
      } else {
        const installed = JSON.parse(readFileSync(join(userDir, ".claude/plugins/installed_plugins.json"), "utf8"));
        assert.equal(installed.plugins["dreambase@dreambase"].length, 1);
      }
    }
    console.log(`PASS ${target}: isolated installer wiring and repeat installation (native commands stubbed)`);
  }
  if (process.argv.includes("--aliases")) {
    assert.ok(bundleOption >= 0, "Alias integration checks require --bundle with a patched or publisher-built installer");
    const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
    // Simulate the network clone from the canonical repo with the local fixture.
    // All other Git operations use the real executable; no remote is contacted.
    writeFileSync(join(fixtures, "git"), `#!/bin/sh
if [ "$1" = "clone" ]; then
  test_canonical_found=no
  for test_argument in "$@"; do
    if [ "$test_argument" = "https://github.com/DreambaseAI/plugin" ]; then test_canonical_found=yes; fi
    test_destination="$test_argument"
  done
  if [ "$test_canonical_found" != yes ]; then exit 64; fi
  printf '%s\\n' "$*" >> "$DREAMBASE_GIT_LOG"
  cp -R "$DREAMBASE_ALIAS_FIXTURE" "$test_destination"
else
  exec "$DREAMBASE_REAL_GIT" "$@"
fi
`, { mode: 0o755 });
    for (const target of ["claude-code", "cursor", "codex", "grok"]) {
      for (const [index, alias] of ["dreambase/plugin", "DreambaseAI/skills", "git@github.com:DreambaseAI/skills.git"].entries()) {
        const userDir = join(temporary, `${target}-alias-${index}`);
        mkdirSync(userDir);
        const log = join(userDir, "native.log");
        const gitLog = join(userDir, "git.log");
        const env = {
          ...process.env, PATH: `${fixtures}:${process.env.PATH}`,
          DREAMBASE_TEST_USER_DIR: userDir, DREAMBASE_NATIVE_LOG: log,
          DREAMBASE_REAL_GIT: realGit, DREAMBASE_GIT_LOG: gitLog, DREAMBASE_ALIAS_FIXTURE: source,
          DISABLE_TELEMETRY: "1", DO_NOT_TRACK: "1", NO_COLOR: "1",
        };
        const run = (args) => execFileSync(process.execPath, ["--import", preload, bundle, ...args], { env, cwd: temporary, encoding: "utf8", stdio: "pipe" });
        assert.match(run(["discover", alias]), /dreambase\s+1 skill, mcp/);
        run(["add", alias, "--target", target, "--yes"]);
        assert.match(readFileSync(gitLog, "utf8"), /https:\/\/github.com\/DreambaseAI\/plugin/);
        if (target === "grok") assert.match(readFileSync(log, "utf8"), /grok plugin install DreambaseAI\/plugin --trust/);
        else assert.ok(walk(userDir).some((path) => path.endsWith("skills/dreambase-mcp/SKILL.md")));
      }
      console.log(`PASS ${target}: aliases resolve for discovery and installation (network and native commands stubbed)`);
    }
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
