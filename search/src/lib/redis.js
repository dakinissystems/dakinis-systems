import { createClient } from "redis";
import { config, SEARCH_SCOPES } from "../config.js";

/** @type {import('redis').RedisClientType | null} */
let client = null;

export async function getRedis() {
  if (!config.redisUrl) return null;
  if (client?.isOpen) return client;
  client = createClient({ url: config.redisUrl });
  client.on("error", (err) => console.error("[search:redis]", err.message));
  await client.connect();
  return client;
}

export async function closeRedis() {
  if (client?.isOpen) await client.quit();
  client = null;
}

export { SEARCH_SCOPES };
