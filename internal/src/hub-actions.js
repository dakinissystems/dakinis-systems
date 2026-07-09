/**
 * Acciones recomendadas para Hub «Mi día» — orientadas a tareas, no solo KPIs.
 * @param {{ db?: object; summary?: object; enabledProducts?: string[] }} dashboard
 */

/**
 * @typedef {{ id: string; severity: 'info'|'warning'|'critical'; title: string; detail?: string; action: string; product?: string }} HubAction
 */

export function buildRecommendedActions(dashboard = {}) {
  const db = dashboard.db || {};
  const summary = dashboard.summary || {};
  const products = new Set(dashboard.enabledProducts || ["core"]);
  /** @type {HubAction[]} */
  const actions = [];

  const unread = Number(summary.notificationsUnread ?? db.unread_notifications ?? 0);
  if (unread > 0) {
    actions.push({
      id: "notifications-unread",
      severity: unread > 10 ? "warning" : "info",
      title: `${unread} notificación${unread === 1 ? "" : "es"} sin leer`,
      action: "open-notifications",
      product: "hub",
    });
  }

  if (products.has("core")) {
    const pending = Number(db.core_orders_pending ?? 0);
    if (pending > 0) {
      actions.push({
        id: "core-orders",
        severity: "warning",
        title: `${pending} pedido${pending === 1 ? "" : "s"} pendiente${pending === 1 ? "" : "s"}`,
        action: "open-core-orders",
        product: "core",
      });
    }

    const lowStock = Number(db.core_low_stock_count ?? 0);
    if (lowStock > 0) {
      actions.push({
        id: "core-stock",
        severity: "critical",
        title: `Stock crítico en ${lowStock} producto${lowStock === 1 ? "" : "s"}`,
        action: "open-core-inventory",
        product: "core",
      });
    }

    const appointments = Number(db.core_appointments_today ?? 0);
    if (appointments > 0) {
      actions.push({
        id: "core-appointments",
        severity: "info",
        title: `${appointments} cita${appointments === 1 ? "" : "s"} hoy`,
        action: "open-core-calendar",
        product: "core",
      });
    }
  }

  if (products.has("lifeflow")) {
    const score = db.lifeflow_score != null ? Number(db.lifeflow_score) : null;
    if (score != null && score < 60) {
      actions.push({
        id: "lifeflow-score",
        severity: "warning",
        title: "LifeFlow Score bajo — revisar finanzas",
        detail: `Score ${Math.round(score)}`,
        action: "open-lifeflow",
        product: "lifeflow",
      });
    }
  }

  if (products.has("streamautomator")) {
    const upcoming = Number(db.stream_upcoming ?? db.scheduled_contents ?? 0);
    if (upcoming === 0) {
      actions.push({
        id: "stream-schedule",
        severity: "info",
        title: "Sin publicaciones programadas esta semana",
        action: "open-stream-calendar",
        product: "streamautomator",
      });
    }
  }

  if (products.has("akoenet")) {
    const dm = Number(db.akoenet_unread_dm ?? 0);
    if (dm > 0) {
      actions.push({
        id: "akoenet-dm",
        severity: "info",
        title: `${dm} mensaje${dm === 1 ? "" : "s"} sin leer en comunidad`,
        action: "open-akoenet",
        product: "akoenet",
      });
    }
  }

  if (summary.stub && actions.length === 0) {
    actions.push({
      id: "setup-mi-dia",
      severity: "info",
      title: "Conecta tus productos para ver acciones aquí",
      detail: "Aplica migr. Hub 016–029 en Supabase",
      action: "open-apps",
      product: "hub",
    });
  }

  return actions.slice(0, 6);
}
