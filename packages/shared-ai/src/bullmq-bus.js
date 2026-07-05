/**
 * Event bus BullMQ — colas, publicación, workers y DLQ.
 * Activar con DAKINIS_EVENT_BUS=bullmq y REDIS_URL.
 */

import { EVENT_BUS_QUEUES, createPlatformEvent } from "./events.js";

/** @type {Map<string, import('bullmq').Queue>} */
const queues = new Map();

let bullmqModule = null;

export function isBullMqEnabled() {
  return (
    String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq" &&
    Boolean(String(process.env.REDIS_URL || "").trim())
  );
}

async function loadBullMq() {
  if (bullmqModule) return bullmqModule;
  bullmqModule = await import("bullmq");
  return bullmqModule;
}

/**
 * @returns {import('bullmq').ConnectionOptions | null}
 */
export function createBullMqConnection() {
  const url = String(process.env.REDIS_URL || "").trim();
  if (!url) return null;
  return { url, maxRetriesPerRequest: null };
}

/**
 * @param {string} eventType
 * @returns {keyof typeof EVENT_BUS_QUEUES}
 */
export function resolveEventQueueKey(eventType) {
  const t = String(eventType || "");
  if (t === "search.index" || t.startsWith("search.")) return "search";
  if (t === "notifications.requested" || t.startsWith("notifications.")) return "notifications";
  if (t.startsWith("billing.")) return "default";
  if (t.startsWith("ai.")) return "ai";
  if (t.startsWith("knowledge.")) return "knowledge";
  if (t.startsWith("storage.")) return "storage";
  return "default";
}

function queueConfig(queueKey) {
  return EVENT_BUS_QUEUES[queueKey] || EVENT_BUS_QUEUES.default;
}

/**
 * @param {keyof typeof EVENT_BUS_QUEUES | string} queueKey
 */
export async function getBullMqQueue(queueKey = "default") {
  const cfg = queueConfig(queueKey);
  if (queues.has(cfg.name)) return queues.get(cfg.name);

  const connection = createBullMqConnection();
  if (!connection) throw new Error("REDIS_URL required for BullMQ");

  const { Queue } = await loadBullMq();
  const queue = new Queue(cfg.name, {
    connection,
    defaultJobOptions: {
      attempts: (cfg.retries ?? 3) + 1,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 2000 },
    },
  });
  queues.set(cfg.name, queue);
  return queue;
}

/**
 * @param {string} type
 * @param {object} payload
 * @param {{ userId?: string; tenantId?: string; source?: string; queueKey?: string }} [opts]
 */
export async function publishBullMqEvent(type, payload, opts = {}) {
  const connection = createBullMqConnection();
  if (!connection) return { queued: false, reason: "no_redis" };

  const event = createPlatformEvent(type, payload, {
    userId: opts.userId,
    tenantId: opts.tenantId,
    source: opts.source || "platform",
  });

  const queueKey = opts.queueKey || resolveEventQueueKey(type);
  const cfg = queueConfig(queueKey);
  const queue = await getBullMqQueue(queueKey);
  const job = await queue.add(String(type), event, { jobId: undefined });

  return { queued: true, event, jobId: job.id, queue: cfg.name, queueKey };
}

/**
 * @param {keyof typeof EVENT_BUS_QUEUES | string} queueKey
 * @param {(event: import('./events.js').PlatformEvent, job: import('bullmq').Job) => Promise<void>} processor
 * @param {{ concurrency?: number }} [opts]
 */
export async function createPlatformWorker(queueKey, processor, opts = {}) {
  const cfg = queueConfig(queueKey);
  const connection = createBullMqConnection();
  if (!connection) throw new Error("REDIS_URL required for BullMQ worker");

  const { Worker } = await loadBullMq();
  const dlqCfg = EVENT_BUS_QUEUES.deadLetter;

  const worker = new Worker(
    cfg.name,
    async (job) => {
      const data = job.data || {};
      await processor(data, job);
    },
    {
      connection,
      concurrency: opts.concurrency ?? cfg.concurrency ?? 5,
    }
  );

  worker.on("failed", async (job, err) => {
    if (!job) return;
    const maxAttempts = job.opts?.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) return;

    try {
      const dlq = await getBullMqQueue("deadLetter");
      await dlq.add(
        "dlq",
        {
          originalQueue: cfg.name,
          originalJobId: job.id,
          event: job.data,
          error: err instanceof Error ? err.message : String(err),
          failedAt: new Date().toISOString(),
        },
        { jobId: undefined }
      );
      console.warn(`[bullmq] job moved to DLQ queue=${dlqCfg.name} id=${job.id} err=${err?.message}`);
    } catch (dlqErr) {
      console.error("[bullmq] DLQ enqueue failed:", dlqErr instanceof Error ? dlqErr.message : dlqErr);
    }
  });

  worker.on("error", (err) => {
    console.error(`[bullmq] worker error queue=${cfg.name}:`, err.message);
  });

  console.log(`[bullmq] worker started queue=${cfg.name} concurrency=${opts.concurrency ?? cfg.concurrency}`);
  return worker;
}

export async function closeBullMqQueues() {
  for (const q of queues.values()) {
    await q.close();
  }
  queues.clear();
}
