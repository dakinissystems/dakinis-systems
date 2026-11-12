import { timingSafeEqual } from "node:crypto";
import { collectServiceKeys, isProductionRuntime } from "./service-auth-keys.js";

function configuredWorkerKey() {
  const expected = String(process.env.DAKINIS_WORKER_KEY || "").trim();
  if (!expected) return "";
  const serviceKeys = collectServiceKeys(
    process.env.DAKINIS_INTERNAL_SERVICE_KEY || process.env.DAKINIS_INTERNAL_API_KEY,
    process.env.DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS || process.env.DAKINIS_INTERNAL_API_KEY_PREVIOUS
  );
  if (serviceKeys.includes(expected)) return "";
  return expected;
}

/**
 * Sin JWT, publicar en el bus no vale con la clave de servicio compartida.
 * @param {import("node:http").IncomingMessage} req
 */
export function workerPublishFallback(req) {
  const expected = configuredWorkerKey();
  if (!expected) {
    if (isProductionRuntime()) {
      return { ok: false, status: 503, body: { error: "worker_key_not_configured" } };
    }
    return { ok: true, dev: true };
  }
  const raw = req.headers["x-dakinis-worker"];
  const given = typeof raw === "string" ? raw.trim() : "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, status: 401, body: { error: "worker_required" } };
  }
  return { ok: true, dev: false };
}

/** Sin JWT, el evento no puede nombrar una persona ni un tenant. */
export function eventClaimsIdentity(body) {
  const payload = body?.payload && typeof body.payload === "object" ? body.payload : {};
  return [body?.userId, body?.tenantId, body?.businessId, payload.userId, payload.user_id, payload.platformUserId].some(
    (value) => String(value || "").trim()
  );
}
