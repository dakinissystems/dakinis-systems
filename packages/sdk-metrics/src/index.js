/**
 * Lightweight in-process metrics for SDK calls (hits, errors, latency, cache).
 */
export function createMetricsModule() {
  const counters = {
    calls: 0,
    errors: 0,
    retries: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
  /** @type {number[]} */
  const latencies = [];
  const MAX_SAMPLES = 200;

  return {
    /**
     * @param {{ ok?: boolean; latencyMs?: number; retried?: boolean; cached?: boolean }} [sample]
     */
    record(sample = {}) {
      counters.calls += 1;
      if (sample.ok === false) counters.errors += 1;
      if (sample.retried) counters.retries += 1;
      if (sample.cached === true) counters.cacheHits += 1;
      if (sample.cached === false) counters.cacheMisses += 1;
      if (typeof sample.latencyMs === "number") {
        latencies.push(sample.latencyMs);
        if (latencies.length > MAX_SAMPLES) latencies.shift();
      }
    },

    /**
     * @returns {{
     *   calls: number;
     *   errors: number;
     *   retries: number;
     *   cacheHits: number;
     *   cacheMisses: number;
     *   latencyMs: { count: number; avg: number; p95: number };
     * }}
     */
    snapshot() {
      const sorted = [...latencies].sort((a, b) => a - b);
      const count = sorted.length;
      const avg = count ? sorted.reduce((a, b) => a + b, 0) / count : 0;
      const p95 = count ? sorted[Math.min(count - 1, Math.floor(count * 0.95))] : 0;
      return {
        ...counters,
        latencyMs: {
          count,
          avg: Math.round(avg * 100) / 100,
          p95,
        },
      };
    },

    reset() {
      counters.calls = 0;
      counters.errors = 0;
      counters.retries = 0;
      counters.cacheHits = 0;
      counters.cacheMisses = 0;
      latencies.length = 0;
    },
  };
}
