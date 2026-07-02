/**
 * Widget API — cada producto publica widgets al Hub.
 */

/** @typedef {{ id: string; product: string; title: string; icon: string; defaultSize?: 'sm'|'md'|'lg'; refreshSec?: number; section?: string }} WidgetDef */

export const HUB_WIDGET_REGISTRY = [
  // Hub — Mi día
  { id: "hub-today-agenda", product: "hub", title: "Agenda de hoy", icon: "calendar-days", defaultSize: "md", section: "my-day" },
  { id: "hub-ai-summary", product: "hub", title: "Resumen del día", icon: "sparkles", defaultSize: "md", section: "my-day" },
  { id: "hub-notifications-unread", product: "hub", title: "Sin leer", icon: "bell", defaultSize: "sm", section: "notifications", refreshSec: 60 },
  { id: "hub-recent-activity", product: "hub", title: "Actividad reciente", icon: "activity", defaultSize: "lg", section: "activity" },
  { id: "hub-app-launcher", product: "hub", title: "Mis aplicaciones", icon: "grid-3x3", defaultSize: "lg", section: "apps" },
  // LifeFlow
  { id: "lifeflow-score", product: "lifeflow", title: "LifeFlow Score", icon: "gauge", defaultSize: "md", refreshSec: 300, section: "health" },
  { id: "lifeflow-financial-health", product: "lifeflow", title: "Salud financiera", icon: "heart-pulse", defaultSize: "md", section: "health" },
  { id: "lifeflow-coach-tip", product: "lifeflow", title: "Coach del día", icon: "sparkles", defaultSize: "md", section: "ai-summary" },
  { id: "lifeflow-calendar", product: "lifeflow", title: "Calendario financiero", icon: "calendar", defaultSize: "sm", section: "agenda" },
  // Core BOS
  { id: "core-sales-today", product: "core", title: "Ventas hoy", icon: "trending-up", defaultSize: "sm", refreshSec: 60, section: "widgets" },
  { id: "core-orders-pending", product: "core", title: "Pedidos pendientes", icon: "shopping-bag", defaultSize: "sm", section: "widgets" },
  { id: "core-business-health", product: "core", title: "Salud del negocio", icon: "building-2", defaultSize: "md", section: "health" },
  { id: "core-appointments-today", product: "core", title: "Citas hoy", icon: "calendar-check", defaultSize: "sm", section: "agenda" },
  // StreamAutomator
  { id: "stream-next-live", product: "streamautomator", title: "Próximo directo", icon: "radio", defaultSize: "md", section: "agenda" },
  { id: "stream-posts-week", product: "streamautomator", title: "Publicaciones esta semana", icon: "calendar", defaultSize: "sm", section: "widgets" },
  { id: "stream-upcoming", product: "streamautomator", title: "Próximos streams", icon: "radio-tower", defaultSize: "md", section: "my-day" },
  // AkoeNet
  { id: "akoenet-online", product: "akoenet", title: "Usuarios conectados", icon: "users", defaultSize: "sm", refreshSec: 30, section: "widgets" },
  { id: "akoenet-new-members", product: "akoenet", title: "Nuevos miembros", icon: "user-plus", defaultSize: "sm", section: "activity" },
  { id: "akoenet-unread-messages", product: "akoenet", title: "Mensajes sin leer", icon: "message-circle", defaultSize: "sm", section: "notifications" },
  // AI
  { id: "ai-recommendations", product: "ai", title: "Recomendaciones IA", icon: "bot", defaultSize: "md", section: "ai-summary" },
  { id: "ai-daily-summary", product: "ai", title: "Resumen IA", icon: "sparkles", defaultSize: "md", section: "ai-summary" },
];

/**
 * @param {string} product
 * @returns {WidgetDef[]}
 */
export function getWidgetsForProduct(product) {
  return HUB_WIDGET_REGISTRY.filter((w) => w.product === product);
}

/**
 * @param {string} sectionId — ver HUB_DASHBOARD_SECTIONS en hub-dashboard.js
 * @returns {WidgetDef[]}
 */
export function getWidgetsForSection(sectionId) {
  return HUB_WIDGET_REGISTRY.filter((w) => w.section === sectionId);
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
