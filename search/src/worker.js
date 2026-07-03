/**
 * Search indexer worker — procesa cola de indexación (stub + log).
 */
import { config } from "./config.js";
import { dequeueIndexJob } from "./index-store.js";
import { closeRedis } from "./lib/redis.js";

console.log(`[${config.service}:worker] starting`);
console.log(`  queue: ${config.indexQueue}`);

if (!config.redisUrl) {
  console.warn("[worker] Set REDIS_URL. Exiting.");
  process.exit(0);
}

let running = true;

async function processJob(job) {
  console.log(`[worker] index job`, job);
}

async function loop() {
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

process.on("SIGTERM", async () => {
  running = false;
  await closeRedis();
  process.exit(0);
});

loop();
