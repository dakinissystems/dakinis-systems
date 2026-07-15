import { listWorkspaceAddonsForUser } from "./workspace-addons.js";
import { listDesktopProfilesForUser } from "./workspace-desktop-profiles.js";
import { getWorkspaceForUser } from "./workspace-admin.js";
import {
  cacheGetOrSetJson,
  workspaceSummaryCacheKey,
  workspaceSummaryTag,
} from "../lib/cache.js";

/**
 * @param {string} userId
 * @param {{ skipCache?: boolean }} [opts]
 */
export async function getWorkspaceSummary(userId, opts = {}) {
  const load = async () => {
    const [workspace, addons, profiles] = await Promise.all([
      getWorkspaceForUser(userId).catch(() => null),
      listWorkspaceAddonsForUser(userId).catch(() => ({
        items: [],
        workspaceId: null,
      })),
      listDesktopProfilesForUser(userId).catch(() => ({ items: [], workspaceId: null })),
    ]);

    const enabledAddons = (addons.items || []).filter((a) => a.enabled);

    return {
      userId,
      workspaceId: addons.workspaceId || profiles.workspaceId || workspace?.id || null,
      workspace: workspace
        ? {
            slug: workspace.slug,
            plan: workspace.plan,
            status: workspace.status,
          }
        : null,
      addons: {
        total: addons.items?.length ?? 0,
        enabled: enabledAddons.length,
        enabledIds: enabledAddons.map((a) => a.key || a.id),
      },
      desktopProfiles: {
        count: profiles.items?.length ?? 0,
        items: (profiles.items || []).map((p) => ({
          key: p.profile_key || p.key,
          label: p.label || p.name,
        })),
      },
      activity: { items: [], stub: true },
      cachedAt: new Date().toISOString(),
    };
  };

  if (opts.skipCache) {
    return { status: 200, body: await load(), cached: false };
  }

  const { data, cached } = await cacheGetOrSetJson(
    workspaceSummaryCacheKey(userId),
    60,
    load,
    { tags: [workspaceSummaryTag(userId)] },
  );
  return { status: 200, body: { ...data, cached }, cached };
}
