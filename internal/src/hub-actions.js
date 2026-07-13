/**
 * Acciones recomendadas para Hub «Mi día» — orientadas a tareas, no solo KPIs.
 * @param {{ db?: object; summary?: object; enabledProducts?: string[] }} dashboard
 */

/**
 * @typedef {{ id: string; severity: 'info'|'warning'|'critical'; title: string; detail?: string; ctaLabel?: string; action: string; product?: string }} HubAction
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
      title: unread === 1 ? "Tienes 1 notificación nueva" : `Tienes ${unread} notificaciones nuevas`,
      detail: "Revísalas para no perder avisos importantes",
      ctaLabel: "Ver bandeja",
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
        title: pending === 1 ? "1 pedido espera tu atención" : `${pending} pedidos esperan tu atención`,
        detail: "Confirma o prepara los pedidos pendientes",
        ctaLabel: "Ver pedidos",
        action: "open-core-orders",
        product: "core",
      });
    }

    const lowStock = Number(db.core_low_stock_count ?? 0);
    if (lowStock > 0) {
      actions.push({
        id: "core-stock",
        severity: "critical",
        title: lowStock === 1 ? "Un producto con stock crítico" : `${lowStock} productos con stock crítico`,
        detail: "Repón inventario antes de quedarte sin unidades",
        ctaLabel: "Ver inventario",
        action: "open-core-inventory",
        product: "core",
      });
    }

    const appointments = Number(db.core_appointments_today ?? 0);
    if (appointments > 0) {
      actions.push({
        id: "core-appointments",
        severity: "info",
        title: appointments === 1 ? "Tienes 1 cita hoy" : `Tienes ${appointments} citas hoy`,
        detail: "Consulta tu agenda del día",
        ctaLabel: "Ver agenda",
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
        title: "Tu LifeFlow Score necesita atención",
        detail: `Estás en ${Math.round(score)} — revisa ingresos y gastos`,
        ctaLabel: "Abrir LifeFlow",
        action: "open-lifeflow",
        product: "lifeflow",
      });
    }
  }

  if (products.has("streamautomator")) {
    const upcoming = Number(db.stream_upcoming ?? db.scheduled_contents ?? 0);
    const nextAt = db.stream_next_at ? new Date(db.stream_next_at) : null;
    const now = Date.now();
    const soonMs = 60 * 60 * 1000;

    if (nextAt && !Number.isNaN(nextAt.getTime()) && nextAt.getTime() - now > 0 && nextAt.getTime() - now <= soonMs) {
      const mins = Math.max(1, Math.round((nextAt.getTime() - now) / 60000));
      actions.push({
        id: "stream-live-soon",
        severity: "warning",
        title: mins <= 60 ? `Directo en ${mins} min` : "Tienes un directo pronto",
        detail: db.stream_next_title || "Prepara OBS, Discord y anuncios",
        ctaLabel: "Abrir Director",
        action: "open-stream-director",
        product: "streamautomator",
      });
    } else if (upcoming === 0) {
      actions.push({
        id: "stream-schedule",
        severity: "info",
        title: "Aún no tienes publicaciones programadas",
        detail: "Organiza el contenido de esta semana en StreamAutomator",
        ctaLabel: "Ir al calendario",
        action: "open-stream-calendar",
        product: "streamautomator",
      });
    } else if (upcoming > 0) {
      actions.push({
        id: "stream-automation",
        severity: "info",
        title: `${upcoming} publicación${upcoming === 1 ? "" : "es"} programada${upcoming === 1 ? "" : "s"}`,
        detail: "Revisa reglas IF/THEN para automatizar anuncios",
        ctaLabel: "Automatización",
        action: "open-stream-automation",
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
        title: dm === 1 ? "1 mensaje sin leer en tu comunidad" : `${dm} mensajes sin leer en tu comunidad`,
        detail: "Responde cuando puedas para mantener el engagement",
        ctaLabel: "Abrir AkoeNet",
        action: "open-akoenet",
        product: "akoenet",
      });
    }
  }

  if (summary.stub && actions.length === 0) {
    actions.push({
      id: "setup-mi-dia",
      severity: "info",
      title: "Personaliza tu Mi día",
      detail: "Abre tus apps conectadas para ver tareas y recordatorios aquí",
      ctaLabel: "Ver aplicaciones",
      action: "open-apps",
      product: "hub",
    });
  }

  return actions.slice(0, 6);
}
