// Publisher-side helper for the npm plugins CLI. It is excluded from the
// plugin runtime archive. Use the returned source throughout add/discover.
export function normalizePluginSource(source) {
  if (typeof source !== "string") return source;
  let identity;
  const shorthand = source.match(/^([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/);
  const ssh = source.match(/^git@github\.com:([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i);
  if (shorthand) identity = shorthand[1];
  else if (ssh) identity = ssh[1];
  else if (/^https:\/\//i.test(source)) {
    try {
      const url = new URL(source);
      if (url.hostname !== "github.com" || url.port || url.username || url.password || url.search || url.hash) return source;
      const path = url.pathname.match(/^\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/);
      if (path) identity = path[1];
    } catch {
      return source;
    }
  }
  return ["dreambase/plugin", "dreambaseai/skills", "dreambaseai/plugin"].includes(identity?.toLowerCase())
    ? "DreambaseAI/plugin"
    : source;
}
