/**
 * Canales del servicio Notifications (platform).
 */

export const NOTIFICATION_CHANNELS = {
  email: {
    id: "email",
    label: "Email",
    provider: "resend|sendgrid",
    status: "planned",
  },
  push: {
    id: "push",
    label: "Push",
    provider: "web-push|fcm",
    status: "planned",
  },
  sms: {
    id: "sms",
    label: "SMS",
    provider: "twilio",
    status: "planned",
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    provider: "meta-cloud-api",
    status: "planned",
  },
  discord: {
    id: "discord",
    label: "Discord",
    provider: "discord-webhook",
    status: "planned",
  },
  slack: {
    id: "slack",
    label: "Slack",
    provider: "slack-webhook",
    status: "planned",
  },
  webhooks: {
    id: "webhooks",
    label: "Webhooks",
    provider: "custom",
    status: "planned",
  },
  inApp: {
    id: "in-app",
    label: "In-app",
    provider: "hub-inbox",
    status: "partial",
  },
};

/** Tipos de notificación cross-producto. */
export const NOTIFICATION_TYPES = {
  BILLING_INVOICE: "billing.invoice",
  BILLING_PAYMENT_FAILED: "billing.payment_failed",
  AI_QUOTA: "ai.quota",
  LIFEFLOW_TIP: "lifeflow.coach_tip",
  LIFEFLOW_GOAL: "lifeflow.goal",
  CORE_ORDER: "core.order",
  CORE_STOCK: "core.stock_alert",
  STREAM_REMINDER: "stream.reminder",
  AKOENET_MENTION: "akoenet.mention",
  SYSTEM: "platform.system",
};

/**
 * @param {string} channelId
 * @returns {boolean}
 */
export function isNotificationChannelLive(channelId) {
  const ch = NOTIFICATION_CHANNELS[channelId] || NOTIFICATION_CHANNELS.inApp;
  return ch.status === "live" || ch.status === "partial";
}
