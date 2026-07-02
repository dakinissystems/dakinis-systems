export const config = {
  port: Number(process.env.PORT) || 4010,
  service: "dakinis-billing",
  schema: process.env.POSTGRES_SCHEMA || "billing",
  stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
  redisUrl: process.env.REDIS_URL || "",
};
