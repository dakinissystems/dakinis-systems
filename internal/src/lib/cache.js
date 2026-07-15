import { CacheService } from "@dakinis/shared-platform/cache";
import { getRedis } from "./events.js";

/** @type {CacheService | null} */
let service = null;

async function redisGet(key) {
  const redis = await getRedis();
  if (!redis) return null;
  return redis.get(key);
}

async function redisSet(key, value, ttlSec) {
  const redis = await getRedis();
  if (!redis) return;
  await redis.set(key, value, { EX: ttlSec });
}

async function redisDel(keys) {
  const redis = await getRedis();
  if (!redis) return;
  await redis.del(keys);
}

function getCacheService() {
  if (!service) {
    service = new CacheService({
      get: redisGet,
      set: redisSet,
      del: redisDel,
      maxMemoryKeys: 500,
    });
  }
  return service;
}

/**
 * @param {string} key
 */
export async function cacheGet(key) {
  return getCacheService().get(key);
}

/**
 * @param {string} key
 * @param {string} value
 * @param {number} ttlSec
 * @param {{ tags?: string[] }} [options]
 */
export async function cacheSet(key, value, ttlSec, options = {}) {
  return getCacheService().set(key, value, ttlSec, options);
}

/**
 * @param {string[]} keys
 */
export async function cacheDel(keys) {
  return getCacheService().del(keys);
}

/**
 * @param {string} tag
 */
export async function cacheInvalidateTag(tag) {
  return getCacheService().invalidateTag(tag);
}

/**
 * @param {string} key
 * @param {number} ttlSec
 * @param {() => Promise<object>} loader
 * @param {{ tags?: string[] }} [options]
 */
export async function cacheGetOrSetJson(key, ttlSec, loader, options = {}) {
  const result = await getCacheService().memo(key, ttlSec, loader, options);
  return { data: result.data, cached: result.cached };
}

export function hubDashboardCacheKey(userId) {
  return `bff:hub:dashboard:${userId}`;
}

export function workspaceSummaryCacheKey(userId) {
  return `bff:workspace:summary:${userId}`;
}

export function platformHealthCacheKey() {
  return "bff:platform:health";
}

export function hubDashboardTag(userId) {
  return `bff:hub:${userId}`;
}

export function workspaceSummaryTag(userId) {
  return `bff:workspace:${userId}`;
}

/**
 * @param {string} userId
 */
export async function invalidateUserBffCache(userId) {
  await Promise.all([
    cacheInvalidateTag(hubDashboardTag(userId)),
    cacheInvalidateTag(workspaceSummaryTag(userId)),
    cacheDel([hubDashboardCacheKey(userId), workspaceSummaryCacheKey(userId)]),
  ]);
}

export { getCacheService };
