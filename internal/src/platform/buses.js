import { CommandBus, createCommand } from "@dakinis/shared-platform/command-bus";
import { QueryBus } from "@dakinis/shared-platform/query-bus";
import {
  platformQueries,
  createMappedQuery,
} from "@dakinis/shared-platform/query-map";
import { registerCachedQuery } from "@dakinis/shared-platform/cached-query";
import { validationMiddleware } from "@dakinis/shared-platform/command-middleware";
import { getCacheService } from "../lib/cache.js";
import { getHubDashboardAggregated } from "../services/hub-dashboard-aggregated.js";
import { getWorkspaceSummary } from "../services/workspace-summary.js";
import { getPlatformHealth } from "../services/platform-health.js";
import { acceptInviteViaFacade } from "../facades/invite-facade.js";
import { buildInternalContext } from "./context.js";

export const commandBus = new CommandBus();
export const queryBus = new QueryBus();

/** @deprecated Prefer createMappedQuery — kept for callers still importing createQuery. */
export const createQuery = createMappedQuery;

const cache = getCacheService();

registerCachedQuery(queryBus, cache, {
  queryType: "hub.dashboard.aggregated",
  ttlSec: 45,
  keyFn: (q) => `bff:hub:dashboard:${q.params?.userId}`,
  tagsFn: (q) => [`bff:hub:${q.params?.userId}`],
})(async (query) => {
  const userId = query.params?.userId || query.metadata?.userId;
  if (!userId) throw new Error("userId_required");
  return getHubDashboardAggregated(userId, { skipCache: true });
});

registerCachedQuery(queryBus, cache, {
  queryType: "workspace.summary",
  ttlSec: 45,
  keyFn: (q) => `bff:workspace:summary:${q.params?.userId}`,
  tagsFn: (q) => [`bff:workspace:${q.params?.userId}`],
})(async (query) => {
  const userId = query.params?.userId || query.metadata?.userId;
  if (!userId) throw new Error("userId_required");
  return getWorkspaceSummary(userId, { skipCache: true });
});

registerCachedQuery(queryBus, cache, {
  queryType: "platform.health",
  ttlSec: 30,
  keyFn: () => "bff:platform:health",
})(async () => getPlatformHealth({ skipCache: true }));

commandBus.register("cache.invalidate.user", async (command) => {
  const userId = command.payload?.userId;
  if (!userId) throw new Error("userId_required");
  const { invalidateUserBffCache } = await import("../lib/cache.js");
  await invalidateUserBffCache(userId);
  return { ok: true, userId };
});

commandBus.register(
  "workspace.invite.accept",
  async (command) => {
    const token = command.payload?.token;
    const userId = command.payload?.userId;
    const ctx = command.metadata?.ctx ?? buildInternalContext({ userId });
    return acceptInviteViaFacade(token, { userId, ctx });
  },
  {
    middleware: [
      validationMiddleware((cmd) => {
        if (!cmd.payload?.token) throw new Error("token_required");
        if (!cmd.payload?.userId) throw new Error("user_id_required");
      }),
    ],
  }
);

platformQueries.assertRegistered(queryBus);

export { createCommand, createMappedQuery, platformQueries };