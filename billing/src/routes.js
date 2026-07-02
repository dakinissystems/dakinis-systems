import { config } from "./config.js";

/** @typedef {{ status: number; body: unknown; headers?: Record<string, string> }} RouteResult */

/** @type {Record<string, (req: import("node:http").IncomingMessage) => RouteResult | Promise<RouteResult>>} */
export const routes = {
  "GET /health": () => ({
    status: 200,
    body: {
      ok: true,
      service: config.service,
      version: "0.1.0-scaffold",
      stripe: config.stripeConfigured ? "configured" : "not_configured",
    },
  }),

  "GET /v1/plans": () => ({
    status: 501,
    body: {
      error: "not_implemented",
      message: "Plans API — implement after Stripe migration from Core",
      schema: config.schema,
    },
  }),

  "POST /v1/webhooks/stripe": () => ({
    status: 501,
    body: {
      error: "not_implemented",
      message: "Stripe webhooks — migrate from dakinis-core",
    },
  }),

  "GET /v1/subscriptions/:tenantId": () => ({
    status: 501,
    body: { error: "not_implemented", message: "Subscription lookup for Internal API" },
  }),
};
