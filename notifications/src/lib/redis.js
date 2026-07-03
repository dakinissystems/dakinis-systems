/** Cliente Redis compartido (optional — sin REDIS_URL devuelve null). */
import { createClient } from "redis";
import { config } from "../config.js";

/** @type {import('redis').RedisClientType | null} */
let client = null;

export async function getRedis() {
  if (!config.redisUrl) return null;
  if (client?.isOpen) return client;
  client = createClient({ url: config.redisUrl });
  client.on("error", (err) => console.error("[notifications:redis]", err.message));
  await client.connect();
  return client;
}

export async function closeRedis() {
  if (client?.isOpen) await client.quit();
  client = null;
}
