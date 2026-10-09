import assert from "node:assert/strict";
import test from "node:test";
import { normalizePluginSource } from "../integrations/plugins/source-alias.mjs";

test("Dreambase aliases normalize for every supported GitHub source form", () => {
  for (const identity of ["dreambase/plugin", "DreambaseAI/skills", "DreambaseAI/plugin", "DREAMBASEAI/SKILLS"]) {
    for (const source of [identity, `${identity}.git`, `https://github.com/${identity}`, `https://github.com/${identity}.git/`, `git@github.com:${identity}.git`]) {
      assert.equal(normalizePluginSource(source), "DreambaseAI/plugin", source);
    }
  }
});

test("unrelated repositories and local paths retain their meaning", () => {
  for (const source of [
    "vercel/vercel-plugin", "dreambase/plugin-tools", "./dreambase/plugin", "/tmp/dreambase/plugin",
    "https://gitlab.com/dreambase/plugin", "https://github.com/dreambase/plugin/tree/main",
    "https://github.com/dreambase/plugin?ref=other", "git@other.example:dreambase/plugin.git",
    "https://user:password@github.com/dreambase/plugin", "https://github.com:8443/dreambase/plugin",
  ]) assert.equal(normalizePluginSource(source), source);
});
