import { createClient } from "redis";
import { config } from "../config.js";

/** @type {import('redis').RedisClientType | null} */
let client = null;

/** In-memory fallback when Redis is unavailable. */
const memoryEvents = [];

export async function getRedis() {
  if (!config.redisUrl) return null;
  if (client?.isOpen) return client;
  client = createClient({ url: config.redisUrl });
  client.on("error", (err) => console.error("[internal:redis]", err.message));
  await client.connect();
  return client;
}

/**
 * @param {object} event
 */
async function pushEventToRedis(redis, event) {
  try {
    await redis.lPush(config.eventsQueue, JSON.stringify(event));
    return { queued: true, queue: config.eventsQueue };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("WRONGTYPE")) throw err;
    console.warn(
      `[internal:redis] queue key ${config.eventsQueue} had wrong type; recreating as list`,
    );
    await redis.del(config.eventsQueue);
    await redis.lPush(config.eventsQueue, JSON.stringify(event));
    return { queued: true, queue: config.eventsQueue, recovered: true };
  }
}

export async function publishEvent(event) {
  const redis = await getRedis();
  if (redis) {
    return pushEventToRedis(redis, event);
  }
  memoryEvents.unshift(event);
  if (memoryEvents.length > 100) memoryEvents.pop();
  return { queued: false, memory: true };
}

export function listRecentEvents(limit = 25) {
  return memoryEvents.slice(0, limit);
}

export async function listQueuedEvents(limit = 25) {
  const redis = await getRedis();
  if (!redis) return listRecentEvents(limit);
  const len = await redis.lLen(config.eventsQueue);
  const raw = await redis.lRange(config.eventsQueue, 0, Math.min(limit - 1, len - 1));
  return raw.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return { event: "parse_error", raw: s };
    }
  });
}
