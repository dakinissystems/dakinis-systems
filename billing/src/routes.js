import { config } from "./config.js";
import { checkDbHealth } from "./db.js";
import { PUBLIC_PLANS, getPlanById } from "./plans.js";
import { constructWebhookEvent } from "./stripe.js";
import { handleStripeWebhook } from "./webhooks.js";
import { createCheckoutSession, createPortalSession, getCheckoutSession } from "./checkout.js";
import { requireInternalAuth } from "./auth.js";
import { getSubscriptionByTenantId, recordUsage } from "./repository.js";

/** @typedef {{ status: number; body: unknown; headers?: Record<string, string> }} RouteResult */

async function readRawBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

/**
 * @param {import("node:http").IncomingMessage} req
 */
async function readJsonBody(req) {
  const raw = await readRawBody(req);
  if (!raw.length) return {};
  return JSON.parse(raw.toString("utf8"));
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function plansForCore() {
  /** @type {Record<string, { checkoutAvailable: boolean; paymentLink: string | null; stripePriceId: string | null }>} */
  const plans = {};
  for (const plan of PUBLIC_PLANS) {
    plans[plan.id] = {
      checkoutAvailable: plan.checkoutAvailable,
      paymentLink: plan.paymentLink,
      stripePriceId: plan.stripePriceId,
    };
  }
  return plans;
}

/** @type {Record<string, (req: import("node:http").IncomingMessage) => RouteResult | Promise<RouteResult>>} */
export const routes = {
  "GET /health": async () => {
    const db = await checkDbHealth();
    return {
      status: 200,
      body: {
        ok: true,
        service: config.service,
        version: "0.2.0",
        stripe: config.stripeConfigured ? "configured" : "not_configured",
        webhook: config.stripeWebhookSecret ? "configured" : "not_configured",
        eventBus: process.env.DAKINIS_EVENT_BUS || "redis-list",
        database: db.ok ? "connected" : db.reason,
      },
    };
  },

  "GET /v1/plans": () => ({
    status: 200,
    body: {
      configured: config.stripeConfigured,
      plans: plansForCore(),
      catalog: PUBLIC_PLANS,
      schema: config.schema,
    },
  }),

  "POST /v1/webhooks/stripe": async (req) => {
    const raw = await readRawBody(req);
    const sig = req.headers["stripe-signature"];
    const verified = constructWebhookEvent(raw, typeof sig === "string" ? sig : "");
    if (!verified.ok) {
      return {
        status: verified.reason === "webhook_secret_not_configured" ? 501 : 400,
        body: {
          error: verified.reason,
          message: verified.message || "Stripe webhook verification failed",
        },
      };
    }

    try {
      const result = await handleStripeWebhook(verified.event);
      return {
        status: 200,
        body: {
          received: true,
          type: result.type,
          duplicate: result.duplicate || false,
        },
      };
    } catch (err) {
      console.error("[billing] webhook handler error:", err);
      return {
        status: 500,
        body: {
          error: "webhook_handler_failed",
          message: err instanceof Error ? err.message : "unknown",
        },
      };
    }
  },

  "GET /v1/subscriptions/:tenantId": async (req) => {
    const auth = requireInternalAuth(req, { required: false });
    if (!auth.ok) {
      return { status: auth.status, body: { error: auth.error } };
    }

    const path = (req.url || "").split("?")[0];
    const tenantId = path.replace("/v1/subscriptions/", "");
    if (!tenantId) {
      return { status: 400, body: { error: "invalid_tenant_id" } };
    }

    try {
      const row = await getSubscriptionByTenantId(tenantId);
      if (!row) {
        return {
          status: 200,
          body: {
            tenantId,
            planId: "free",
            status: "none",
            subscription: null,
          },
        };
      }

      return {
        status: 200,
        body: {
          tenantId,
          planId: row.plan,
          status: row.status,
          currentPeriodEnd: row.current_period_end,
          cancelAtPeriodEnd: row.cancel_at_period_end,
          stripeSubscriptionId: row.stripe_subscription_id,
        },
      };
    } catch (err) {
      if (err instanceof Error && err.message === "database_not_configured") {
        return { status: 503, body: { error: "database_not_configured" } };
      }
      throw err;
    }
  },

  "POST /v1/checkout": async (req) => {
    const auth = requireInternalAuth(req, { required: true });
    if (!auth.ok) {
      return { status: auth.status, body: { error: auth.error } };
    }

    const body = await readJsonBody(req);
    const { tenantId, userId, planId, email, successUrl, cancelUrl, businessId, plan } = body;
    const resolvedTenant = tenantId || businessId || null;
    const resolvedPlan = planId || plan;

    if (!resolvedPlan) {
      return { status: 400, body: { error: "missing_fields", required: ["planId or plan"] } };
    }
    if (!getPlanById(resolvedPlan)) {
      return { status: 400, body: { error: "invalid_plan" } };
    }
    if (!resolvedTenant) {
      return {
        status: 400,
        body: {
          error: "missing_tenant",
          message: "businessId/tenantId required — metadata sync to Core needs tenant",
        },
      };
    }

    try {
      const session = await createCheckoutSession({
        tenantId: resolvedTenant,
        userId: userId || null,
        planId: resolvedPlan,
        email,
        successUrl,
        cancelUrl,
      });
      return { status: 200, body: session };
    } catch (err) {
      const message = err instanceof Error ? err.message : "checkout_failed";
      const status = message === "stripe_not_configured" ? 503 : message === "plan_not_available" ? 400 : 502;
      return { status, body: { error: message } };
    }
  },

  "POST /v1/portal": async (req) => {
    const auth = requireInternalAuth(req, { required: true });
    if (!auth.ok) {
      return { status: auth.status, body: { error: auth.error } };
    }

    const body = await readJsonBody(req);
    const { userId, returnUrl } = body;
    if (!userId) {
      return { status: 400, body: { error: "invalid_user_id" } };
    }

    try {
      const session = await createPortalSession({ userId, returnUrl });
      return { status: 200, body: session };
    } catch (err) {
      const message = err instanceof Error ? err.message : "portal_failed";
      const status =
        message === "stripe_not_configured"
          ? 503
          : message === "customer_not_found"
            ? 404
            : 502;
      return { status, body: { error: message } };
    }
  },

  "GET /v1/checkout/sessions/:sessionId": async (req) => {
    const path = (req.url || "").split("?")[0];
    const sessionId = path.replace("/v1/checkout/sessions/", "");
    if (!sessionId) {
      return { status: 400, body: { error: "invalid_session_id" } };
    }

    try {
      const session = await getCheckoutSession(sessionId);
      return { status: 200, body: session };
    } catch (err) {
      const message = err instanceof Error ? err.message : "session_lookup_failed";
      const status = message === "stripe_not_configured" ? 503 : 404;
      return { status, body: { error: message } };
    }
  },

  "POST /v1/usage": async (req) => {
    const auth = requireInternalAuth(req, { required: true });
    if (!auth.ok) {
      return { status: auth.status, body: { error: auth.error } };
    }

    const body = await readJsonBody(req);
    const { tenantId, userId, metric, quantity, periodStart, periodEnd, metadata } = body;

    if (!metric || quantity == null || !periodStart || !periodEnd) {
      return {
        status: 400,
        body: {
          error: "missing_fields",
          required: ["metric", "quantity", "periodStart", "periodEnd"],
        },
      };
    }

    try {
      const row = await recordUsage({
        tenantId: tenantId || null,
        userId: userId || null,
        metric,
        quantity: Number(quantity),
        periodStart,
        periodEnd,
        metadata,
      });
      return { status: 201, body: { usage: row } };
    } catch (err) {
      if (err instanceof Error && err.message === "database_not_configured") {
        return { status: 503, body: { error: "database_not_configured" } };
      }
      throw err;
    }
  },
};
