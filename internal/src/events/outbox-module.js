import { getPool } from "../lib/db.js";
import { startOutboxPoller } from "@dakinis/shared-db/outbox/processor";
import { handleInternalOutboxEvent } from "./outbox-consumer.js";

/**
 * Start Internal outbox poller (same process — not a separate service).
 * @returns {(() => void) | null}
 */
export function startInternalOutboxConsumer() {
  const pool = getPool();
  if (!pool) {
    console.warn("[internal] outbox consumer skipped — database_not_configured");
    return null;
  }

  const stop = startOutboxPoller(pool, {
    intervalMs: Number(process.env.OUTBOX_POLL_MS) || 15_000,
    log: (msg, meta) => {
      if (msg === "outbox_event_failed") {
        console.warn("[internal] outbox:", msg, meta || {});
      } else if (process.env.OUTBOX_DEBUG === "1") {
        console.log("[internal] outbox:", msg, meta || {});
      }
    },
    onEvent: handleInternalOutboxEvent,
  });

  console.log("[internal] outbox consumer started");
  return stop;
}
