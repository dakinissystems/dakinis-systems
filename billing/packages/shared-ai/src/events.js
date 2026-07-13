/**
 * Event bus platform — tipos, colas y configuración objetivo.
 * Hoy: Core in-process + tipos compartidos.
 * Objetivo: Redis + BullMQ + workers + DLQ.
 */

export const DAKINIS_EVENTS = {
  // Identity & billing
  USER_CREATED: "user.created",
  USER_PLAN_CHANGED: "user.plan_changed",
  PAYMENT_SUCCEEDED: "billing.payment_succeeded",
  PAYMENT_FAILED: "billing.payment_failed",
  TENANT_SUSPENDED: "tenant.suspended",
  TENANT_REACTIVATED: "tenant.reactivated",

  // AI
  AI_REQUEST: "ai.request",
  AI_RESPONSE: "ai.response",
  AI_USAGE: "ai.usage",
  AI_QUOTA_EXCEEDED: "ai.quota_exceeded",

  // Core BOS
  INVOICE_CREATED: "invoice.created",
  ORDER_CREATED: "order.created",
  CUSTOMER_CREATED: "crm.customer_created",
  STOCK_LOW: "inventory.stock_low",
  EXPIRY_ALERT: "inventory.expiry_alert",

  // LifeFlow
  LIFEFLOW_SCORE_UPDATED: "lifeflow.score_updated",
  GOAL_REACHED: "lifeflow.goal_reached",
  SCENARIO_SAVED: "lifeflow.scenario_saved",

  // StreamAutomator
  STREAM_SCHEDULED: "stream.scheduled",
  STREAM_STARTED: "stream.started",
  STREAM_ENDED: "stream.ended",
  STREAM_PUBLISHED: "stream.published",
  POST_PUBLISHED: "stream.post_published",

  // AkoeNet
  MEMBER_JOINED: "community.member_joined",
  MESSAGE_CREATED: "community.message_created",

  // Platform
  NOTIFICATION_REQUESTED: "notifications.requested",
  SEARCH_INDEX: "search.index",
  KNOWLEDGE_INGEST: "knowledge.ingest",
  STORAGE_UPLOADED: "storage.uploaded",
};

/** Colas BullMQ objetivo — worker por cola. */
export const EVENT_BUS_QUEUES = {
  default: { name: "dakinis.events", concurrency: 5, retries: 3 },
  notifications: { name: "dakinis.notifications", concurrency: 10, retries: 5 },
  ai: { name: "dakinis.ai", concurrency: 3, retries: 2 },
  search: { name: "dakinis.search", concurrency: 2, retries: 3 },
  knowledge: { name: "dakinis.knowledge", concurrency: 2, retries: 3 },
  media: { name: "dakinis.media", concurrency: 2, retries: 2 },
  storage: { name: "dakinis.storage", concurrency: 2, retries: 2 },
  deadLetter: { name: "dakinis.dlq", concurrency: 1, retries: 0 },
};

/** @typedef {{ event: string; payload: object; userId?: string; tenantId?: string; source: string; at?: string }} PlatformEvent */

/**
 * @param {string} type
 * @param {object} payload
 * @param {{ userId?: string; tenantId?: string; source?: string }} [meta]
 * @returns {PlatformEvent}
 */
export function createPlatformEvent(type, payload, meta = {}) {
  return {
    event: type,
    payload,
    userId: meta.userId,
    tenantId: meta.tenantId,
    source: meta.source || "unknown",
    at: new Date().toISOString(),
  };
}
