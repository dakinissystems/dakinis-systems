import { createInternalClient } from "@dakinis/sdk-auth";

/**
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
 */
export function createBillingModule(opts = {}) {
  const client = createInternalClient(opts);

  return {
    plans() {
      return client.request("/billing/plans");
    },

    /** @param {string} tenantId */
    subscription(tenantId) {
      return client.request(`/billing/subscriptions/${encodeURIComponent(tenantId)}`);
    },

    /** @param {{ plan: string; email?: string; businessId?: string; userId?: string }} body */
    checkout(body) {
      return client.request("/billing/checkout", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    /** @param {{ userId: string; returnUrl?: string }} body */
    portal(body) {
      return client.request("/billing/portal", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  };
}
