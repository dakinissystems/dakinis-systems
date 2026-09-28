/**
 * Canonical Dakinis cross-product event catalog (Event Center / Hub).
 * Products publish; Hub/SSE consumers subscribe by type prefix.
 */

export const DAKINIS_EVENT_TYPES = Object.freeze({
  // Inventory / Core
  INVENTORY_LOW_STOCK: "inventory.low_stock",
  INVOICE_OVERDUE: "invoice.overdue",
  RESERVATION_CREATED: "reservation.created",
  RESERVATION_UPCOMING: "reservation.upcoming",
  // Comms
  WHATSAPP_MESSAGE: "whatsapp.message",
  // StreamAutomator
  STREAM_STARTED: "stream.started",
  STREAM_ENDED: "stream.ended",
  TASK_DUE: "task.due",
  // System
  SYSTEM_ALERT: "system.alert",
  BILLING_DEGRADED: "billing.degraded",
  // Org
  ORG_CONTEXT_CHANGED: "org.context_changed",
});

/**
 * @typedef {object} DakinisEvent
 * @property {string} id
 * @property {string} type - one of DAKINIS_EVENT_TYPES
 * @property {string} [tenantId]
 * @property {string} [workspaceId]
 * @property {string} [ventureId]
 * @property {string} [locationId]
 * @property {string} [product] - hub|core|streamautomator|akoenet|…
 * @property {'info'|'warning'|'critical'|'success'} [severity]
 * @property {string} [title]
 * @property {string} [message]
 * @property {string} [href]
 * @property {string} [createdAt] ISO
 * @property {Record<string, unknown>} [payload]
 */

/**
 * @param {Partial<DakinisEvent> & { type: string }} input
 * @returns {DakinisEvent}
 */
export function createDakinisEvent(input) {
  return {
    id: input.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    ventureId: input.ventureId,
    locationId: input.locationId,
    product: input.product || "hub",
    severity: input.severity || "info",
    title: input.title,
    message: input.message,
    href: input.href,
    createdAt: input.createdAt || new Date().toISOString(),
    payload: input.payload || {},
  };
}

/** Transport guidance (docs / clients). */
export const EVENT_TRANSPORT = Object.freeze({
  occasional: "rest",
  serverToClient: "sse",
  bidirectional: "websocket",
  background: "queue",
  cache: "redis",
  jobs: "bullmq",
});
