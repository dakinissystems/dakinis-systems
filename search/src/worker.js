/**
 * Search indexer worker scaffold — consumes SEARCH_INDEX_QUEUE via BullMQ (roadmap).
 */
import { config } from "./config.js";

console.log(`[${config.service}:worker] starting (scaffold)`);
console.log(`  queue: ${config.indexQueue}`);

if (!config.redisUrl) {
  console.warn("[worker] Set REDIS_URL. Exiting scaffold.");
  process.exit(0);
}

setInterval(() => {
  console.log(`[${config.service}:worker] idle — implement index consumer`);
}, 60_000);
