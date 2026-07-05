import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { getRedis } from "./lib/redis.js";

function isBullMqMode() {
  return String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq";
}

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

  if (isBullMqMode() && config.redisUrl) {
    try {
      const { publishPlatformEvent } = await import("@dakinis/shared-ai/event-bus");
      const result = await publishPlatformEvent("notifications.requested", record, {
        source: config.service,
        userId: job.userId,
        tenantId: job.tenantId,
        queueKey: "notifications",
      });
      return { queued: Boolean(result?.queued), id, record, transport: "bullmq", jobId: result?.jobId };
    } catch (err) {
      console.warn("[notifications] bullmq enqueue failed:", err instanceof Error ? err.message : err);
    }
  }

  const redis = await getRedis();
  if (!redis) {
    return { queued: false, id, record };
  }
  await redis.lPush(config.queueName, JSON.stringify(record));
  return { queued: true, id, record, transport: "redis-list" };
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
