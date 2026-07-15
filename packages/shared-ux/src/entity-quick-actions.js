/**
 * Acciones rápidas por entidad / widget — ecosistema Dakinis.
 * @typedef {{ id: string; label: string; variant?: 'primary'|'secondary' }} QuickAction
 */

/** @type {Record<string, QuickAction[]>} */
export const WIDGET_QUICK_ACTIONS = {
  "stream-upcoming": [
    { id: "open-director", label: "Abrir Director", variant: "primary" },
    { id: "open-schedule", label: "Calendario", variant: "secondary" },
    { id: "open-automation", label: "Automatizar", variant: "secondary" },
  ],
  "stream-next-live": [
    { id: "open-director", label: "Director", variant: "primary" },
    { id: "open-schedule", label: "Editar", variant: "secondary" },
  ],
  "core-orders-pending": [
    { id: "open-orders", label: "Ver pedidos", variant: "primary" },
    { id: "open-kitchen", label: "Cocina", variant: "secondary" },
  ],
  "core-sales-today": [
    { id: "open-sales", label: "Ventas", variant: "primary" },
    { id: "create-invoice", label: "Facturar", variant: "secondary" },
  ],
  "lifeflow-score": [
    { id: "open-lifeflow", label: "Abrir LifeFlow", variant: "primary" },
    { id: "ask-coach", label: "Coach IA", variant: "secondary" },
  ],
  "hub-notifications-unread": [
    { id: "open-notifications", label: "Bandeja", variant: "primary" },
  ],
  "akoenet-unread-messages": [
    { id: "open-akoenet", label: "Responder", variant: "primary" },
  ],
};

/** @type {Record<string, QuickAction[]>} */
export const ENTITY_QUICK_ACTIONS = {
  customer: [
    { id: "call", label: "Llamar" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "invoice", label: "Facturar" },
    { id: "schedule-meeting", label: "Reunión" },
    { id: "ask-ai", label: "Preguntar IA" },
  ],
  stream: [
    { id: "open-director", label: "Director" },
    { id: "edit", label: "Editar" },
    { id: "duplicate", label: "Duplicar" },
    { id: "cancel", label: "Cancelar" },
    { id: "announce", label: "Anunciar" },
  ],
  invoice: [
    { id: "send", label: "Enviar" },
    { id: "mark-paid", label: "Marcar pagada" },
    { id: "download", label: "Descargar" },
  ],
  order: [
    { id: "confirm", label: "Confirmar" },
    { id: "kitchen", label: "Enviar cocina" },
    { id: "invoice", label: "Facturar" },
  ],
};

/**
 * @param {string} widgetId
 * @param {Record<string, QuickAction[]>} [overrides]
 */
export function getWidgetQuickActions(widgetId, overrides = {}) {
  return overrides[widgetId] || WIDGET_QUICK_ACTIONS[widgetId] || [];
}

/**
 * @param {string} entityType
 */
export function getEntityQuickActions(entityType) {
  return ENTITY_QUICK_ACTIONS[entityType] || [];
}
