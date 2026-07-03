import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { getRedis } from "./lib/redis.js";

/**
 * @param {{ userId: string; channel: string; type: string; payload?: object; tenantId?: string }} job
 */
export async function enqueueNotification(job) {
  const id = randomUUID();
  const record = {
    id,
    ...job,
    enqueuedAt: new Date().toISOString(),
    status: "pending",
  };
  const redis = await getRedis();
  if (!redis) {
    return { queued: false, id, record };
  }
  await redis.lPush(config.queueName, JSON.stringify(record));
  return { queued: true, id, record };
}

/**
 * @param {number} [timeoutSec]
 */
export async function dequeueNotification(timeoutSec = 5) {
  const redis = await getRedis();
  if (!redis) return null;
  const res = await redis.brPop(config.queueName, timeoutSec);
  if (!res) return null;
  try {
    return JSON.parse(res.element);
  } catch {
    return { id: "parse_error", raw: res.element };
  }
}
