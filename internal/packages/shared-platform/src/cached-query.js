/**
 * CachedQuery decorator — wraps QueryBus handlers without bloating the bus.
 */

/**
 * @param {import("./query-bus.js").QueryBus} queryBus
 * @param {import("./cache-service.js").CacheService} cache
 * @param {{
 *   queryType: string;
 *   ttlSec?: number;
 *   keyFn?: (query: object) => string;
 *   tagsFn?: (query: object, result: unknown) => string[];
 *   skipCache?: (query: object) => boolean;
 * }} options
 */
export function registerCachedQuery(queryBus, cache, options) {
  const {
    queryType,
    ttlSec = 60,
    keyFn = (q) => `${queryType}:${JSON.stringify(q.params || {})}`,
    tagsFn = () => [],
    skipCache = (q) => q.params?.fresh === "1" || q.params?.fresh === true,
  } = options;

  /**
   * @param {(query: object) => Promise<unknown>} handler
   */
  return function register(handler) {
    queryBus.register(queryType, async (query) => {
      if (skipCache(query)) {
        return handler(query);
      }
      const key = keyFn(query);
      const memo = await cache.memo(key, ttlSec, () => handler(query), {
        tags: tagsFn(query, null),
      });
      return memo.data;
    });
  };
}

/**
 * @param {import("./cache-service.js").CacheService} cache
 * @param {string} queryType
 * @param {object} query
 * @param {(query: object) => Promise<unknown>} handler
 * @param {{ ttlSec?: number; key?: string; tags?: string[] }} [opts]
 */
export async function executeCachedQuery(cache, queryType, query, handler, opts = {}) {
  const key = opts.key ?? `${queryType}:${JSON.stringify(query.params || {})}`;
  const ttlSec = opts.ttlSec ?? 60;
  const skip =
    query.params?.fresh === "1" ||
    query.params?.fresh === true;

  if (skip) return handler(query);

  const memo = await cache.memo(key, ttlSec, () => handler(query), {
    tags: opts.tags ?? [],
  });
  return memo.data;
}
