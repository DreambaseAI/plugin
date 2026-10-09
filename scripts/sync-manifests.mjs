import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { generatedFiles, readJson, root } from "./lib.mjs";

for (const [path, value] of Object.entries(generatedFiles(readJson("plugin.json")))) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(value, null, 2) + "\n");
}
console.log("Synchronized compatibility manifests and MCP configurations.");
