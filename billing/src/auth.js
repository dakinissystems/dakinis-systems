import { config } from "./config.js";

/**
 * @param {import("node:http").IncomingMessage} req
 * @param {{ required?: boolean }} [opts]
 */
export function requireInternalAuth(req, opts = {}) {
  if (!config.internalApiKey) {
    if (opts.required) {
      return { ok: false, status: 503, error: "internal_auth_not_configured" };
    }
    return { ok: true, skipped: true };
  }

  const header = req.headers["x-internal-api-key"] || req.headers["authorization"];
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7)
      : header;

  if (token !== config.internalApiKey) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  return { ok: true };
}
