/**
 * Notifications worker scaffold — connect to Redis/BullMQ when implementing Fase 5–6.
 * Railway: second service, start command `npm run worker`, no public URL.
 */
import { config } from "./config.js";

console.log(`[${config.service}:worker] starting (scaffold)`);
console.log(`  queue: ${config.queueName}`);
console.log(`  redis: ${config.redisUrl ? "configured" : "missing REDIS_URL"}`);

if (!config.redisUrl) {
  console.warn("[worker] Set REDIS_URL to enable queue consumer. Exiting scaffold loop.");
  process.exit(0);
}

// Placeholder: replace with BullMQ Worker consuming NOTIFICATIONS_QUEUE
const interval = setInterval(() => {
  console.log(`[${config.service}:worker] idle — implement BullMQ consumer`);
}, 60_000);

process.on("SIGTERM", () => {
  clearInterval(interval);
  process.exit(0);
});
