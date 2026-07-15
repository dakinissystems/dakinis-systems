import { cacheGetOrSetJson, platformHealthCacheKey } from "../lib/cache.js";
import { getPlatformMetrics } from "./platform-metrics.js";

/**
 * Lightweight platform health snapshot (cached 10s).
 * @param {{ skipCache?: boolean }} [opts]
 */
export async function getPlatformHealth(opts = {}) {
  const load = async () => {
    const metrics = await getPlatformMetrics();
    const degraded = (metrics.services || []).filter((s) => s.ok === false);
    return {
      ok: degraded.length === 0 && metrics.summary?.databaseOk !== false,
      checkedAt: metrics.checkedAt,
      summary: metrics.summary,
      services: (metrics.services || []).map((s) => ({
        id: s.id,
        ok: s.ok,
        detail: s.detail,
        latencyMs: s.latencyMs,
      })),
      degradedCount: degraded.length,
      stub: metrics.stub,
    };
  };

  if (opts.skipCache) {
    return { status: 200, body: { ...(await load()), cached: false } };
  }

  const { data, cached } = await cacheGetOrSetJson(platformHealthCacheKey(), 10, load);
  return { status: 200, body: { ...data, cached } };
}
