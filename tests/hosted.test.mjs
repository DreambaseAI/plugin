import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkHosted, hostedOrigin } from "../scripts/check-hosted.mjs";
const origin = "https://preview.example";
const scopes = Object.values(JSON.parse(readFileSync(new URL("../mcp.json", import.meta.url))).mcpServers)[0].extensions["com.openai"].auth.defaultScopes;
function mockFetch(overrides = {}) {
  return async url => {
    const path = new URL(url).pathname;
    if (path === "/.well-known/oauth-protected-resource/mcp") return Response.json({ resource: `${origin}/mcp`, authorization_servers: [origin], scopes_supported: scopes, ...overrides });
    if (path === "/.well-known/oauth-authorization-server") return Response.json({ issuer: origin, authorization_endpoint: origin + "/oauth/authorize", token_endpoint: origin + "/oauth/token", registration_endpoint: origin + "/oauth/register", jwks_uri: origin + "/.well-known/jwks.json", scopes_supported: scopes, code_challenge_methods_supported: ["S256"], grant_types_supported: ["authorization_code"] });
    if (path === "/.well-known/jwks.json") return Response.json({ keys: [{ kty: "EC", x: "public", y: "public" }] });
    if (path === "/mcp") return new Response("", { status: 401, headers: { "www-authenticate": `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"` } });
    return new Response("ok");
  };
}
test("hosted checks target the selected preview and all declared scopes", async () => {
  assert.equal((await checkHosted(origin, mockFetch())).ok, true);
  assert.equal((await checkHosted(origin, mockFetch({ resource: "https://dev.example/mcp" }))).ok, false);
  assert.equal((await checkHosted(origin, mockFetch({ scopes_supported: ["account"] }))).ok, false);
});
test("hosted origin cannot contain credentials, paths or unsafe schemes", () => {
  for (const value of ["http://remote.example", "https://user:pass@preview.example", "https://preview.example/mcp", "https://preview.example/?token=x", "https://preview.example/#x"]) assert.throws(() => hostedOrigin(value));
  assert.equal(hostedOrigin("http://localhost:5130"), "http://localhost:5130");
});
