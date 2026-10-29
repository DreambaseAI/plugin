import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { generatedFiles, readJson } from "./lib.mjs";

/** Validate the supported OpenAI profile before projecting the portable core. */
export function portableMcpCore(config, manifest = readJson("plugin.json")) {
  const expected = generatedFiles(manifest)["mcp.json"];
  // Reject unknown or missing vendor fields instead of silently stripping them.
  assert.deepEqual(config, expected, "MCP configuration differs from the supported OpenAI profile");
  const core = structuredClone(config);
  for (const server of Object.values(core.mcpServers)) delete server.extensions;
  return core;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(portableMcpCore(readJson("mcp.json")), null, 2));
}
