import Stripe from "stripe";
import { config } from "./config.js";

/** @type {Stripe | null} */
let client = null;

export function getStripe() {
  if (!config.stripeSecretKey) return null;
  if (!client) {
    client = new Stripe(config.stripeSecretKey);
  }
  return client;
}

/**
 * @param {string | Buffer} rawBody
 * @param {string} signatureHeader
 */
export function constructWebhookEvent(rawBody, signatureHeader) {
  const stripe = getStripe();
  if (!stripe || !config.stripeWebhookSecret) {
    return { ok: false, reason: "webhook_secret_not_configured" };
  }
  if (!signatureHeader) {
    return { ok: false, reason: "missing_signature" };
  }
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signatureHeader,
      config.stripeWebhookSecret
    );
    return { ok: true, event };
  } catch (err) {
    return {
      ok: false,
      reason: "signature_mismatch",
      message: err instanceof Error ? err.message : "invalid_signature",
    };
  }
}

/** @param {string | undefined | null} priceId */
export function planCodeFromPriceId(priceId) {
  if (!priceId) return null;
  return config.stripePriceToPlan[priceId] || null;
}

/** @param {string | null | undefined} id */
export function isStripeCustomerId(id) {
  return typeof id === "string" && /^cus_[A-Za-z0-9]+$/.test(id);
}
