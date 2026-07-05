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
 * @param {string} queueName
 * @returns {keyof typeof EVENT_BUS_QUEUES | null}
 */
export function resolveQueueKeyByName(queueName) {
  const name = String(queueName || "").trim();
  if (!name) return null;
  for (const [key, cfg] of Object.entries(EVENT_BUS_QUEUES)) {
    if (cfg.name === name) return key;
  }
  return null;
}

/**
 * @param {import('bullmq').Job} job
 */
function summarizeDlqJob(job) {
  const data = job.data || {};
  const event = data.event || {};
  return {
    id: job.id,
    originalQueue: data.originalQueue || null,
    originalJobId: data.originalJobId || null,
    error: data.error || null,
    failedAt: data.failedAt || null,
    eventType: event.event || event.type || null,
    tenantId: event.tenantId || event.payload?.tenantId || null,
    source: event.source || null,
    enqueuedAt: job.timestamp ? new Date(job.timestamp).toISOString() : null,
  };
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

/**
 * Job counts for one queue key (waiting, active, failed, …).
 * @param {keyof typeof EVENT_BUS_QUEUES | string} queueKey
 */
export async function getBullMqQueueCounts(queueKey = "default") {
  if (!isBullMqEnabled()) return { enabled: false, counts: null };
  const cfg = queueConfig(queueKey);
  const queue = await getBullMqQueue(queueKey);
  const counts = await queue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed",
    "paused"
  );
  return { enabled: true, queueKey, name: cfg.name, counts };
}

/**
 * Snapshot of all platform queues + DLQ depth.
 */
export async function getEventBusQueueSnapshot() {
  if (!isBullMqEnabled()) {
    return { enabled: false, mode: String(process.env.DAKINIS_EVENT_BUS || "redis-list") };
  }

  /** @type {Record<string, { name: string; counts: Record<string, number> }>} */
  const queuesSnapshot = {};
  for (const key of Object.keys(EVENT_BUS_QUEUES)) {
    const { name, counts } = await getBullMqQueueCounts(key);
    queuesSnapshot[key] = { name, counts: counts || {} };
  }

  const dlq = queuesSnapshot.deadLetter?.counts || {};
  return {
    enabled: true,
    mode: "bullmq",
    redis: Boolean(String(process.env.REDIS_URL || "").trim()),
    dlqDepth: (dlq.waiting || 0) + (dlq.delayed || 0) + (dlq.failed || 0),
    queues: queuesSnapshot,
  };
}

/**
 * List jobs currently in the DLQ.
 * @param {{ start?: number; limit?: number }} [opts]
 */
export async function listDlqJobs(opts = {}) {
  if (!isBullMqEnabled()) return { enabled: false, items: [], count: 0 };

  const start = Math.max(0, Number(opts.start) || 0);
  const limit = Math.min(Math.max(1, Number(opts.limit) || 25), 100);
  const queue = await getBullMqQueue("deadLetter");
  const jobs = await queue.getJobs(
    ["waiting", "delayed", "failed", "completed"],
    start,
    start + limit - 1
  );
  const items = jobs.map(summarizeDlqJob);
  const counts = await queue.getJobCounts("waiting", "delayed", "failed");
  return {
    enabled: true,
    queue: EVENT_BUS_QUEUES.deadLetter.name,
    start,
    limit,
    count: items.length,
    depth: (counts.waiting || 0) + (counts.delayed || 0) + (counts.failed || 0),
    items,
  };
}

/**
 * Re-enqueue a DLQ job onto its original queue.
 * @param {string} jobId
 */
export async function replayDlqJob(jobId) {
  if (!isBullMqEnabled()) return { ok: false, reason: "bullmq_disabled" };
  const id = String(jobId || "").trim();
  if (!id) return { ok: false, reason: "job_id_required" };

  const dlq = await getBullMqQueue("deadLetter");
  const job = await dlq.getJob(id);
  if (!job) return { ok: false, reason: "not_found", jobId: id };

  const data = job.data || {};
  const originalQueueName = data.originalQueue;
  const event = data.event;
  if (!originalQueueName || !event) {
    return { ok: false, reason: "invalid_dlq_payload", jobId: id };
  }

  const queueKey = resolveQueueKeyByName(originalQueueName);
  if (!queueKey) return { ok: false, reason: "unknown_original_queue", originalQueue: originalQueueName };

  const target = await getBullMqQueue(queueKey);
  const eventType = event.event || event.type || "dlq.replay";
  const replayed = await target.add(String(eventType), event, { jobId: undefined });
  await job.remove();

  return {
    ok: true,
    jobId: id,
    replayedJobId: replayed.id,
    targetQueue: originalQueueName,
    queueKey,
    eventType,
  };
}

/**
 * Permanently remove a job from the DLQ without replay.
 * @param {string} jobId
 */
export async function discardDlqJob(jobId) {
  if (!isBullMqEnabled()) return { ok: false, reason: "bullmq_disabled" };
  const id = String(jobId || "").trim();
  if (!id) return { ok: false, reason: "job_id_required" };

  const dlq = await getBullMqQueue("deadLetter");
  const job = await dlq.getJob(id);
  if (!job) return { ok: false, reason: "not_found", jobId: id };

  await job.remove();
  return { ok: true, jobId: id, discarded: true };
}
