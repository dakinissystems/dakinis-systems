import { query, notificationsDbEnabled } from "./db.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return UUID_RE.test(String(value || "").trim());
}

function resolveTitle(type, payload) {
  const title = payload?.title || payload?.subject;
  if (title) return String(title).slice(0, 500);
  return String(type || "Notificación").slice(0, 500);
}

function resolveContent(type, payload) {
  const content = payload?.message || payload?.body || payload?.text;
  if (content) return String(content).slice(0, 4000);
  if (payload && typeof payload === "object" && Object.keys(payload).length) {
    return JSON.stringify(payload).slice(0, 4000);
  }
  return String(type || "notification").slice(0, 4000);
}

function resolveProduct(payload) {
  const product = payload?.product || payload?.sourceProduct || payload?.source_product;
  return product ? String(product).slice(0, 64) : null;
}

function formatRelativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 48) return `hace ${diffH} h`;
  return new Date(iso).toLocaleDateString("es-ES");
}

function mapInboxRow(row) {
  const meta = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  return {
    id: row.id,
    product: row.source_product || meta.product || "hub",
    message: row.content,
    title: row.title,
    time: formatRelativeTime(row.created_at),
    read: Boolean(row.read),
    type: meta.type || null,
    createdAt: row.created_at,
  };
}

/**
 * @param {{ id?: string; userId: string; tenantId?: string; type?: string; channel?: string; payload?: object }} job
 */
export async function persistInAppNotification(job) {
  if (!notificationsDbEnabled()) {
    return { persisted: false, reason: "no_database_url" };
  }
  const userId = String(job.userId || "").trim();
  if (!isUuid(userId)) {
    return { persisted: false, reason: "invalid_user_id" };
  }

  const payload = job.payload && typeof job.payload === "object" ? job.payload : {};
  const title = resolveTitle(job.type, payload);
  const content = resolveContent(job.type, payload);
  const sourceProduct = resolveProduct(payload);
  const metadata = {
    type: job.type || null,
    channel: job.channel || "in-app",
    ...payload,
  };
  const tenantId = job.tenantId && isUuid(job.tenantId) ? job.tenantId : null;

  let res;
  if (job.id && isUuid(job.id)) {
    res = await query(
      `INSERT INTO hub.notifications (id, user_id, tenant_id, title, content, source_product, metadata)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7::jsonb)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [job.id, userId, tenantId, title, content, sourceProduct, JSON.stringify(metadata)]
    );
  } else {
    res = await query(
      `INSERT INTO hub.notifications (user_id, tenant_id, title, content, source_product, metadata)
       VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::jsonb)
       RETURNING id`,
      [userId, tenantId, title, content, sourceProduct, JSON.stringify(metadata)]
    );
  }

  const id = res.rows[0]?.id;
  return { persisted: Boolean(id), id: id || job.id || null };
}

/** @param {string} userId @param {number} [limit=50] */
export async function listInbox(userId, limit = 50) {
  if (!notificationsDbEnabled()) {
    return { items: [], unread: 0, stub: true, reason: "no_database_url" };
  }
  if (!isUuid(userId)) {
    return { items: [], unread: 0, stub: false, error: "invalid_user_id" };
  }

  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const itemsRes = await query(
    `SELECT n.id, n.title, n.content, n.source_product, n.metadata, n.created_at,
            EXISTS (
              SELECT 1 FROM hub.notification_reads r
              WHERE r.notification_id = n.id AND r.user_id = $1::uuid
            ) AS read
     FROM hub.notifications n
     WHERE n.user_id = $1::uuid AND n.deleted_at IS NULL
     ORDER BY n.created_at DESC
     LIMIT $2`,
    [userId, safeLimit]
  );

  const unreadRes = await query(`SELECT hub.v1_get_unread_count($1::uuid) AS unread`, [userId]);
  const unread = Number(unreadRes.rows[0]?.unread || 0);

  return {
    items: itemsRes.rows.map(mapInboxRow),
    unread,
    stub: false,
  };
}

/** @param {string} notificationId @param {string} userId */
export async function markNotificationRead(notificationId, userId) {
  if (!notificationsDbEnabled()) {
    return { ok: false, reason: "no_database_url" };
  }
  if (!isUuid(notificationId) || !isUuid(userId)) {
    return { ok: false, reason: "invalid_id" };
  }

  await query(
    `INSERT INTO hub.notification_reads (notification_id, user_id)
     VALUES ($1::uuid, $2::uuid)
     ON CONFLICT (notification_id, user_id) DO NOTHING`,
    [notificationId, userId]
  );

  return { ok: true, notificationId, userId };
}
