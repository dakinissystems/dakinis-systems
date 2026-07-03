/**
 * Notifications worker — consume cola Redis y despacha por canal (stub log).
 */
import { config } from "./config.js";
import { dequeueNotification } from "./queue.js";
import { closeRedis } from "./lib/redis.js";

console.log(`[${config.service}:worker] starting`);
console.log(`  queue: ${config.queueName}`);
console.log(`  redis: ${config.redisUrl ? "configured" : "missing REDIS_URL"}`);

if (!config.redisUrl) {
  console.warn("[worker] Set REDIS_URL to enable queue consumer. Exiting.");
  process.exit(0);
}

let running = true;

async function dispatch(job) {
  console.log(`[worker] dispatch channel=${job.channel} type=${job.type} user=${job.userId} id=${job.id}`);
  // Roadmap: email (Resend), push (VAPID), in-app (Supabase), webhooks…
  switch (job.channel) {
    case "email":
      console.log("[worker] email stub — configure RESEND_API_KEY");
      break;
    case "in-app":
      console.log("[worker] in-app stub — write to hub.notifications");
      break;
    default:
      console.log(`[worker] channel ${job.channel} stub`);
  }
}

async function loop() {
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

process.on("SIGTERM", async () => {
  running = false;
  await closeRedis();
  process.exit(0);
});

loop();
