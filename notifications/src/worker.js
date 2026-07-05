/**
 * Notifications worker — BullMQ (fase 1) o Redis list (legacy).
 */
import { config } from "./config.js";
import { dequeueNotification } from "./queue.js";
import { closeRedis } from "./lib/redis.js";
import { persistInAppNotification } from "./lib/inbox-store.js";
import { sendResendEmail } from "./lib/resend.js";

console.log(`[${config.service}:worker] starting`);
console.log(`  queue: ${config.queueName}`);
console.log(`  bus: ${process.env.DAKINIS_EVENT_BUS || "redis-list"}`);
console.log(`  redis: ${config.redisUrl ? "configured" : "missing REDIS_URL"}`);
console.log(`  postgres: ${config.databaseUrl ? "configured" : "missing DATABASE_URL"}`);
console.log(`  resend: ${config.resendApiKey ? "configured" : "missing RESEND_API_KEY"}`);

if (!config.redisUrl) {
  console.warn("[worker] Set REDIS_URL to enable queue consumer. Exiting.");
  process.exit(0);
}

function normalizeJob(raw) {
  const job = raw && typeof raw === "object" ? raw : {};
  const nested = job.payload && typeof job.payload === "object" ? job.payload : {};
  const hasNestedShape = nested.userId || nested.channel || nested.type;

  if (hasNestedShape && !job.userId) {
    return {
      id: nested.id || job.id,
      userId: nested.userId,
      tenantId: nested.tenantId,
      channel: nested.channel || job.channel || "in-app",
      type: nested.type || job.type || job.event,
      payload: nested.payload || {},
    };
  }

  return {
    id: job.id,
    userId: job.userId,
    tenantId: job.tenantId,
    channel: job.channel || "in-app",
    type: job.type || job.event,
    payload: job.payload && typeof job.payload === "object" ? job.payload : {},
  };
}

async function dispatch(rawJob) {
  const job = normalizeJob(rawJob);
  const { channel, type, userId } = job;
  console.log(`[worker] dispatch channel=${channel} type=${type} user=${userId} id=${job.id || ""}`);

  switch (channel) {
    case "email": {
      const result = await sendResendEmail(job);
      if (result.sent) {
        console.log(`[worker] email sent id=${result.id || ""}`);
      } else {
        console.warn(`[worker] email not sent reason=${result.reason || "unknown"}`);
      }
      break;
    }
    case "in-app": {
      const result = await persistInAppNotification(job);
      if (result.persisted) {
        console.log(`[worker] in-app persisted id=${result.id}`);
      } else {
        console.warn(`[worker] in-app not persisted reason=${result.reason || "unknown"}`);
      }
      break;
    }
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
    await dispatch(event?.payload || event);
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
