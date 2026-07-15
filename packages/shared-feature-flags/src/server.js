import { createFeatureFlagRepository } from "@dakinis/shared-db";

/**
 * @param {(text: string, params?: unknown[]) => Promise<import('pg').QueryResult>} queryFn
 * @param {{ redisGet?: (key: string) => Promise<string|null>, redisSet?: (key: string, value: string, ttlSec: number) => Promise<void>, ttlSec?: number, memoryTtlMs?: number }} [cache]
 */
export function createFeatureFlagService(queryFn, cache) {
  const repo = createFeatureFlagRepository(queryFn);
  const ttl = cache?.ttlSec ?? 60;
  const memoryTtlMs = cache?.memoryTtlMs ?? ttl * 1000;
  /** @type {Map<string, { value: Record<string, boolean>; expiresAt: number }>} */
  const memory = new Map();

  return {
    /**
     * @param {string[]} keys
     * @param {object} ctx
     */
    async evaluate(keys, ctx = {}) {
      return evaluateBatchInternal(keys, ctx, { repo, cache, ttl, memory, memoryTtlMs });
    },

    /**
     * @param {string[]} keys
     * @param {object} ctx
     */
    async evaluateBatch(keys, ctx = {}) {
      return evaluateBatchInternal(keys, ctx, { repo, cache, ttl, memory, memoryTtlMs });
    },

    invalidate(ctx = {}) {
      const prefix = buildCachePrefix(ctx);
      for (const key of [...memory.keys()]) {
        if (key.startsWith(prefix)) memory.delete(key);
      }
    },
  };
}

/**
 * @param {string[]} keys
 * @param {object} ctx
 * @param {object} deps
 */
async function evaluateBatchInternal(keys, ctx, deps) {
  const list = [...new Set(keys.filter(Boolean))];
  if (list.length === 0) return {};

  const cacheKey = buildCacheKey(list, ctx);
  const memHit = deps.memory.get(cacheKey);
  if (memHit && memHit.expiresAt > Date.now()) {
    return memHit.value;
  }

  if (deps.cache?.redisGet) {
    const hit = await deps.cache.redisGet(cacheKey);
    if (hit) {
      try {
        const parsed = JSON.parse(hit);
        deps.memory.set(cacheKey, { value: parsed, expiresAt: Date.now() + deps.memoryTtlMs });
        return parsed;
      } catch {
        /* ignore corrupt cache */
      }
    }
  }

  const flags = await deps.repo.evaluate(list, ctx);
  deps.memory.set(cacheKey, { value: flags, expiresAt: Date.now() + deps.memoryTtlMs });
  if (deps.cache?.redisSet) {
    await deps.cache.redisSet(cacheKey, JSON.stringify(flags), deps.ttl).catch(() => {});
  }
  return flags;
}

/**
 * @param {string[]} keys
 * @param {object} ctx
 */
function buildCacheKey(keys, ctx) {
  return `${buildCachePrefix(ctx)}:${[...keys].sort().join(",")}`;
}

/**
 * @param {object} ctx
 */
function buildCachePrefix(ctx) {
  return `ff:${ctx.tenantId || "-"}:${ctx.workspaceId || "-"}:${ctx.userId || "-"}:${ctx.plan || "-"}`;
}
