export const config = {
  port: Number(process.env.PORT) || 4083,
  service: "dakinis-internal-api",
  redisUrl: process.env.REDIS_URL || "",
  eventsQueue: process.env.DAKINIS_EVENTS_QUEUE || "dakinis:events",
  serviceKey: process.env.DAKINIS_INTERNAL_SERVICE_KEY || process.env.DAKINIS_INTERNAL_API_KEY || "",
  notificationsUrl:
    process.env.DAKINIS_NOTIFICATIONS_URL || "http://notifications.railway.internal:8080",
  searchUrl: process.env.DAKINIS_SEARCH_URL || "http://search.railway.internal:8080",
  billingUrl: process.env.DAKINIS_BILLING_URL || "http://billing.railway.internal:8080",
};
