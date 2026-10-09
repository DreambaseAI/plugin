import assert from "node:assert/strict";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generatedFiles, readJson, root, runtimeFiles, skillLimit } from "./lib.mjs";

export function validate(base = root) {
  const manifest = readJson("plugin.json", base);
  assert.equal(manifest.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
  assert.equal(manifest.name, "dreambase");
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.repository, "https://github.com/DreambaseAI/plugin");
  for (const field of ["description", "author", "license", "extensions"]) {
    assert.ok(manifest[field], `Missing ${field}`);
  }
  for (const [path, expected] of Object.entries(generatedFiles(manifest))) {
    assert.deepEqual(readJson(path, base), expected, `${path} is stale; run npm run sync:manifests`);
  }
  for (const path of runtimeFiles) {
    const full = join(base, path);
    assert.ok(existsSync(full), `Missing runtime file ${path}`);
    // Check parents too, so a symlinked directory cannot bypass containment.
    for (let part = full; part !== base; part = dirname(part)) {
      assert.ok(!lstatSync(part).isSymbolicLink(), `Runtime symlink: ${part}`);
    }
    assert.ok(lstatSync(full).isFile(), `${path} must be a regular file`);
    assert.ok(lstatSync(full).size < 256 * 1024, `${path} exceeds the Anthropic text-file threshold`);
  }
  assert.deepEqual(readdirSync(join(base, "skills")), ["dreambase-mcp"], "Only dreambase-mcp may ship");
  const skillRoot = join(base, "skills/dreambase-mcp");
  const skillFiles = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      assert.ok(!entry.isSymbolicLink(), `Skill symlink: ${path}`);
      if (entry.isDirectory()) walk(path);
      else {
        assert.ok(entry.isFile(), `Not a regular skill file: ${path}`);
        skillFiles.push(path);
      }
    }
  }
  walk(skillRoot);
  assert.deepEqual(
    skillFiles.map((path) => path.slice(base.length + 1)).sort(),
    runtimeFiles.filter((path) => path.startsWith("skills/")),
    "Skill files must match the runtime allowlist",
  );
  const skillBytes = skillFiles.reduce((total, path) => total + lstatSync(path).size, 0);
  assert.ok(skillBytes <= skillLimit, `Runtime skill is ${skillBytes} bytes; internal cap is ${skillLimit}`);
  const skill = readFileSync(join(skillRoot, "SKILL.md"), "utf8");
  const frontmatter = skill.match(/^---\nname: ([^\n]+)\ndescription: ([^\n]+)\n---\n([\s\S]+)$/);
  assert.ok(frontmatter, "Expected name, description, and body in SKILL.md");
  assert.equal(frontmatter[1], "dreambase-mcp");
  assert.ok(frontmatter[2].length <= 1024, "Skill description exceeds 1024 characters");
  // Resolve links across the entrypoint and references, including sibling links.
  for (const path of skillFiles.filter((path) => path.endsWith(".md"))) {
    for (const [, link] of readFileSync(path, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
      if (/^https?:\/\//.test(link) || link.startsWith("#")) continue;
      const target = resolve(dirname(path), link.split("#")[0]);
      assert.ok(target.startsWith(skillRoot + "/"), `Link escapes skill: ${link}`);
      assert.ok(existsSync(target), `Broken resource link: ${link}`);
    }
  }
  const iface = manifest.extensions["com.openai"].interface;
  for (const [field, max] of [["displayName", 30], ["shortDescription", 30], ["longDescription", 4000], ["developerName", 80]]) {
    assert.equal(typeof iface[field], "string", `Missing ${field}`);
    assert.ok(iface[field].trim() && iface[field].length <= max, `Invalid ${field}`);
  }
  assert.equal(iface.category, "Productivity");
  for (const field of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    assert.ok(iface[field].length <= 1024 && new URL(iface[field]).protocol === "https:", `Invalid ${field}`);
  }
  assert.ok(!("brandColor" in iface), "Optional brand color is deliberately omitted");
  assert.ok(iface.defaultPrompt.length <= 3);
  assert.equal(new Set(iface.defaultPrompt).size, iface.defaultPrompt.length);
  for (const prompt of iface.defaultPrompt) assert.ok(prompt.length <= 128 && !/[\n@]/.test(prompt));
  for (const field of ["logo", "composerIcon"]) assert.ok(runtimeFiles.includes(iface[field].replace(/^\.\//, "")));
  const logo = readFileSync(join(base, "assets/logo.png"));
  assert.equal(logo.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  const width = logo.readUInt32BE(16);
  const height = logo.readUInt32BE(20);
  assert.ok(width === height && width >= 48 && width <= 4096, "Invalid logo dimensions");
  const readme = readFileSync(join(base, "README.md"), "utf8").replace(/```[\s\S]*?```/g, "");
  assert.ok(readme.split(/\s+/).length >= 40, "Anthropic requires at least 40 README words outside code blocks");
  const cases = readJson("tests/submission-cases.json", base);
  assert.equal(cases.positive.length, 5);
  assert.equal(cases.negative.length, 3);
  for (const [kind, entries] of Object.entries(cases)) {
    for (const entry of entries) {
      for (const field of ["description", "prompt", "expected_behavior"]) assert.ok(entry[field]?.trim(), `Missing case ${field}`);
      if (kind === "positive") assert.ok(entry.tools_triggered?.trim());
    }
  }
  const review = manifest.extensions["com.openai"].review;
  assert.deepEqual(review.test_cases, cases, "Submission cases must be imported in the manifest");
  assert.ok(!review.test_credentials && !review.reviewer_instructions, "Credentials belong only in the secure portal");
  if (review.demo_recording_url) assert.equal(new URL(review.demo_recording_url).protocol, "https:");
  return { skillBytes, runtimeFileCount: runtimeFiles.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validate();
  console.log(`Validated ${result.runtimeFileCount} runtime files; skill ${result.skillBytes}/${skillLimit} bytes.`);
}
