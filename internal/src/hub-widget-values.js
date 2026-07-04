/**
 * Map hub.v1_get_dashboard → widget card values (internal API; mirror shared-ux).
 * @param {{ db?: object; summary?: object }} dashboard
 */
export function buildWidgetValues(dashboard = {}) {
  const db = dashboard.db || {};
  const summary = dashboard.summary || {};
  const unread = Number(db.unread_notifications ?? summary.notificationsUnread ?? 0);
  const scheduled = db.scheduled_contents;
  const score = db.lifeflow_score;
  const recent = Array.isArray(db.recent_items) ? db.recent_items : [];
  const tenants = Array.isArray(db.tenants) ? db.tenants : [];

  return {
    "hub-today-agenda": {
      value: scheduled != null ? `${scheduled} programados` : "Sin eventos",
      status: "Hoy",
    },
    "hub-ai-summary": {
      value: score != null ? `Score ${Math.round(Number(score))}` : "—",
      status: "IA",
    },
    "hub-notifications-unread": {
      value: String(unread),
      status: unread ? "Sin leer" : "Al día",
    },
    "hub-recent-activity": {
      value: recent.length ? `${recent.length} recientes` : "Sin actividad",
      status: recent[0]?.label || "Timeline",
    },
    "lifeflow-score": {
      value: score != null ? String(Math.round(Number(score))) : "—",
      status: "LifeFlow",
    },
    "lifeflow-financial-health": {
      value: score != null && Number(score) >= 70 ? "Buena" : score != null ? "Revisar" : "—",
      status: "LifeFlow",
    },
    "stream-next-live": {
      value: scheduled != null ? `${scheduled} streams` : "—",
      status: "Stream",
    },
    "stream-posts-week": {
      value: scheduled != null ? String(scheduled) : "—",
      status: "Semana",
    },
    "core-business-health": {
      value: tenants.length ? `${tenants.length} tenants` : "—",
      status: "Core",
    },
    "hub-app-launcher": { value: "6 apps", status: "Suite" },
  };
}
