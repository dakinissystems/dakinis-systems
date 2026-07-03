export const config = {
  port: Number(process.env.PORT) || 4081,
  service: "dakinis-notifications",
  redisUrl: process.env.REDIS_URL || "",
  queueName: process.env.NOTIFICATIONS_QUEUE || "dakinis:notifications",
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
