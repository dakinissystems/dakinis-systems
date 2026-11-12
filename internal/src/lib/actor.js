import { createHmac, timingSafeEqual } from "node:crypto";

function deployed() {
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  return env === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
}

function strictClaims() {
  const flag = String(process.env.JWT_STRICT_ISS_AUD || "").toLowerCase();
  if (flag === "false") return false;
  if (flag === "true") return true;
  return deployed();
}

function decodePart(part) {
  const pad = part.length % 4 === 0 ? "" : "=".repeat(4 - (part.length % 4));
  return Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function verifyHs256(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  let header;
  try {
    header = JSON.parse(decodePart(parts[0]).toString("utf8"));
  } catch {
    return null;
  }
  if (header?.alg !== "HS256") return null;
  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest();
  const given = decodePart(parts[2]);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    return JSON.parse(decodePart(parts[1]).toString("utf8"));
  } catch {
    return null;
  }
}

function claimMatches(value, expected) {
  if (Array.isArray(value)) return value.includes(expected);
  return value === expected;
}

/**
 * La clave de servicio no identifica a la persona. El sub del JWT tiene que ser el userId de la ruta.
 * @param {import("node:http").IncomingMessage} req
 * @param {string} userId
 */
export function requireActor(req, userId) {
  const secret = String(process.env.JWT_SECRET || process.env.DAKINIS_JWT_SECRET || "").trim();
  const expected = userId == null ? null : String(userId).trim();
  if (!secret) {
    if (!deployed()) return { ok: true, dev: true };
    return { ok: false, status: 503, body: { error: "actor_auth_not_configured" } };
  }
  if (expected === "") return { ok: false, status: 400, body: { error: "validation", message: "userId required" } };

  const raw = req.headers["x-dakinis-actor"];
  const token = typeof raw === "string" ? raw.trim() : "";
  if (!token) return { ok: false, status: 401, body: { error: "actor_required" } };

  const payload = verifyHs256(token, secret);
  if (!payload) return { ok: false, status: 401, body: { error: "actor_invalid" } };
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || now >= payload.exp) {
    return { ok: false, status: 401, body: { error: "actor_invalid" } };
  }
  if (typeof payload.nbf === "number" && now < payload.nbf) {
    return { ok: false, status: 401, body: { error: "actor_invalid" } };
  }
  if (strictClaims()) {
    const issuer = process.env.JWT_ISSUER || "platform-auth";
    const audience = process.env.JWT_AUDIENCE || "dakinis-platform";
    if (!claimMatches(payload.iss, issuer) || !claimMatches(payload.aud, audience)) {
      return { ok: false, status: 401, body: { error: "actor_invalid" } };
    }
  }
  const sub = typeof payload.sub === "string" ? payload.sub.trim() : "";
  if (!sub) return { ok: false, status: 401, body: { error: "actor_invalid" } };
  if (expected != null && sub.toLowerCase() !== expected.toLowerCase()) {
    return { ok: false, status: 403, body: { error: "forbidden" } };
  }
  const tenantClaim = payload.tenant || payload.tenantId;
  const tenant = typeof tenantClaim === "string" ? tenantClaim.trim() : "";
  return { ok: true, sub, tenant: tenant || null };
}
