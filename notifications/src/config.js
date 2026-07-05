export const config = {
  port: Number(process.env.PORT) || 4081,
  service: "dakinis-notifications",
  redisUrl: process.env.REDIS_URL || "",
  queueName: process.env.NOTIFICATIONS_QUEUE || "dakinis:notifications",
  databaseUrl: process.env.DATABASE_URL || "",
  databaseSsl: process.env.DATABASE_SSL === "true",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFrom: process.env.RESEND_FROM || "Dakinis Systems <noreply@dakinissystems.com>",
};

/** Channels from @dakinis/shared-ai/notifications (mirror until wired). */
export const CHANNELS = [
  "email",
  "push",
  "sms",
  "whatsapp",
  "discord",
  "slack",
  "webhooks",
  "in-app",
];
