import { timingSafeEqual } from "node:crypto";
import { collectServiceKeys, isProductionRuntime } from "./service-auth-keys.js";

function configuredMemberKey() {
  const expected = String(process.env.AKOENET_MEMBER_KEY || "").trim();
  if (!expected) return "";
  const serviceKeys = collectServiceKeys(
    process.env.DAKINIS_INTERNAL_SERVICE_KEY || process.env.DAKINIS_INTERNAL_API_KEY,
    process.env.DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS || process.env.DAKINIS_INTERNAL_API_KEY_PREVIOUS
  );
  if (serviceKeys.includes(expected)) return "";
  return expected;
}

/**
 * Sin JWT, nombrar un miembro de AkoeNet no vale con la clave de servicio compartida.
 * @param {import("node:http").IncomingMessage} req
 */
export function akoenetMemberFallback(req) {
  const expected = configuredMemberKey();
  if (!expected) {
    if (isProductionRuntime()) {
      return { ok: false, status: 503, body: { error: "akoenet_member_key_not_configured" } };
    }
    return { ok: true };
  }
  const raw = req.headers["x-dakinis-akoenet-member"];
  const given = typeof raw === "string" ? raw.trim() : "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, status: 401, body: { error: "actor_required" } };
  }
  return { ok: true };
}
