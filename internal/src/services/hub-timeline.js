import { query } from "../lib/db.js";
import { invalidateUserBffCache } from "../lib/cache.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** @type {Record<string, { title: string; product?: string }>} */
const TIMELINE_EVENT_META = {
  "stream.started": { title: "Directo iniciado", product: "streamautomator" },
  "stream.scheduled": { title: "Contenido programado", product: "streamautomator" },
  "stream.ended": { title: "Directo finalizado", product: "streamautomator" },
  "stream.published": { title: "Publicación enviada", product: "streamautomator" },
  "stream.director.started": { title: "Modo Director iniciado", product: "streamautomator" },
  "stream.director.ended": { title: "Modo Director finalizado", product: "streamautomator" },
  "stream.automation.changed": { title: "Automatización actualizada", product: "streamautomator" },
  "stream.automation.deleted": { title: "Automatización eliminada", product: "streamautomator" },
  "order.created": { title: "Nuevo pedido", product: "core" },
  "order.pending": { title: "Pedido pendiente", product: "core" },
  "order.completed": { title: "Pedido completado", product: "core" },
  "sale.completed": { title: "Venta registrada", product: "core" },
  "stock.low": { title: "Stock bajo", product: "core" },
  "appointment.created": { title: "Cita programada", product: "core" },
  "lifeflow.score_updated": { title: "LifeFlow Score actualizado", product: "lifeflow" },
  "invoice.created": { title: "Factura creada", product: "core" },
  "community.member_joined": { title: "Nuevo miembro en comunidad", product: "akoenet" },
};

const TIMELINE_PREFIXES = ["stream.", "order.", "sale.", "stock.", "appointment.", "lifeflow.", "invoice.", "community."];

function resolveTimelineTitle(eventType, payload = {}) {
  const meta = TIMELINE_EVENT_META[eventType];
  if (meta?.title) return meta.title;
  if (payload.title && typeof payload.title === "string") return payload.title.slice(0, 200);
  if (payload.label && typeof payload.label === "string") return payload.label.slice(0, 200);
  if (payload.name && typeof payload.name === "string") return payload.name.slice(0, 200);
  return eventType.replace(/\./g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function shouldRecordTimeline(eventType) {
  if (!eventType || typeof eventType !== "string") return false;
  if (TIMELINE_EVENT_META[eventType]) return true;
  return TIMELINE_PREFIXES.some((prefix) => eventType.startsWith(prefix));
}

async function resolvePlatformUserId(platformEvt = {}) {
  const candidates = [
    platformEvt.userId,
    platformEvt.payload?.userId,
    platformEvt.payload?.user_id,
    platformEvt.payload?.platformUserId,
  ];
  for (const candidate of candidates) {
    if (candidate && UUID_RE.test(String(candidate))) return String(candidate);
  }

  const legacyId = platformEvt.payload?.legacyUserId ?? platformEvt.payload?.userId;
  if (legacyId == null || legacyId === "") return null;
  if (UUID_RE.test(String(legacyId))) return String(legacyId);

  try {
    const { rows } = await query(
      `SELECT user_id::text AS user_id
       FROM dakinis_auth.legacy_id_map
       WHERE legacy_schema = 'stream'
         AND legacy_table = 'Users'
         AND legacy_id = $1::bigint
       LIMIT 1`,
      [Number(legacyId)]
    );
    return rows[0]?.user_id || null;
  } catch {
    return null;
  }
}

/**
 * Persist platform event into hub.timeline for Mi día widgets and ActivityTimeline.
 * @param {{ event?: string; payload?: object; userId?: string; tenantId?: string; at?: string; source?: string }} platformEvt
 */
export async function recordHubTimelineFromPlatformEvent(platformEvt = {}) {
  const eventType = String(platformEvt.event || "").trim();
  if (!shouldRecordTimeline(eventType)) return { skipped: true, reason: "not_timeline_event" };

  const userId = await resolvePlatformUserId(platformEvt);
  if (!userId) return { skipped: true, reason: "no_user_id" };

  const title = resolveTimelineTitle(eventType, platformEvt.payload || {});
  const payload = {
    ...(platformEvt.payload && typeof platformEvt.payload === "object" ? platformEvt.payload : {}),
    source: platformEvt.source || "platform-event",
    product: TIMELINE_EVENT_META[eventType]?.product || null,
  };

  try {
    await query(
      `INSERT INTO hub.timeline (user_id, tenant_id, event_type, title, payload, occurred_at)
       VALUES ($1::uuid, $2::uuid, $3, $4, $5::jsonb, coalesce($6::timestamptz, now()))`,
      [
        userId,
        platformEvt.tenantId || null,
        eventType,
        title,
        JSON.stringify(payload),
        platformEvt.at || null,
      ]
    );
    await invalidateUserBffCache(String(userId));
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("does not exist") || message.includes("relation")) {
      return { skipped: true, reason: "hub_schema_missing" };
    }
    console.warn("[internal] hub timeline write:", message);
    return { skipped: true, reason: "write_failed", error: message };
  }
}
