import { query } from "../lib/db.js";
import { HUB_APPS, HUB_SECTIONS } from "../hub-data.js";
import { buildWidgetValues } from "../hub-widget-values.js";
import { buildRecommendedActions } from "../hub-actions.js";
import {
  fetchUserHubProducts,
  dakinisFilterHubApps,
} from "./hub-product-access.js";
import { listWorkspaceAddonsForUser } from "./workspace-addons.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * @param {string} userId
 */
export function validateUserId(userId) {
  return UUID_RE.test(String(userId || ""));
}

/**
 * @param {string} userId
 */
export async function fetchDashboardFromDb(userId) {
  const { rows } = await query(`SELECT hub.v1_get_dashboard($1::uuid) AS data`, [userId]);
  return rows[0]?.data ?? null;
}

export async function fetchMiDiaEnabled() {
  try {
    const { rows } = await query(
      `SELECT enabled FROM meta.feature_flags WHERE flag_key = 'hub.mi_dia' LIMIT 1`
    );
    return Boolean(rows[0]?.enabled);
  } catch {
    return false;
  }
}

/**
 * @param {string} userId
 * @param {{ db?: object | null; miDiaEnabled?: boolean; notificationsUnread?: number; notificationsItems?: object[] }} [opts]
 */
export function buildHubDashboardResponse(userId, opts = {}) {
  const dbRaw = opts.db;
  const unreadExternal = opts.notificationsUnread;
  const inboxItems = Array.isArray(opts.notificationsItems) ? opts.notificationsItems : [];
  const hubAccess = opts.hubAccess || { products: ["core"], isPlatformAdmin: false };
  const enabledProducts = hubAccess.products || ["core"];
  const db = dbRaw
    ? {
        ...dbRaw,
        unread_notifications: Math.max(
          Number(dbRaw.unread_notifications ?? 0),
          Number(unreadExternal ?? 0)
        ),
      }
    : null;
  const unread = db?.unread_notifications ?? unreadExternal ?? 0;
  const apps = dakinisFilterHubApps(HUB_APPS, enabledProducts);

  const payload = {
    userId,
    miDiaEnabled: opts.miDiaEnabled ?? false,
    landing: opts.miDiaEnabled ? "my-day" : "apps",
    sections: HUB_SECTIONS,
    apps,
    workspaceAddons: opts.workspaceAddons || [],
    workspaceId: opts.workspaceId ?? null,
    enabledProducts,
    isPlatformAdmin: Boolean(hubAccess.isPlatformAdmin),
    db: db ?? null,
    summary: {
      notificationsUnread: Number(unread) || 0,
      scheduledContents: db?.scheduled_contents ?? null,
      streamScheduledWeek: db?.stream_scheduled_week ?? null,
      streamUpcoming: db?.stream_upcoming ?? null,
      lifeflowScore: db?.lifeflow_score ?? null,
      tenantCount: Number(db?.core_tenant_count ?? 0) || (Array.isArray(db?.tenants) ? db.tenants.length : null),
      recentItemsCount: Array.isArray(db?.recent_items) ? db.recent_items.length : 0,
      timelineCount: Array.isArray(db?.timeline) ? db.timeline.length : 0,
      stub: !db,
    },
    widgetValues: buildWidgetValues({ db, summary: { notificationsUnread: unread } }),
    notifications: inboxItems,
  };

  payload.actions = buildRecommendedActions({
    db,
    summary: payload.summary,
    enabledProducts,
  });

  return payload;
}

/**
 * @param {string} userId
 * @param {{ notificationsUnread?: number; notificationsItems?: object[] }} [opts]
 */
export async function getHubDashboard(userId, opts = {}) {
  let db = null;
  let miDiaEnabled = false;
  let hubAccess = { products: ["core"], isPlatformAdmin: false };
  let dbError = null;

  try {
    [db, miDiaEnabled, hubAccess] = await Promise.all([
      fetchDashboardFromDb(userId),
      fetchMiDiaEnabled(),
      fetchUserHubProducts(userId),
    ]);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "db_error";
    if (dbError !== "database_not_configured") {
      console.error("[internal] hub dashboard db:", err);
    }
  }

  let workspaceAddons = [];
  let workspaceId = null;
  try {
    const ws = await listWorkspaceAddonsForUser(userId, {
      isPlatformAdmin: Boolean(hubAccess.isPlatformAdmin),
    });
    workspaceAddons = ws.items.filter((a) => a.enabled);
    workspaceId = ws.workspaceId;
  } catch (err) {
    console.warn("[internal] workspace addons:", err?.message || err);
  }

  const body = buildHubDashboardResponse(userId, {
    db,
    miDiaEnabled,
    notificationsUnread: opts.notificationsUnread,
    notificationsItems: opts.notificationsItems,
    hubAccess,
    workspaceAddons,
    workspaceId,
  });

  return {
    status: dbError === "database_not_configured" ? 503 : 200,
    body: dbError && dbError !== "database_not_configured" ? { ...body, dbError } : body,
  };
}
