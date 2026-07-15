import { getRedis } from "./events.js";

const DEFAULT_LIMIT = Number(process.env.INTERNAL_RATE_LIMIT_PER_MIN) || 100;
const WINDOW_SEC = 60;

/** @type {Map<string, { count: number; resetAt: number }>} */
const memoryBuckets = new Map();

/**
 * @param {string} key
 * @param {number} [limit]
 */
export async function checkRateLimit(key, limit = DEFAULT_LIMIT) {
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
 */
export async function enforceServiceRateLimit(req, scopeKey) {
  const url = new URL(req.url || "/", "http://internal.local");
  const tenantId = url.searchParams.get("tenantId") || "";
  const key = tenantId ? `tenant:${tenantId}` : `user:${scopeKey}`;
  return checkRateLimit(key);
}
