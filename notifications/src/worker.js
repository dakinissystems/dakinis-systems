/**
 * Notifications worker — BullMQ (fase 1) o Redis list (legacy).
 */
import { config } from "./config.js";
import { dequeueNotification } from "./queue.js";
import { closeRedis } from "./lib/redis.js";

console.log(`[${config.service}:worker] starting`);
console.log(`  queue: ${config.queueName}`);
console.log(`  bus: ${process.env.DAKINIS_EVENT_BUS || "redis-list"}`);
console.log(`  redis: ${config.redisUrl ? "configured" : "missing REDIS_URL"}`);

if (!config.redisUrl) {
  console.warn("[worker] Set REDIS_URL to enable queue consumer. Exiting.");
  process.exit(0);
}

async function dispatch(job) {
  const channel = job.channel || job.payload?.channel || "unknown";
  const type = job.type || job.event || job.payload?.type || "unknown";
  const userId = job.userId || job.payload?.userId;
  console.log(`[worker] dispatch channel=${channel} type=${type} user=${userId} id=${job.id || job.jobId}`);
  switch (channel) {
    case "email":
      console.log("[worker] email stub — configure RESEND_API_KEY");
      break;
    case "in-app":
      console.log("[worker] in-app stub — write to hub.notifications");
      break;
    default:
      console.log(`[worker] channel ${channel} stub`);
  }
}

function isBullMqMode() {
  return String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq";
}

async function startLegacyLoop() {
  let running = true;
  process.on("SIGTERM", async () => {
    running = false;
    await closeRedis();
    process.exit(0);
  });

  while (running) {
    try {
      const job = await dequeueNotification(5);
      if (job) await dispatch(job);
    } catch (err) {
      console.error("[worker] error", err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function startBullMqWorker() {
  const { createPlatformWorker } = await import("@dakinis/shared-ai/bullmq-bus");
  const worker = await createPlatformWorker("notifications", async (event) => {
    await dispatch({
      id: event?.payload?.id,
      channel: event?.payload?.channel || "email",
      type: event?.event || event?.type,
      userId: event?.userId,
      payload: event?.payload,
    });
  });

  process.on("SIGTERM", async () => {
    await worker.close();
    process.exit(0);
  });
}

if (isBullMqMode()) {
  startBullMqWorker().catch((err) => {
    console.error("[worker] bullmq fatal", err);
    process.exit(1);
  });
} else {
  startLegacyLoop();
}
