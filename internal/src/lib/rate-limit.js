import { getRedis } from "./events.js";

const WINDOW_SEC = 60;

/** @typedef {"public" | "bff" | "admin" | "events" | "default"} RateLimitTier */

/** Per-minute limits by traffic class (Gateway mirrors nginx zones). */
export const RATE_LIMIT_TIERS = {
  public: Number(process.env.INTERNAL_RATE_LIMIT_PUBLIC_PER_MIN) || 30,
  bff: Number(process.env.INTERNAL_RATE_LIMIT_BFF_PER_MIN) || 180,
  admin: Number(process.env.INTERNAL_RATE_LIMIT_ADMIN_PER_MIN) || 60,
  events: Number(process.env.INTERNAL_RATE_LIMIT_EVENTS_PER_MIN) || 120,
  default: Number(process.env.INTERNAL_RATE_LIMIT_PER_MIN) || 100,
};

/** @type {Map<string, { count: number; resetAt: number }>} */
const memoryBuckets = new Map();

/**
 * @param {string} pathname
 * @returns {RateLimitTier}
 */
export function resolveRateLimitTier(pathname) {
  const path = pathname || "/";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/events")) return "events";
  if (path.startsWith("/hub") || path.startsWith("/workspace")) return "bff";
  if (path.includes("/public")) return "public";
  return "default";
}

/**
 * @param {string} key
 * @param {number} [limit]
 */
export async function checkRateLimit(key, limit = RATE_LIMIT_TIERS.default) {
  const redis = await getRedis();
  const now = Date.now();
  const redisKey = `ratelimit:${key}`;

  if (redis) {
    try {
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.expire(redisKey, WINDOW_SEC);
      if (count > limit) {
        return { allowed: false, limit, remaining: 0, retryAfterSec: WINDOW_SEC };
      }
      return { allowed: true, limit, remaining: Math.max(0, limit - count) };
    } catch {
      /* memory fallback */
    }
  }

  let bucket = memoryBuckets.get(redisKey);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_SEC * 1000 };
    memoryBuckets.set(redisKey, bucket);
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { allowed: true, limit, remaining: Math.max(0, limit - bucket.count) };
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {string} scopeKey
 * @param {RateLimitTier} [tier]
 */
export async function enforceServiceRateLimit(req, scopeKey, tier) {
  const url = new URL(req.url || "/", "http://internal.local");
  const resolved = tier || resolveRateLimitTier(url.pathname);
  const limit = RATE_LIMIT_TIERS[resolved] ?? RATE_LIMIT_TIERS.default;
  const tenantId = url.searchParams.get("tenantId") || "";
  const key = tenantId
    ? `${resolved}:tenant:${tenantId}`
    : `${resolved}:user:${scopeKey}`;
  return checkRateLimit(key, limit);
}
