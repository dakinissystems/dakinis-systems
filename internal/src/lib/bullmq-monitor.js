/**
 * BullMQ DLQ monitor — wraps @dakinis/shared-ai when DAKINIS_EVENT_BUS=bullmq.
 */

export function isBullMqBus() {
  return String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq";
}

async function loadBus() {
  return import("@dakinis/shared-ai/bullmq-bus");
}

export async function getBusHealthSummary() {
  if (!isBullMqBus()) {
    return {
      mode: process.env.DAKINIS_EVENT_BUS || "redis-list",
      enabled: false,
    };
  }

  try {
    const bus = await loadBus();
    if (!bus.isBullMqEnabled()) {
      return { mode: "bullmq", enabled: false, reason: "missing_redis_url" };
    }
    const dlq = await bus.listDlqJobs({ limit: 1 });
    return {
      mode: "bullmq",
      enabled: true,
      dlqDepth: dlq.depth ?? 0,
      dlqQueue: dlq.queue || "dakinis.dlq",
    };
  } catch (err) {
    return {
      mode: "bullmq",
      enabled: false,
      reason: "bus_error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getBusStatus() {
  if (!isBullMqBus()) {
    return { enabled: false, mode: process.env.DAKINIS_EVENT_BUS || "redis-list" };
  }
  const bus = await loadBus();
  return bus.getEventBusQueueSnapshot();
}

/**
 * @param {URLSearchParams} params
 */
export async function listDeadLetterJobs(params) {
  if (!isBullMqBus()) {
    return { enabled: false, items: [], count: 0 };
  }
  const bus = await loadBus();
  return bus.listDlqJobs({
    start: Number(params.get("start") || 0),
    limit: Number(params.get("limit") || 25),
  });
}

export async function replayDeadLetterJob(jobId) {
  if (!isBullMqBus()) return { ok: false, reason: "bullmq_disabled" };
  const bus = await loadBus();
  return bus.replayDlqJob(jobId);
}

export async function discardDeadLetterJob(jobId) {
  if (!isBullMqBus()) return { ok: false, reason: "bullmq_disabled" };
  const bus = await loadBus();
  return bus.discardDlqJob(jobId);
}
