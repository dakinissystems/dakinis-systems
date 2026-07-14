function buildStripePriceMaps() {
  const pairs = [
    ["starter", process.env.STRIPE_PRICE_STARTER_MONTHLY],
    ["growth", process.env.STRIPE_PRICE_GROWTH_MONTHLY],
    ["pro", process.env.STRIPE_PRICE_PRO_MONTHLY],
    ["lifeflow-plus", process.env.STRIPE_PRICE_LIFEFLOW_PLUS_MONTHLY],
    ["sa-creator-monthly", process.env.STRIPE_PRICE_SA_CREATOR_MONTHLY],
    ["sa-pro-monthly", process.env.STRIPE_PRICE_SA_PRO_MONTHLY],
    ["sa-lifetime", process.env.STRIPE_PRICE_SA_LIFETIME],
  ].filter(([, priceId]) => Boolean(priceId));

  return {
    priceToPlan: Object.fromEntries(pairs.map(([plan, priceId]) => [priceId, plan])),
    planToPrice: Object.fromEntries(pairs),
  };
}

function buildPaymentLinks() {
  return {
    starter: process.env.STRIPE_PAYMENT_LINK_STARTER || "",
    growth: process.env.STRIPE_PAYMENT_LINK_GROWTH || "",
    pro: process.env.STRIPE_PAYMENT_LINK_PRO || "",
    "lifeflow-plus": process.env.STRIPE_PAYMENT_LINK_LIFEFLOW_PLUS || "",
  };
}

const stripeMaps = buildStripePriceMaps();

export const config = {
  port: Number(process.env.PORT) || 4080,
  service: "dakinis-billing",
  schema: process.env.POSTGRES_SCHEMA || "billing",
  databaseUrl: process.env.DATABASE_URL || "",
  databaseSsl: process.env.DATABASE_SSL === "true",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
  stripePriceToPlan: stripeMaps.priceToPlan,
  stripePlanToPrice: stripeMaps.planToPrice,
  stripePaymentLinks: buildPaymentLinks(),
  frontendUrl: process.env.FRONTEND_URL || process.env.CORE_WEB_URL || "http://localhost:5173",
  internalApiKey:
    process.env.INTERNAL_API_KEY || process.env.DAKINIS_INTERNAL_SERVICE_KEY || "",
  redisUrl: process.env.REDIS_URL || "",
  eventsQueue: process.env.DAKINIS_EVENTS_QUEUE || "dakinis:events",
};
