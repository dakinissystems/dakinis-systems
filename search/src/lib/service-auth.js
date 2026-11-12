import { timingSafeEqual } from "node:crypto";

function configuredKeys() {
  const primary = process.env.DAKINIS_INTERNAL_SERVICE_KEY || process.env.DAKINIS_INTERNAL_API_KEY || "";
  const previous =
    process.env.DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS || process.env.DAKINIS_INTERNAL_API_KEY_PREVIOUS || "";
  const keys = [];
  for (const raw of [primary, previous]) {
    for (const part of String(raw).split(",")) {
      const key = part.trim();
      if (key && !keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

function deployed() {
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  return env === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
}

function sameSecret(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** La clave de servicio no es un permiso de usuario. En Railway, sin clave, no arranca la ruta de datos. */
export function requireServiceAuth(req) {
  const keys = configuredKeys();
  if (!keys.length) {
    if (!deployed()) return { ok: true, dev: true };
    return { ok: false, status: 503, body: { error: "service_auth_not_configured" } };
  }
  const auth = String(req.headers.authorization || "");
  const header = req.headers["x-internal-api-key"];
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const token = bearer || (typeof header === "string" ? header.trim() : "");
  if (!token || !keys.some((key) => sameSecret(key, token))) {
    return { ok: false, status: 401, body: { error: "unauthorized" } };
  }
  return { ok: true };
}
