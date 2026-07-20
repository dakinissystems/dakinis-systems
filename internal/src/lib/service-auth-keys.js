/**
 * Local copy of service-key verify (avoids package path coupling in Railway image).
 * Keep in sync with packages/shared-auth/src/service-auth.js
 */

/**
 * @param {string | undefined | null} primary
 * @param {string | undefined | null} previous
 * @returns {string[]}
 */
export function collectServiceKeys(primary, previous) {
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

export function isProductionRuntime() {
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  const railway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
  return env === "production" || railway;
}

/**
 * @param {import("node:http").IncomingMessage} req
 * @param {{ primary?: string; previous?: string; failOpenInDev?: boolean }} [opts]
 */
export function verifyServiceBearer(req, opts = {}) {
  const keys = collectServiceKeys(opts.primary, opts.previous);

  if (!keys.length) {
    if (opts.failOpenInDev !== false && !isProductionRuntime()) {
      return { ok: true, dev: true };
    }
    return {
      ok: false,
      status: 503,
      body: { error: "service_auth_not_configured", message: "Service key required" },
    };
  }

  const auth = String(req.headers.authorization || "");
  const xKey = req.headers["x-internal-api-key"];
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerKey = typeof xKey === "string" ? xKey.trim() : "";
  const token = bearer || headerKey;

  if (!token) {
    return {
      ok: false,
      status: 401,
      body: { error: "unauthorized", message: "Missing service token" },
    };
  }

  const idx = keys.indexOf(token);
  if (idx < 0) {
    return {
      ok: false,
      status: 401,
      body: { error: "unauthorized", message: "Invalid service token" },
    };
  }

  return { ok: true, rotated: idx > 0 };
}
