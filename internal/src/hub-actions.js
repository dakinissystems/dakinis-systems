/**
 * Acciones recomendadas para Hub «Mi día» — problem → impact → action.
 * @param {{ db?: object; summary?: object; enabledProducts?: string[] }} dashboard
 */

/**
 * @typedef {{
 *   id: string;
 *   severity: 'info'|'warning'|'critical';
 *   title: string;
 *   detail?: string;
 *   impact?: string;
 *   recommendation?: string;
 *   ctaLabel?: string;
 *   action: string;
 *   product?: string;
 *   href?: string;
 * }} HubAction
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
      detail: "Hay avisos sin leer en tu bandeja",
      impact: "Puedes perder pedidos, stock o cobros si no los revisas",
      recommendation: "Abre la bandeja y resuelve lo crítico primero",
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
        detail: "Hay comandas abiertas sin cerrar",
        impact: pending === 1 ? "Un cliente espera preparación o entrega" : `${pending} clientes pueden sufrir demora`,
        recommendation: "Confirma, prepara o asigna los pedidos pendientes",
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
        detail: "Inventario por debajo del mínimo",
        impact: "Riesgo de romper la carta o cortar ventas hoy",
        recommendation: "Revisa cantidades y crea pedido de reposición",
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
        detail: "Agenda del día con eventos pendientes",
        impact: "Si no preparas plaza/equipo, la experiencia del cliente baja",
        recommendation: "Revisa horarios y confirma recursos",
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
        detail: `Estás en ${Math.round(score)}`,
        impact: "Salud financiera débil: mayor riesgo de impagos o falta de caja",
        recommendation: "Revisa ingresos, gastos y metas activas",
        ctaLabel: "Abrir LifeFlow",
        action: "open-lifeflow",
        product: "lifeflow",
      });
    }
  }

  if (products.has("streamautomator")) {
    const upcoming = Number(db.stream_upcoming ?? db.scheduled_contents ?? 0);
    const automationEnabled = Number(db.stream_automation_enabled ?? 0);
    const automationTotal = Number(db.stream_automation_total ?? 0);
    const nextAt = db.stream_next_at ? new Date(db.stream_next_at) : null;
    const now = Date.now();
    const soonMs = 60 * 60 * 1000;

    if (nextAt && !Number.isNaN(nextAt.getTime()) && nextAt.getTime() - now > 0 && nextAt.getTime() - now <= soonMs) {
      const mins = Math.max(1, Math.round((nextAt.getTime() - now) / 60000));
      actions.push({
        id: "stream-live-soon",
        severity: "warning",
        title: mins <= 60 ? `Directo en ${mins} min` : "Tienes un directo pronto",
        detail: db.stream_next_title || "Stream programado",
        impact: "Sin preparación, pierdes anuncios, Discord y overlays a tiempo",
        recommendation: "Abre Director y verifica OBS / anuncios",
        ctaLabel: "Abrir Director",
        action: "open-stream-director",
        product: "streamautomator",
      });
    } else if (upcoming === 0) {
      actions.push({
        id: "stream-schedule",
        severity: "info",
        title: "Aún no tienes publicaciones programadas",
        detail: "Calendario de la semana vacío",
        impact: "Menos reach y menos consistencia con tu audiencia",
        recommendation: "Programa al menos un stream o post esta semana",
        ctaLabel: "Ir al calendario",
        action: "open-stream-calendar",
        product: "streamautomator",
      });
    } else if (upcoming > 0) {
      actions.push({
        id: "stream-automation",
        severity: "info",
        title: `${upcoming} publicación${upcoming === 1 ? "" : "es"} programada${upcoming === 1 ? "" : "s"}`,
        detail:
          automationEnabled > 0
            ? `${automationEnabled} regla${automationEnabled === 1 ? "" : "s"} IF/THEN activa${automationEnabled === 1 ? "" : "s"}`
            : "Tienes contenido sin automatizar anuncios",
        impact:
          automationEnabled > 0
            ? "Las reglas activas reducirán trabajo manual en el próximo live"
            : "Sin reglas IF/THEN, tendrás que anunciar a mano",
        recommendation:
          automationEnabled > 0 ? "Revisa automatización antes del directo" : "Crea reglas IF/THEN para Discord y Hub",
        ctaLabel: automationEnabled > 0 ? "Automatización" : "Crear reglas",
        action: "open-stream-automation",
        product: "streamautomator",
      });
    } else if (automationTotal === 0) {
      actions.push({
        id: "stream-setup-automation",
        severity: "info",
        title: "Automatiza tus directos",
        detail: "Todavía no hay reglas IF/THEN",
        impact: "Cada stream requiere trabajo manual repetido",
        recommendation: "Crea reglas para Discord, AkoeNet y notificaciones Hub",
        ctaLabel: "Configurar",
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
        detail: "Conversaciones privadas pendientes",
        impact: "Respuestas lentas bajan engagement y retención",
        recommendation: "Responde cuando puedas desde AkoeNet",
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
      detail: "Aún no hay señales de productos conectados",
      impact: "Sin apps activas, Hub no puede avisarte de lo urgente",
      recommendation: "Abre Dakinis One u otra app para empezar a operar",
      ctaLabel: "Ver aplicaciones",
      action: "open-apps",
      product: "hub",
    });
  }

  return actions.slice(0, 6);
}
