import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** tools/dakinis-mcp → monorepo root */
const REPO_ROOT = path.resolve(__dirname, "../../..");

function env(name, fallback = "") {
  const v = process.env[name];
  return v == null || v === "" ? fallback : String(v).trim();
}

function normalizeBase(url) {
  if (!url) return "";
  return url.replace(/\/$/, "");
}

/**
 * Service endpoints probed by `platform_health`.
 * Override any URL via env; empty = skip that probe.
 */
export const config = {
  internalUrl: normalizeBase(env("DAKINIS_INTERNAL_URL", "http://127.0.0.1:3100")),
  serviceToken: env("DAKINIS_SERVICE_TOKEN") || env("INTERNAL_SERVICE_KEY") || "",
  docsRoot: path.resolve(env("DAKINIS_DOCS_ROOT", path.join(REPO_ROOT, "docs"))),
  requestTimeoutMs: Number(env("DAKINIS_MCP_TIMEOUT_MS", "8000")) || 8000,
  services: {
    internal: normalizeBase(env("DAKINIS_INTERNAL_URL", "http://127.0.0.1:3100")),
    hub: normalizeBase(env("DAKINIS_HUB_URL")),
    core: normalizeBase(env("DAKINIS_CORE_URL")),
    billing: normalizeBase(env("DAKINIS_BILLING_URL")),
    search: normalizeBase(env("DAKINIS_SEARCH_URL")),
    notifications: normalizeBase(env("DAKINIS_NOTIFICATIONS_URL")),
    knowledge: normalizeBase(env("DAKINIS_KNOWLEDGE_URL")),
    akoenet: normalizeBase(env("DAKINIS_AKOENET_URL")),
    streamautomator: normalizeBase(env("DAKINIS_STREAMAUTOMATOR_URL")),
    landing: normalizeBase(env("DAKINIS_LANDING_URL")),
  },
};

export function serviceAuthHeaders() {
  if (!config.serviceToken) return {};
  return {
    Authorization: `Bearer ${config.serviceToken}`,
    "X-Internal-Api-Key": config.serviceToken,
  };
}
