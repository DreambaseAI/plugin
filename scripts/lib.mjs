import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const endpoint = "https://app.dreambase.com/mcp";
export const skillLimit = 64 * 1024;
export const archiveLimit = 256 * 1024;
export const runtimeFiles = [
  "plugin.json",
  "mcp.json",
  ".mcp.json",
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/plugin.json",
  ".cursor-plugin/marketplace.json",
  ".codex-plugin/plugin.json",
  ".agents/plugins/marketplace.json",
  "skills/dreambase-mcp/SKILL.md",
  "skills/dreambase-mcp/agents/openai.yaml",
  "skills/dreambase-mcp/references/connectors.md",
  "skills/dreambase-mcp/references/data-workflows.md",
  "skills/dreambase-mcp/references/dataset-lifecycle.md",
  "skills/dreambase-mcp/references/operations.md",
  "assets/logo.png",
  "README.md",
  "LICENSE",
].sort();

export function readJson(path, base = root) {
  return JSON.parse(readFileSync(resolve(base, path), "utf8"));
}

export function generatedFiles(manifest) {
  const { $schema, extensions, ...identity } = manifest;
  const openai = extensions["com.openai"];
  const common = { ...identity };
  const marketplace = {
    name: "dreambase",
    owner: { name: "Dreambase", url: "https://github.com/DreambaseAI" },
    metadata: { version: manifest.version, description: manifest.description },
    plugins: [{ name: manifest.name, source: "./", version: manifest.version }],
  };
  return {
    ".claude-plugin/plugin.json": {
      ...common,
      displayName: openai.interface.displayName,
      icon: "./assets/logo.png",
      documentationUrl: "https://github.com/DreambaseAI/plugin#readme",
      supportUrl: openai.interface.supportURL,
      privacyPolicyUrl: openai.interface.privacyPolicyURL,
      termsOfServiceUrl: openai.interface.termsOfServiceURL,
      mcpServers: "./.mcp.json",
    },
    ".claude-plugin/marketplace.json": marketplace,
    ".cursor-plugin/plugin.json": {
      ...common,
      displayName: openai.interface.displayName,
      logo: "assets/logo.png",
      skills: "./skills/",
      mcpServers: "./.mcp.json",
    },
    ".cursor-plugin/marketplace.json": marketplace,
    ".codex-plugin/plugin.json": {
      ...common,
      skills: "./skills/",
      mcpServers: "./.mcp.json",
      interface: openai.interface,
      extensions: { "com.openai": openai },
    },
    ".agents/plugins/marketplace.json": {
      name: "dreambase",
      interface: { displayName: "Dreambase" },
      plugins: [{
        name: manifest.name,
        source: { source: "local", path: "./" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: openai.interface.category,
      }],
    },
    "mcp.json": {
      $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
      mcpServers: { dreambase: { type: "streamable-http", url: endpoint } },
    },
    ".mcp.json": {
      mcpServers: { dreambase: { type: "http", url: endpoint } },
    },
  };
}
