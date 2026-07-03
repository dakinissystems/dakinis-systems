import { getStripe, planCodeFromPriceId } from "./stripe.js";
import { getPlanById } from "./plans.js";
import { config } from "./config.js";
import { getCustomerByUserId, upsertCustomer } from "./repository.js";

/**
 * @param {{
 *   tenantId?: string | null;
 *   userId?: string | null;
 *   planId: string;
 *   email?: string;
 *   successUrl?: string;
 *   cancelUrl?: string;
 * }} input
 */
export async function createCheckoutSession(input) {
  const stripe = getStripe();
  if (!stripe) throw new Error("stripe_not_configured");

  const plan = getPlanById(input.planId);
  if (!plan?.stripePriceId) throw new Error("plan_not_available");

  let stripeCustomerId = null;
  if (input.userId) {
    const existing = await getCustomerByUserId(input.userId);
    if (existing?.stripe_customer_id) {
      stripeCustomerId = existing.stripe_customer_id;
    }
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: input.email,
      metadata: {
        ...(input.userId ? { user_id: input.userId } : {}),
        ...(input.tenantId ? { tenant_id: input.tenantId, business_id: input.tenantId } : {}),
      },
    });
    stripeCustomerId = customer.id;
    if (input.userId) {
      await upsertCustomer({
        userId: input.userId,
        stripeCustomerId,
        email: input.email || customer.email,
      });
    }
  }

  const successUrl =
    input.successUrl || `${config.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = input.cancelUrl || `${config.frontendUrl}/precios`;

  const metadata = {
    ...(input.tenantId ? { tenant_id: input.tenantId, business_id: input.tenantId } : {}),
    ...(input.userId ? { user_id: input.userId } : {}),
    plan_code: input.planId,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: { metadata },
  });

  return { url: session.url, sessionId: session.id };
}

/**
 * @param {{ userId: string; returnUrl?: string }} input
 */
export async function createPortalSession(input) {
  const stripe = getStripe();
  if (!stripe) throw new Error("stripe_not_configured");

  const customer = await getCustomerByUserId(input.userId);
  if (!customer?.stripe_customer_id) throw new Error("customer_not_found");

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: input.returnUrl || config.frontendUrl,
  });

  return { url: session.url };
}

/** @param {string} sessionId */
export async function getCheckoutSession(sessionId) {
  const stripe = getStripe();
  if (!stripe) throw new Error("stripe_not_configured");

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const plan =
    session.metadata?.plan_code ||
    planCodeFromPriceId(
      typeof session.line_items === "object" && session.line_items?.data?.[0]?.price?.id
        ? session.line_items.data[0].price.id
        : null
    );

  return {
    sessionId: session.id,
    plan: plan || null,
    paymentStatus: session.payment_status,
    status: session.status,
    businessId: session.metadata?.business_id || session.metadata?.tenant_id || null,
  };
}

/** @param {import("stripe").Stripe.Subscription} sub */
export function subscriptionFieldsFromStripe(sub, meta = {}) {
  const priceId = sub.items?.data?.[0]?.price?.id;
  const plan =
    meta.planCode ||
    sub.metadata?.plan_code ||
    planCodeFromPriceId(priceId) ||
    "starter";

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;

  const tenantId =
    meta.tenantId ||
    sub.metadata?.business_id ||
    sub.metadata?.tenant_id ||
    null;

  return {
    tenantId,
    userId: meta.userId || sub.metadata?.user_id || null,
    plan,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}
