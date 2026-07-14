import { mapSaPlanToLicenseType } from "./streamautomator-legacy.js";

function resolveStreamAutomatorApiBase() {
  const explicit = String(process.env.STREAMAUTOMATOR_INTERNAL_URL || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
    return "http://streamautomator-api.railway.internal:3001";
  }
  return String(process.env.STREAMAUTOMATOR_API_URL || "https://api.streamautomator.com").replace(
    /\/$/,
    "",
  );
}

function serviceKey() {
  return String(
    process.env.DAKINIS_INTERNAL_SERVICE_KEY ||
      process.env.INTERNAL_API_KEY ||
      "",
  ).trim();
}

/**
 * After central billing processes an SA plan, push license state back to StreamAutomator API.
 *
 * @param {{
 *   planCode?: string | null;
 *   saLicenseType?: string | null;
 *   saUserId?: string | null;
 *   platformUserId?: string | null;
 *   stripeCustomerId?: string | null;
 *   stripeSubscriptionId?: string | null;
 *   status?: string;
 *   currentPeriodEnd?: string | Date | null;
 * }} payload
 */
export async function notifyStreamAutomatorLicenseSync(payload) {
  const key = serviceKey();
  if (!key) return { skipped: "no_service_key" };

  const planCode = payload.planCode || null;
  const licenseType =
    payload.saLicenseType || mapSaPlanToLicenseType(planCode) || null;
  if (!licenseType) return { skipped: "no_license_mapping" };

  if (!payload.saUserId && !payload.platformUserId) {
    return { skipped: "no_user_ref" };
  }

  const base = resolveStreamAutomatorApiBase();
  const url = `${base}/api/internal/billing/license-sync`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planCode,
        saLicenseType: licenseType,
        saUserId: payload.saUserId || null,
        platformUserId: payload.platformUserId || null,
        stripeCustomerId: payload.stripeCustomerId || null,
        stripeSubscriptionId: payload.stripeSubscriptionId || null,
        status: payload.status || "active",
        currentPeriodEnd: payload.currentPeriodEnd
          ? new Date(payload.currentPeriodEnd).toISOString()
          : null,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      console.warn("[billing] SA license fan-out failed:", res.status, text.slice(0, 200));
      return { ok: false, status: res.status, body: data };
    }

    return { ok: true, body: data };
  } catch (err) {
    console.warn(
      "[billing] SA license fan-out error:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: err instanceof Error ? err.message : "fanout_failed" };
  }
}

/**
 * @param {import("stripe").Stripe.Checkout.Session} session
 * @param {{ plan?: string; stripeSubscriptionId?: string; status?: string; currentPeriodEnd?: Date | null }} [fields]
 */
export async function maybeFanOutStreamAutomatorCheckout(session, fields = {}) {
  const planCode = session.metadata?.plan_code || fields.plan || null;
  const productKey = session.metadata?.product_key || null;
  const isSaPlan = productKey === "streamautomator" || (planCode && planCode.startsWith("sa-"));
  if (!isSaPlan) return { skipped: "not_sa_plan" };

  return notifyStreamAutomatorLicenseSync({
    planCode,
    saLicenseType: session.metadata?.sa_license_type || null,
    saUserId: session.metadata?.sa_user_id || null,
    platformUserId: session.metadata?.user_id || null,
    stripeCustomerId:
      typeof session.customer === "string" ? session.customer : session.customer?.id || null,
    stripeSubscriptionId:
      fields.stripeSubscriptionId ||
      (typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id) ||
      null,
    status: fields.status || "active",
    currentPeriodEnd: fields.currentPeriodEnd || null,
  });
}
