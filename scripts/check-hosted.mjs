#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function hostedOrigin(input) {
  const url = new URL(input);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("Use one HTTPS deployment origin, without credentials, path, query or fragment (HTTP loopback is allowed).");
  }
  return url.origin;
}

export async function checkHosted(input, fetcher = fetch) {
  const origin = hostedOrigin(input);
  const config = JSON.parse(readFileSync(new URL("../mcp.json", import.meta.url), "utf8"));
  const server = Object.values(config.mcpServers)[0];
  const scopes = server.extensions["com.openai"].auth.defaultScopes;
  const checks = [];
  async function check(name, run) {
    try { await run(); checks.push({ name, ok: true }); }
    catch (error) { checks.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) }); }
  }
  const get = (url, options) => fetcher(url, { ...options, signal: AbortSignal.timeout(15000) });
  await Promise.all([
    "https://dreambase.com", "https://dreambase.com/legal/privacy", "https://dreambase.com/legal/terms", "https://github.com/DreambaseAI/plugin/issues",
  ].map(url => check(url, async () => { const r = await get(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); })));
  await check("protected-resource identity and scopes", async () => {
    const r = await get(`${origin}/.well-known/oauth-protected-resource/mcp`);
    const value = await r.json();
    if (!r.ok || value.resource !== `${origin}/mcp` || !value.authorization_servers?.includes(origin)) throw new Error("Resource or authorization server differs from the selected deployment.");
    if (scopes.some(scope => !value.scopes_supported?.includes(scope))) throw new Error("Protected resource is missing a required plugin scope.");
  });
  await check("OAuth metadata, endpoints and scopes", async () => {
    const r = await get(`${origin}/.well-known/oauth-authorization-server`);
    const value = await r.json();
    if (!r.ok || value.issuer !== origin) throw new Error("OAuth issuer differs from selected deployment.");
    for (const [key, path] of Object.entries({ authorization_endpoint: "/oauth/authorize", token_endpoint: "/oauth/token", registration_endpoint: "/oauth/register", jwks_uri: "/.well-known/jwks.json" })) {
      if (value[key] !== origin + path) throw new Error(`${key} points at another deployment.`);
    }
    if (!value.code_challenge_methods_supported?.includes("S256") || !value.grant_types_supported?.includes("authorization_code") || scopes.some(scope => !value.scopes_supported?.includes(scope))) throw new Error("OAuth capabilities/scopes are incomplete.");
  });
  await check("public signing keys", async () => {
    const r = await get(`${origin}/.well-known/jwks.json`); const value = await r.json();
    if (!r.ok || !value.keys?.length || value.keys.some(key => key.d !== undefined || key.k !== undefined)) throw new Error("Missing public-only signing keys.");
  });
  await check("unauthenticated MCP challenge", async () => {
    const r = await get(`${origin}/mcp`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "dreambase-release-check", version: "1.0.0" } } }) });
    if (r.status !== 401 || !r.headers.get("www-authenticate")?.includes(`resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"`)) throw new Error("MCP challenge does not identify this deployment.");
  });
  return { origin, checks, ok: checks.every(check => check.ok) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flag = process.argv.indexOf("--origin");
  if (flag < 0 || !process.argv[flag + 1]) { console.error("Usage: npm run check:hosted -- --origin https://selected-deployment.example"); process.exitCode = 1; }
  else {
    try {
      const result = await checkHosted(process.argv[flag + 1]);
      console.log(`Checked deployment: ${result.origin}`);
      for (const check of result.checks) console.log(`${check.ok ? "✓" : "✗"} ${check.name}${check.error ? ": " + check.error : ""}`);
      process.exitCode = result.ok ? 0 : 1;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
