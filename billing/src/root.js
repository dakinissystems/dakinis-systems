import { config } from "./config.js";
import { renderStatusPage } from "./status-page.js";

export function getRootPage() {
  return renderStatusPage({
    service: config.service,
    title: "Dakinis Billing",
    phase: "Fase 8 · Stripe + Supabase",
    description:
      "Platform billing API (Stripe, plans, invoices). JSON endpoints for checkout, subscriptions, and webhooks.",
    endpoints: [
      "GET /health",
      "GET /v1/plans",
      "GET /v1/subscriptions/:tenantId",
      "POST /v1/checkout",
      "POST /v1/portal",
      "POST /v1/usage",
      "POST /v1/webhooks/stripe",
    ],
  });
}
