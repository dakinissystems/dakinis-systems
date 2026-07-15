export const config = {
  port: Number(process.env.PORT) || 4083,
  service: "dakinis-internal-api",
  redisUrl: process.env.REDIS_URL || "",
  eventsQueue: process.env.DAKINIS_EVENTS_QUEUE || "dakinis:events",
  serviceKey: process.env.DAKINIS_INTERNAL_SERVICE_KEY || process.env.DAKINIS_INTERNAL_API_KEY || "",
  notificationsUrl:
    process.env.DAKINIS_NOTIFICATIONS_URL || "http://dakinis-notifications.railway.internal:4081",
  searchUrl: process.env.DAKINIS_SEARCH_URL || "http://dakinis-search.railway.internal:4082",
  billingUrl: process.env.DAKINIS_BILLING_URL || "http://dakinis-billing.railway.internal:4080",
  knowledgeUrl: process.env.DAKINIS_KNOWLEDGE_URL || "http://dakinis-knowledge.railway.internal:4084",
  akoenetUrl: process.env.AKOENET_API_URL || process.env.AKOENET_BACKEND_URL || "",
  databaseUrl: process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL || "",
  databaseSsl: process.env.DATABASE_SSL === "true",
};
