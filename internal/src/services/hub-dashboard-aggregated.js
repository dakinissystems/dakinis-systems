import { config } from "../config.js";
import { proxyJson } from "../lib/proxy.js";
import {
  cacheGetOrSetJson,
  hubDashboardCacheKey,
  hubDashboardTag,
} from "../lib/cache.js";
import { getHubDashboard, validateUserId } from "./hub-dashboard.js";

/**
 * Hub dashboard BFF with Redis cache (30s) + notifications fan-out.
 * @param {string} userId
 * @param {{ skipCache?: boolean }} [opts]
 */
export async function getHubDashboardAggregated(userId, opts = {}) {
  if (!validateUserId(userId)) {
    return { status: 400, body: { error: "validation", message: "userId must be a UUID" } };
  }

  const load = async () => {
    let notificationsUnread;
    let notificationsItems;
    const inbox = await proxyJson(
      config.notificationsUrl,
      `/v1/inbox/${encodeURIComponent(userId)}`,
    );
    if (inbox.status === 200 && inbox.body) {
      if (inbox.body.unread != null) notificationsUnread = inbox.body.unread;
      if (Array.isArray(inbox.body.items)) notificationsItems = inbox.body.items;
    }
    const result = await getHubDashboard(userId, { notificationsUnread, notificationsItems });
    return {
      ...result.body,
      aggregated: true,
      sources: {
        hubDb: Boolean(result.body?.db),
        notifications: inbox.status === 200,
        workspaceAddons: Array.isArray(result.body?.workspaceAddons),
      },
      cachedAt: new Date().toISOString(),
    };
  };

  if (opts.skipCache) {
    const body = await load();
    return { status: 200, body: { ...body, cached: false } };
  }

  const { data, cached } = await cacheGetOrSetJson(
    hubDashboardCacheKey(userId),
    30,
    load,
    { tags: [hubDashboardTag(userId)] },
  );
  return { status: 200, body: { ...data, cached } };
}
