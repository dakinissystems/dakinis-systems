/**
 * Hub Dashboard — orden canónico «Mi día primero», apps al final.
 * Las apps dejan de ser el centro; el día del usuario es el centro.
 */

/** @typedef {{ id: string; title: string; icon: string; order: number; description?: string }} HubSectionDef */

export const HUB_DASHBOARD_SECTIONS = [
  {
    id: "my-day",
    title: "Mi día",
    icon: "sun",
    order: 0,
    description: "Agenda, tareas y foco de hoy",
  },
  {
    id: "agenda",
    title: "Agenda de hoy",
    icon: "calendar-days",
    order: 1,
    description: "Citas, streams, vencimientos",
  },
  {
    id: "notifications",
    title: "Notificaciones",
    icon: "bell",
    order: 2,
    description: "Avisos sin leer cross-producto",
  },
  {
    id: "activity",
    title: "Actividad reciente",
    icon: "activity",
    order: 3,
    description: "Timeline: facturas, scores, mensajes…",
  },
  {
    id: "ai-summary",
    title: "Resumen IA",
    icon: "sparkles",
    order: 4,
    description: "Síntesis del día y recomendaciones",
  },
  {
    id: "health",
    title: "Salud",
    icon: "heart-pulse",
    order: 5,
    description: "Salud financiera y del negocio",
  },
  {
    id: "widgets",
    title: "Widgets",
    icon: "layout-grid",
    order: 6,
    description: "Métricas por producto configurables",
  },
  {
    id: "apps",
    title: "Aplicaciones",
    icon: "grid-3x3",
    order: 99,
    description: "Launcher — secundario respecto a Mi día",
  },
];

/** Widgets recomendados por sección del dashboard Hub. */
export const HUB_SECTION_WIDGETS = {
  "my-day": ["hub-today-agenda", "hub-ai-summary"],
  agenda: ["core-appointments-today", "stream-next-live", "lifeflow-calendar"],
  notifications: ["hub-notifications-unread"],
  activity: ["hub-recent-activity"],
  "ai-summary": ["ai-recommendations", "ai-daily-summary"],
  health: ["lifeflow-score", "lifeflow-financial-health", "core-business-health"],
  widgets: ["core-sales-today", "core-orders-pending", "stream-posts-week", "akoenet-online"],
  apps: ["hub-app-launcher"],
};

/** Iconos Lucide por app del launcher Hub (mirror de @dakinis/shared-icons PRODUCT_ICONS). */
export const HUB_APP_ICONS = {
  core: "layers",
  lifeflow: "heart-pulse",
  streamautomator: "cast",
  akoenet: "audio-lines",
  tabletop: "dice-5",
  dnd: "dice-5",
};

/**
 * @param {number} [maxOrder=98]
 * @returns {HubSectionDef[]}
 */
export function getHubSectionsBeforeApps(maxOrder = 98) {
  return HUB_DASHBOARD_SECTIONS.filter((s) => s.order <= maxOrder).sort((a, b) => a.order - b.order);
}
