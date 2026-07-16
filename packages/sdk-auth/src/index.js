import { GatewayClient } from "@dakinis/shared-platform/gateway-client";

/**
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch; timeoutMs?: number; retries?: number }} [opts]
 */
function createInternalClient(opts = {}) {
  return new GatewayClient({
    baseUrl:
      opts.baseUrl || process.env.DAKINIS_INTERNAL_URL || "http://localhost/internal",
    apiKey: opts.apiKey || process.env.DAKINIS_INTERNAL_SERVICE_KEY || "",
    fetch: opts.fetch,
    timeoutMs: opts.timeoutMs,
    retries: opts.retries,
  });
}

/**
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
 */
export function createAuthModule(opts = {}) {
  const client = createInternalClient(opts);
  return {
    /**
     * @param {string} userId
     */
    me(userId) {
      return client.request(`/users/${encodeURIComponent(userId)}`);
    },
  };
}

export { createInternalClient };
