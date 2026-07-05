import { getStripe } from "./stripe.js";
import { onCheckoutCompleted } from "./webhooks.js";

/**
 * Idempotent sync after Stripe Checkout — same path as webhook checkout.session.completed.
 * @param {string} sessionId
 */
export async function syncPaidCheckoutSession(sessionId) {
  const stripe = getStripe();
  if (!stripe) throw new Error("stripe_not_configured");

  const id = String(sessionId || "").trim();
  if (!id) throw new Error("invalid_session_id");

  const session = await stripe.checkout.sessions.retrieve(id);
  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) {
    return {
      ok: false,
      reason: "not_paid",
      paymentStatus: session.payment_status,
      status: session.status,
    };
  }

  await onCheckoutCompleted(session);

  return {
    ok: true,
    sessionId: session.id,
    businessId: session.metadata?.business_id || session.metadata?.tenant_id || null,
    plan: session.metadata?.plan_code || null,
    paymentStatus: session.payment_status,
  };
}
