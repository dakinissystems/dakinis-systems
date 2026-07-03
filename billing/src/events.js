import { createClient } from "redis";
import { config } from "./config.js";

/** @type {import("redis").RedisClientType | null} */
let client = null;

async function getRedis() {
  if (!config.redisUrl) return null;
  if (!client) {
    client = createClient({ url: config.redisUrl });
    client.on("error", (err) => console.error("[billing] redis:", err.message));
    await client.connect();
  }
  return client;
}

/**
 * @param {string} type
 * @param {Record<string, unknown>} payload
 */
export async function publishBillingEvent(type, payload = {}) {
  const event = {
    type,
    payload,
    ts: new Date().toISOString(),
    source: config.service,
  };

  try {
    const redis = await getRedis();
    if (redis) {
      await redis.lPush(config.eventsQueue, JSON.stringify(event));
    }
  } catch (err) {
    console.warn("[billing] event publish failed:", err instanceof Error ? err.message : err);
  }

  return event;
}
