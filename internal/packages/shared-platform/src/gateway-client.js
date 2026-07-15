/**
 * Resilient HTTP client for Internal API / gateway proxies.
 */

export class GatewayClient {
  /**
   * @param {{
   *   baseUrl: string,
   *   apiKey?: string,
   *   fetch?: typeof fetch,
   *   timeoutMs?: number,
   *   retries?: number,
   * }} options
   */
  constructor(options) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey || "";
    this.fetchFn = options.fetch || fetch;
    this.timeoutMs = options.timeoutMs ?? 12_000;
    this.retries = options.retries ?? 2;
    /** @type {Map<string, { failures: number; openUntil: number }>} */
    this.breakers = new Map();
  }

  /**
   * @param {string} path
   * @param {RequestInit} [init]
   */
  async request(path, init = {}) {
    const key = `${init.method || "GET"} ${path}`;
    const breaker = this.breakers.get(key);
    if (breaker && breaker.openUntil > Date.now()) {
      throw new Error(`circuit_open:${key}`);
    }

    let lastError;
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      try {
        const res = await this.fetchWithTimeout(`${this.baseUrl}${path}`, init);
        if (res.status >= 500) {
          throw new Error(`upstream_${res.status}`);
        }
        this.breakers.delete(key);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = new Error(data.error || data.message || res.statusText || "request_failed");
          err.status = res.status;
          throw err;
        }
        return data;
      } catch (err) {
        lastError = err;
        const state = this.breakers.get(key) || { failures: 0, openUntil: 0 };
        state.failures += 1;
        if (state.failures >= 3) {
          state.openUntil = Date.now() + 30_000;
        }
        this.breakers.set(key, state);
        if (attempt >= this.retries) break;
        await sleep(200 * 2 ** attempt);
      }
    }
    throw lastError;
  }

  /**
   * @param {string} url
   * @param {RequestInit} init
   */
  async fetchWithTimeout(url, init) {
    const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.fetchFn(url, { ...init, headers, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
