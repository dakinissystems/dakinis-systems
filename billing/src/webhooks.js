import { getStripe } from "./stripe.js";
import { subscriptionFieldsFromStripe } from "./checkout.js";
import { publishBillingEvent } from "./events.js";
import { maybeFanOutStreamAutomatorCheckout } from "./adapters/sa-fanout.js";
import { syncExternalSubscription } from "./services/external-subscription-sync.js";
import {
  getCustomerByStripeId,
  recordWebhookEvent,
  upsertCustomer,
  upsertInvoice,
  upsertSubscription,
} from "./repository.js";

/**
 * @param {import("stripe").Stripe.Event} event
 */
export async function handleStripeWebhook(event) {
  const duplicateCheck = await recordWebhookEvent(
    event.id,
    event.type,
    event.data.object
  );
  if (duplicateCheck.duplicate) {
    return { handled: true, duplicate: true, type: event.type };
  }

  switch (event.type) {
    case "checkout.session.completed":
      await onCheckoutCompleted(/** @type {import("stripe").Stripe.Checkout.Session} */ (event.data.object));
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await onSubscriptionUpsert(/** @type {import("stripe").Stripe.Subscription} */ (event.data.object));
      break;
    case "customer.subscription.deleted":
      await onSubscriptionDeleted(/** @type {import("stripe").Stripe.Subscription} */ (event.data.object));
      break;
    case "invoice.paid":
      await onInvoicePaid(/** @type {import("stripe").Stripe.Invoice} */ (event.data.object));
      break;
    case "invoice.payment_failed":
      await onInvoicePaymentFailed(/** @type {import("stripe").Stripe.Invoice} */ (event.data.object));
      break;
    default:
      console.log("[billing] stripe event ignored:", event.type);
  }

  return { handled: true, duplicate: false, type: event.type };
}

/** @param {ReturnType<typeof subscriptionFieldsFromStripe>} fields */
async function publishSubscriptionLifecycle(fields, type) {
  if (!fields.tenantId) return;
  const payload = {
    businessId: fields.tenantId,
    tenantId: fields.tenantId,
    userId: fields.userId || null,
    plan: fields.plan,
    productKey: fields.plan?.startsWith("sa-") ? "streamautomator" : "core",
    status: fields.status,
    stripeSubscriptionId: fields.stripeSubscriptionId,
  };
  await publishBillingEvent(type, payload);
  await publishBillingEvent("user.plan_changed", payload);
}

/** @param {import("stripe").Stripe.Checkout.Session} session */
export async function onCheckoutCompleted(session) {
  const tenantId = session.metadata?.business_id || session.metadata?.tenant_id;
  const userId = session.metadata?.user_id;
  const planCode = session.metadata?.plan_code;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const stripeSubId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (userId && stripeCustomerId) {
    await upsertCustomer({
      userId,
      stripeCustomerId,
      email: session.customer_details?.email || session.customer_email,
    });
  }

  if (!stripeSubId) {
    if (planCode?.startsWith("sa-") && session.mode === "payment" && tenantId && userId) {
      await syncExternalSubscription({
        productKey: "streamautomator",
        tenantId,
        userId,
        planCode,
        saLicenseType: session.metadata?.sa_license_type || null,
        stripeCustomerId,
        stripeSubscriptionId: null,
        status: "active",
      });
      await maybeFanOutStreamAutomatorCheckout(session, { plan: planCode, status: "active" });
    }
    return;
  }

  const stripe = getStripe();
  if (!stripe) return;

  const sub = await stripe.subscriptions.retrieve(stripeSubId);
  await onSubscriptionUpsert(sub, { tenantId, userId, planCode });
  await maybeFanOutStreamAutomatorCheckout(session, {
    plan: planCode,
    stripeSubscriptionId: stripeSubId,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
  });
}

/**
 * @param {import("stripe").Stripe.Subscription} sub
 * @param {{ tenantId?: string; userId?: string; planCode?: string }} [meta]
 */
async function onSubscriptionUpsert(sub, meta = {}) {
  const fields = subscriptionFieldsFromStripe(sub, {
    tenantId: meta.tenantId,
    userId: meta.userId,
    planCode: meta.planCode,
  });

  if (fields.userId && fields.stripeCustomerId) {
    await upsertCustomer({
      userId: fields.userId,
      stripeCustomerId: fields.stripeCustomerId,
      email: null,
    });
  }

  await upsertSubscription(fields);

  if (fields.status === "active" || fields.status === "trialing") {
    await publishSubscriptionLifecycle(fields, "billing.payment_succeeded");
  } else if (fields.status === "past_due" || fields.status === "unpaid") {
    await publishSubscriptionLifecycle(fields, "billing.payment_failed");
  }
}

/** @param {import("stripe").Stripe.Subscription} sub */
async function onSubscriptionDeleted(sub) {
  const fields = {
    ...subscriptionFieldsFromStripe(sub),
    status: "canceled",
    plan: "starter",
  };
  await upsertSubscription(fields);
  await publishSubscriptionLifecycle(fields, "billing.payment_failed");
}

/** @param {import("stripe").Stripe.Invoice} invoice */
async function onInvoicePaid(invoice) {
  await persistInvoice(invoice, invoice.status || "paid");

  const subId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;
  if (subId) {
    const stripe = getStripe();
    if (stripe) {
      const sub = await stripe.subscriptions.retrieve(subId);
      await onSubscriptionUpsert(sub);
    }
  }
}

/** @param {import("stripe").Stripe.Invoice} invoice */
async function onInvoicePaymentFailed(invoice) {
  await persistInvoice(invoice, invoice.status || "open");

  const subId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;
  if (!subId) return;

  const stripe = getStripe();
  if (!stripe) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  const fields = {
    ...subscriptionFieldsFromStripe(sub),
    status: "past_due",
  };
  await upsertSubscription(fields);
  await publishSubscriptionLifecycle(fields, "billing.payment_failed");
}

/** @param {import("stripe").Stripe.Invoice} invoice @param {string} status */
async function persistInvoice(invoice, status) {
  const stripeCustomerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!stripeCustomerId || !invoice.id) return;

  const customer = await getCustomerByStripeId(stripeCustomerId);
  if (!customer) {
    console.warn("[billing] invoice without local customer:", stripeCustomerId);
    return;
  }

  await upsertInvoice({
    customerId: customer.id,
    stripeInvoiceId: invoice.id,
    amountDue: (invoice.amount_due || 0) / 100,
    currency: (invoice.currency || "eur").toUpperCase(),
    status,
    pdfUrl: invoice.invoice_pdf || null,
  });
}
