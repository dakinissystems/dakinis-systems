/**
 * Minimal background job API over BullMQ (or in-memory fallback).
 * Products should use enqueue/schedule/cancel — not import BullMQ directly.
 */

/** @typedef {{ delayMs?: number; attempts?: number; jobId?: string; queue?: string }} BackgroundEnqueueOpts */

/** @type {Map<string, { id: string; name: string; payload: unknown; runAt: number; cancelled?: boolean }>} */
const memoryJobs = new Map();
let memorySeq = 0;

/**
 * @param {string} name
 * @param {unknown} payload
 * @param {BackgroundEnqueueOpts} [opts]
 */
export async function enqueue(name, payload = {}, opts = {}) {
  const id = opts.jobId || `bg_${Date.now()}_${++memorySeq}`;
  const runAt = Date.now() + (opts.delayMs || 0);

  if (await tryBullMqEnqueue(name, payload, { ...opts, jobId: id })) {
    return { id, backend: "bullmq", name };
  }

  memoryJobs.set(id, { id, name, payload, runAt });
  return { id, backend: "memory", name };
}

/**
 * @param {string} name
 * @param {unknown} payload
 * @param {Date | number | string} runAt
 * @param {BackgroundEnqueueOpts} [opts]
 */
export async function schedule(name, payload, runAt, opts = {}) {
  const at = runAt instanceof Date ? runAt.getTime() : new Date(runAt).getTime();
  const delayMs = Math.max(0, at - Date.now());
  return enqueue(name, payload, { ...opts, delayMs });
}

/**
 * @param {string} jobId
 */
export async function cancel(jobId) {
  const id = String(jobId || "").trim();
  if (!id) return { cancelled: false };

  if (await tryBullMqCancel(id)) {
    return { cancelled: true, backend: "bullmq", id };
  }

  const job = memoryJobs.get(id);
  if (!job) return { cancelled: false, id };
  job.cancelled = true;
  memoryJobs.delete(id);
  return { cancelled: true, backend: "memory", id };
}

/**
 * Drain due in-memory jobs (tests / local without Redis).
 * @param {(job: { id: string; name: string; payload: unknown }) => Promise<void> | void} handler
 */
export async function drainMemory(handler) {
  const now = Date.now();
  for (const [id, job] of [...memoryJobs.entries()]) {
    if (job.cancelled || job.runAt > now) continue;
    memoryJobs.delete(id);
    await handler({ id: job.id, name: job.name, payload: job.payload });
  }
}

/** @internal test helper */
export function _resetMemoryBackground() {
  memoryJobs.clear();
  memorySeq = 0;
}

/**
 * @param {string} name
 * @param {unknown} payload
 * @param {BackgroundEnqueueOpts & { jobId: string }} opts
 */
async function tryBullMqEnqueue(name, payload, opts) {
  const redisUrl = String(process.env.REDIS_URL || "").trim();
  const enabled =
    String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq" && Boolean(redisUrl);
  if (!enabled) return false;

  try {
    const { Queue } = await import("bullmq");
    const queueName = opts.queue || process.env.DAKINIS_BACKGROUND_QUEUE || "dakinis-background";
    const queue = new Queue(queueName, {
      connection: { url: redisUrl, maxRetriesPerRequest: null },
    });
    await queue.add(
      name,
      { name, payload },
      {
        jobId: opts.jobId,
        delay: opts.delayMs || 0,
        attempts: opts.attempts || 3,
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    );
    await queue.close();
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} jobId
 */
async function tryBullMqCancel(jobId) {
  const redisUrl = String(process.env.REDIS_URL || "").trim();
  const enabled =
    String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq" && Boolean(redisUrl);
  if (!enabled) return false;

  try {
    const { Queue } = await import("bullmq");
    const queueName = process.env.DAKINIS_BACKGROUND_QUEUE || "dakinis-background";
    const queue = new Queue(queueName, {
      connection: { url: redisUrl, maxRetriesPerRequest: null },
    });
    const job = await queue.getJob(jobId);
    if (job) await job.remove();
    await queue.close();
    return Boolean(job);
  } catch {
    return false;
  }
}

export const background = { enqueue, schedule, cancel, drainMemory };
