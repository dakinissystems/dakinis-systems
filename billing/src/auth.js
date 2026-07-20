import { config } from "./config.js";

/**
 * @param {string | undefined | null} primary
 * @param {string | undefined | null} previous
 * @returns {string[]}
 */
function collectKeys(primary, previous) {
  const keys = [];
  for (const raw of [primary, previous]) {
    if (!raw) continue;
    for (const part of String(raw).split(",")) {
      const k = part.trim();
      if (k && !keys.includes(k)) keys.push(k);
    }
  }
  return keys;
}

function isProductionRuntime() {
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  const railway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
  return env === "production" || railway;
}

/**
 * @param {import("node:http").IncomingMessage} req
 * @param {{ required?: boolean }} [opts]
 */
export function requireInternalAuth(req, opts = {}) {
  const keys = collectKeys(
    config.internalApiKey,
    process.env.DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS ||
      process.env.INTERNAL_API_KEY_PREVIOUS ||
      ""
  );

  if (!keys.length) {
    if (opts.required || isProductionRuntime()) {
      return { ok: false, status: 503, error: "internal_auth_not_configured" };
    }
    return { ok: true, skipped: true };
  }

  const header = req.headers["x-internal-api-key"] || req.headers["authorization"];
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : typeof header === "string"
        ? header.trim()
        : "";

  if (!token || !keys.includes(token)) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  return { ok: true };
}
