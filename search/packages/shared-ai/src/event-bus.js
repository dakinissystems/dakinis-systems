/**
 * Publicador event bus platform — Redis list (scaffold) o noop sin REDIS_URL.
 * Consumidores: notifications/search workers, Internal API.
 */

import { createPlatformEvent } from "./events.js";

/** @type {import('redis').RedisClientType | null} */
let client = null;
let connectPromise = null;

/**
 * @param {string} [redisUrl]
 * @returns {Promise<import('redis').RedisClientType | null>}
 */
export async function getEventBusRedis(redisUrl = process.env.REDIS_URL) {
  if (!redisUrl) return null;
  if (client?.isOpen) return client;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      const { createClient } = await import("redis");
      const c = createClient({ url: redisUrl });
      c.on("error", (err) => console.error("[event-bus] redis", err.message));
      await c.connect();
      client = c;
      return c;
    } catch (err) {
      console.warn("[event-bus] redis unavailable:", err.message);
      return null;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

/**
 * @param {string} type
 * @param {object} payload
 * @param {{ userId?: string; tenantId?: string; source?: string; redisUrl?: string; queue?: string }} [opts]
 */
export async function publishPlatformEvent(type, payload, opts = {}) {
  const event = createPlatformEvent(type, payload, {
    userId: opts.userId,
    tenantId: opts.tenantId,
    source: opts.source || "platform",
  });

  if (String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq") {
    try {
      const { publishBullMqEvent, isBullMqEnabled } = await import("./bullmq-bus.js");
      if (isBullMqEnabled()) {
        return publishBullMqEvent(type, payload, opts);
      }
    } catch (err) {
      console.warn("[event-bus] bullmq publish failed:", err instanceof Error ? err.message : err);
    }
  }

  const queue = opts.queue || process.env.DAKINIS_EVENTS_QUEUE || "dakinis:events";
  const redis = await getEventBusRedis(opts.redisUrl);
  if (!redis) {
    return { queued: false, event };
  }
  await redis.lPush(queue, JSON.stringify(event));
  return { queued: true, event, queue };
}

/**
 * @param {string} [queue]
 * @param {number} [count]
 */
export async function drainPlatformEvents(queue = process.env.DAKINIS_EVENTS_QUEUE || "dakinis:events", count = 10) {
  const redis = await getEventBusRedis();
  if (!redis) return [];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const raw = await redis.rPop(queue);
    if (!raw) break;
    try {
      out.push(JSON.parse(raw));
    } catch {
      out.push({ event: "parse_error", payload: { raw } });
    }
  }
  return out;
}
