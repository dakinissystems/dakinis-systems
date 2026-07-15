import { CommandBus, createCommand } from "@dakinis/shared-platform/command-bus";
import { QueryBus, createQuery } from "@dakinis/shared-platform/query-bus";
import { getHubDashboardAggregated } from "../services/hub-dashboard-aggregated.js";
import { getWorkspaceSummary } from "../services/workspace-summary.js";
import { getPlatformHealth } from "../services/platform-health.js";

export const commandBus = new CommandBus();
export const queryBus = new QueryBus();

queryBus.register("hub.dashboard.aggregated", async (query) => {
  const userId = query.params?.userId || query.metadata?.userId;
  if (!userId) throw new Error("userId_required");
  const skipCache = query.params?.fresh === "1" || query.params?.fresh === true;
  return getHubDashboardAggregated(userId, { skipCache });
});

queryBus.register("workspace.summary", async (query) => {
  const userId = query.params?.userId || query.metadata?.userId;
  if (!userId) throw new Error("userId_required");
  const skipCache = query.params?.fresh === "1" || query.params?.fresh === true;
  return getWorkspaceSummary(userId, { skipCache });
});

queryBus.register("platform.health", async (query) => {
  const skipCache = query.params?.fresh === "1" || query.params?.fresh === true;
  return getPlatformHealth({ skipCache });
});

commandBus.register("cache.invalidate.user", async (command) => {
  const userId = command.payload?.userId;
  if (!userId) throw new Error("userId_required");
  const { invalidateUserBffCache } = await import("../lib/cache.js");
  await invalidateUserBffCache(userId);
  return { ok: true, userId };
});

export { createCommand, createQuery };
