import { query } from "./db.js";

/**
 * @param {string} stripeEventId
 * @param {string} type
 * @param {unknown} payload
 */
export async function recordWebhookEvent(stripeEventId, type, payload) {
  const existing = await query(
    `SELECT id FROM billing.stripe_webhook_events WHERE stripe_event_id = $1`,
    [stripeEventId]
  );
  if (existing.rowCount > 0) {
    return { duplicate: true };
  }

  await query(
    `INSERT INTO billing.stripe_webhook_events (stripe_event_id, type, payload)
     VALUES ($1, $2, $3::jsonb)`,
    [stripeEventId, type, JSON.stringify(payload ?? {})]
  );
  return { duplicate: false };
}

/**
 * @param {{ userId: string; stripeCustomerId: string; email?: string | null }} input
 */
export async function upsertCustomer({ userId, stripeCustomerId, email }) {
  const result = await query(
    `INSERT INTO billing.customers (user_id, stripe_customer_id, email, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id) DO UPDATE SET
       stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, billing.customers.stripe_customer_id),
       email = COALESCE(EXCLUDED.email, billing.customers.email),
       updated_at = now()
     RETURNING id, user_id, stripe_customer_id, email`,
    [userId, stripeCustomerId, email ?? null]
  );
  return result.rows[0];
}

/** @param {string} userId */
export async function getCustomerByUserId(userId) {
  const result = await query(
    `SELECT id, user_id, stripe_customer_id, email
     FROM billing.customers
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

/** @param {string} stripeCustomerId */
export async function getCustomerByStripeId(stripeCustomerId) {
  const result = await query(
    `SELECT id, user_id, stripe_customer_id, email
     FROM billing.customers
     WHERE stripe_customer_id = $1`,
    [stripeCustomerId]
  );
  return result.rows[0] || null;
}

/**
 * @param {{
 *   tenantId?: string | null;
 *   userId?: string | null;
 *   plan: string;
 *   stripeCustomerId?: string | null;
 *   stripeSubscriptionId: string;
 *   status?: string | null;
 *   currentPeriodEnd?: Date | null;
 *   cancelAtPeriodEnd?: boolean;
 * }} input
 */
export async function upsertSubscription(input) {
  const result = await query(
    `INSERT INTO billing.subscriptions (
       tenant_id, user_id, plan, stripe_customer_id, stripe_subscription_id,
       status, current_period_end, cancel_at_period_end, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (stripe_subscription_id) DO UPDATE SET
       tenant_id = COALESCE(EXCLUDED.tenant_id, billing.subscriptions.tenant_id),
       user_id = COALESCE(EXCLUDED.user_id, billing.subscriptions.user_id),
       plan = EXCLUDED.plan,
       stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, billing.subscriptions.stripe_customer_id),
       status = EXCLUDED.status,
       current_period_end = EXCLUDED.current_period_end,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       updated_at = now()
     RETURNING id, tenant_id, user_id, plan, status, current_period_end, stripe_subscription_id`,
    [
      input.tenantId || null,
      input.userId || null,
      input.plan,
      input.stripeCustomerId || null,
      input.stripeSubscriptionId,
      input.status || null,
      input.currentPeriodEnd || null,
      input.cancelAtPeriodEnd ?? false,
    ]
  );
  return result.rows[0];
}

/** @param {string} tenantId */
export async function getSubscriptionByTenantId(tenantId) {
  const result = await query(
    `SELECT plan, status, current_period_end, stripe_subscription_id, cancel_at_period_end, updated_at
     FROM billing.subscriptions
     WHERE tenant_id = $1
       AND status IN ('active', 'trialing', 'past_due')
     ORDER BY updated_at DESC
     LIMIT 1`,
    [tenantId]
  );
  if (result.rowCount > 0) return result.rows[0];

  const fallback = await query(
    `SELECT plan, status, current_period_end, stripe_subscription_id, cancel_at_period_end, updated_at
     FROM billing.subscriptions
     WHERE tenant_id = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [tenantId]
  );
  return fallback.rows[0] || null;
}

/**
 * @param {{
 *   customerId: string;
 *   stripeInvoiceId: string;
 *   amountDue: number;
 *   currency?: string;
 *   status?: string | null;
 *   pdfUrl?: string | null;
 * }} input
 */
export async function upsertInvoice(input) {
  const result = await query(
    `INSERT INTO billing.invoices (customer_id, stripe_invoice_id, amount_due, currency, status, pdf_url)
     VALUES ($1::uuid, $2, $3, $4, $5, $6)
     ON CONFLICT (stripe_invoice_id) DO UPDATE SET
       amount_due = EXCLUDED.amount_due,
       currency = EXCLUDED.currency,
       status = EXCLUDED.status,
       pdf_url = COALESCE(EXCLUDED.pdf_url, billing.invoices.pdf_url)
     RETURNING id, stripe_invoice_id, status, amount_due, currency`,
    [
      input.customerId,
      input.stripeInvoiceId,
      input.amountDue,
      input.currency || "EUR",
      input.status || null,
      input.pdfUrl || null,
    ]
  );
  return result.rows[0];
}

/**
 * @param {{
 *   tenantId?: string | null;
 *   userId?: string | null;
 *   metric: string;
 *   quantity: number;
 *   periodStart: string | Date;
 *   periodEnd: string | Date;
 *   metadata?: Record<string, unknown>;
 * }} input
 */
export async function recordUsage(input) {
  const result = await query(
    `INSERT INTO billing.usage (tenant_id, user_id, metric, quantity, period_start, period_end, metadata)
     VALUES ($1::uuid, $2::uuid, $3, $4, $5::timestamptz, $6::timestamptz, $7::jsonb)
     RETURNING id, tenant_id, metric, quantity, period_start, period_end`,
    [
      input.tenantId || null,
      input.userId || null,
      input.metric,
      input.quantity,
      input.periodStart,
      input.periodEnd,
      JSON.stringify(input.metadata || {}),
    ]
  );
  return result.rows[0];
}
