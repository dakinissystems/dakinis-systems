/**
 * Widget API — cada producto publica widgets al Hub.
 */

/** @typedef {{ id: string; product: string; title: string; icon: string; defaultSize?: 'sm'|'md'|'lg'; refreshSec?: number }} WidgetDef */

export const HUB_WIDGET_REGISTRY = [
  { id: "lifeflow-score", product: "lifeflow", title: "LifeFlow Score", icon: "gauge", defaultSize: "md", refreshSec: 300 },
  { id: "lifeflow-coach-tip", product: "lifeflow", title: "Coach del día", icon: "sparkles", defaultSize: "md" },
  { id: "core-sales-today", product: "core", title: "Ventas hoy", icon: "trending-up", defaultSize: "sm", refreshSec: 60 },
  { id: "core-orders-pending", product: "core", title: "Pedidos pendientes", icon: "shopping-bag", defaultSize: "sm" },
  { id: "stream-next-live", product: "streamautomator", title: "Próximo directo", icon: "radio", defaultSize: "md" },
  { id: "stream-posts-week", product: "streamautomator", title: "Publicaciones esta semana", icon: "calendar", defaultSize: "sm" },
  { id: "akoenet-online", product: "akoenet", title: "Usuarios conectados", icon: "users", defaultSize: "sm", refreshSec: 30 },
  { id: "akoenet-new-members", product: "akoenet", title: "Nuevos miembros", icon: "user-plus", defaultSize: "sm" },
  { id: "ai-recommendations", product: "ai", title: "Recomendaciones IA", icon: "bot", defaultSize: "md" },
];

/**
 * @param {string} product
 * @returns {WidgetDef[]}
 */
export function getWidgetsForProduct(product) {
  return HUB_WIDGET_REGISTRY.filter((w) => w.product === product);
}

/** Tipos de evento para activity timeline Hub. */
export const ACTIVITY_EVENT_TYPES = {
  INVOICE_CREATED: "invoice.created",
  AI_RESPONSE: "ai.response",
  SCORE_UPDATED: "lifeflow.score_updated",
  CUSTOMER_CREATED: "crm.customer_created",
  ORDER_CREATED: "order.created",
  STREAM_PUBLISHED: "stream.published",
  MEMBER_JOINED: "community.member_joined",
};
