/**
 * Search indexer worker — BullMQ (fase 1) o Redis list (legacy).
 */
import { config } from "./config.js";
import { dequeueIndexJob, applyIndexJob } from "./index-store.js";
import { closeRedis } from "./lib/redis.js";

console.log(`[${config.service}:worker] starting`);
console.log(`  queue: ${config.indexQueue}`);
console.log(`  bus: ${process.env.DAKINIS_EVENT_BUS || "redis-list"}`);

if (!config.redisUrl) {
  console.warn("[worker] Set REDIS_URL. Exiting.");
  process.exit(0);
}

async function processJob(job) {
  const payload = job?.payload || job;
  const result = await applyIndexJob(payload);
  console.log(
    `[worker] index scope=${payload?.scope} id=${payload?.id} applied=${result.applied}`,
    result.reason || ""
  );
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
      const job = await dequeueIndexJob(5);
      if (job) await processJob(job);
    } catch (err) {
      console.error("[worker]", err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function startBullMqWorker() {
  const { createPlatformWorker } = await import("@dakinis/shared-ai/bullmq-bus");
  const worker = await createPlatformWorker("search", async (event) => {
    await processJob(event);
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
