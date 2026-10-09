import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { archiveLimit, root, runtimeFiles } from "./lib.mjs";
import { validate } from "./validate.mjs";

const result = validate();
const artifact = join(root, "dist/dreambase");
const archive = join(root, "dist/dreambase-plugin.zip");
rmSync(join(root, "dist"), { recursive: true, force: true });
mkdirSync(artifact, { recursive: true });
for (const path of runtimeFiles) {
  mkdirSync(dirname(join(artifact, path)), { recursive: true });
  cpSync(join(root, path), join(artifact, path));
}
// Fixed allowlist, sorted paths, and no directory entries or OS extra fields.
execFileSync("zip", ["-X", "-q", archive, ...runtimeFiles], { cwd: artifact });
const archiveBytes = statSync(archive).size;
if (archiveBytes > archiveLimit) {
  rmSync(archive);
  throw new Error(`ZIP is ${archiveBytes} bytes; internal cap is ${archiveLimit}`);
}
const report = { ...result, archiveBytes, skillLimitBytes: 65536, archiveLimitBytes: archiveLimit, files: runtimeFiles };
writeFileSync(join(root, "dist/package-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`Built ${archive}: ${archiveBytes}/${archiveLimit} bytes.`);
