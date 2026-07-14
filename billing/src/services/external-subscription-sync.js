import { mapSaLicenseToPlanCode, productKeyFromPlanCode } from "../adapters/streamautomator-legacy.js";
import { publishBillingEvent } from "../events.js";
import { upsertCustomer, upsertSubscription } from "../repository.js";

/**
 * Sync subscription state from a product adapter (e.g. StreamAutomator legacy Stripe).
 *
 * @param {{
 *   productKey?: string;
 *   tenantId: string;
 *   userId: string;
 *   planCode?: string;
 *   saLicenseType?: string;
 *   stripeCustomerId?: string | null;
 *   stripeSubscriptionId?: string | null;
 *   status?: string;
 *   currentPeriodEnd?: string | Date | null;
 *   cancelAtPeriodEnd?: boolean;
 * }} input
 */
export async function syncExternalSubscription(input) {
  const {
    tenantId,
    userId,
    stripeCustomerId,
    stripeSubscriptionId,
    status = "active",
    currentPeriodEnd,
    cancelAtPeriodEnd = false,
  } = input;

  if (!tenantId || !userId) {
    throw new Error("missing_tenant_or_user");
  }

  const planCode =
    input.planCode || mapSaLicenseToPlanCode(input.saLicenseType) || null;
  if (!planCode) {
    throw new Error("invalid_plan");
  }

  const productKey = input.productKey || productKeyFromPlanCode(planCode);

  if (stripeCustomerId) {
    await upsertCustomer({
      userId,
      stripeCustomerId,
      email: null,
    });
  }

  const periodEnd =
    currentPeriodEnd instanceof Date
      ? currentPeriodEnd
      : currentPeriodEnd
        ? new Date(currentPeriodEnd)
        : null;

  const row = await upsertSubscription({
    tenantId,
    userId,
    plan: planCode,
    stripeCustomerId: stripeCustomerId || null,
    stripeSubscriptionId: stripeSubscriptionId || `legacy:${productKey}:${tenantId}:${planCode}`,
    status,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd,
  });

  const payload = {
    tenantId,
    userId,
    businessId: tenantId,
    plan: planCode,
    productKey,
    status,
    stripeSubscriptionId: row.stripe_subscription_id,
    saLicenseType: input.saLicenseType || null,
    source: "external_sync",
  };

  const eventType =
    status === "active" || status === "trialing"
      ? "billing.payment_succeeded"
      : status === "canceled" || status === "unpaid"
        ? "billing.payment_failed"
        : "billing.payment_succeeded";

  await publishBillingEvent(eventType, payload);
  await publishBillingEvent("user.plan_changed", payload);

  if (productKey === "streamautomator") {
    const { notifyStreamAutomatorLicenseSync } = await import("../adapters/sa-fanout.js");
    await notifyStreamAutomatorLicenseSync({
      planCode,
      saLicenseType: input.saLicenseType || null,
      saUserId: null,
      platformUserId: userId,
      stripeCustomerId: stripeCustomerId || null,
      stripeSubscriptionId: stripeSubscriptionId || null,
      status,
      currentPeriodEnd: periodEnd,
    });
  }

  return { subscription: row, planCode, productKey };
}
