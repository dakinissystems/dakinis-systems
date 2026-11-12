import { requireActor } from "./actor.js";

function deployed() {
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  return env === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
}

/**
 * El tenant de una consulta privada sale del JWT. La query no lo elige.
 * @param {import("node:http").IncomingMessage} req
 * @param {string | null} asked
 */
export function tenantForSearch(req, asked) {
  const secret = String(process.env.JWT_SECRET || process.env.DAKINIS_JWT_SECRET || "").trim();
  const raw = req.headers["x-dakinis-actor"];
  const token = typeof raw === "string" ? raw.trim() : "";
  if (!secret) {
    if (!deployed()) return { ok: true, tenant: asked ? String(asked) : null, dev: true };
    if (token) return { ok: false, status: 503, body: { error: "actor_auth_not_configured" } };
    return { ok: true, tenant: null };
  }
  if (!token) return { ok: true, tenant: null };
  const actor = requireActor(req);
  if (!actor.ok) return { ok: false, status: actor.status, body: actor.body };
  const wanted = String(asked || "").trim();
  if (wanted && actor.tenant && wanted.toLowerCase() !== actor.tenant.toLowerCase()) {
    return { ok: false, status: 403, body: { error: "forbidden" } };
  }
  return { ok: true, tenant: actor.tenant || null };
}
