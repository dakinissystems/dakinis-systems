/**
 * Acciones para Hub «Mi día».
 * Cada ítem: qué pasa → por qué importa → qué hacer.
 */

function label(n, singular, plural) {
  return n === 1 ? singular : plural.replace("{n}", String(n));
}

/**
 * @param {{ db?: object; summary?: object; enabledProducts?: string[] }} dashboard
 */
export function buildRecommendedActions(dashboard = {}) {
  const db = dashboard.db || {};
  const summary = dashboard.summary || {};
  const products = new Set(dashboard.enabledProducts || ["core"]);
  const actions = [];

  const unread = Number(summary.notificationsUnread ?? db.unread_notifications ?? 0);
  if (unread > 0) {
    actions.push({
      id: "notifications-unread",
      severity: unread > 10 ? "warning" : "info",
      title: label(unread, "Tienes 1 notificación nueva", "Tienes {n} notificaciones nuevas"),
      detail: "Hay avisos sin leer",
      impact: "Puede haber pedidos, stock o cobros esperando",
      recommendation: "Mira primero lo urgente",
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
        title: label(pending, "1 pedido espera tu atención", "{n} pedidos esperan tu atención"),
        detail: "Comandas abiertas sin cerrar",
        impact: pending === 1 ? "Un cliente está esperando" : `${pending} clientes pueden estar esperando`,
        recommendation: "Confirma o asigna lo pendiente",
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
        title: label(lowStock, "Un producto con stock crítico", "{n} productos con stock crítico"),
        detail: "Por debajo del mínimo",
        impact: "Hoy puedes quedarte sin algo de la carta",
        recommendation: "Revisa cantidades y pide reposición",
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
        title: label(appointments, "Tienes 1 cita hoy", "Tienes {n} citas hoy"),
        detail: "Agenda del día",
        impact: "Si no preparas plaza o equipo, se nota en el cliente",
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
        title: "Tu LifeFlow Score pide atención",
        detail: `Estás en ${Math.round(score)}`,
        impact: "Caja o salud financiera floja",
        recommendation: "Revisa ingresos, gastos y metas",
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
    const hourMs = 60 * 60 * 1000;
    const liveSoon =
      nextAt &&
      !Number.isNaN(nextAt.getTime()) &&
      nextAt.getTime() - now > 0 &&
      nextAt.getTime() - now <= hourMs;

    if (liveSoon) {
      const mins = Math.max(1, Math.round((nextAt.getTime() - now) / 60000));
      actions.push({
        id: "stream-live-soon",
        severity: "warning",
        title: mins <= 60 ? `Directo en ${mins} min` : "Tienes un directo pronto",
        detail: db.stream_next_title || "Stream programado",
        impact: "Sin prep, se te escapan anuncios, Discord y overlays",
        recommendation: "Abre Director y revisa OBS / anuncios",
        ctaLabel: "Abrir Director",
        action: "open-stream-director",
        product: "streamautomator",
      });
    } else if (upcoming === 0) {
      actions.push({
        id: "stream-schedule",
        severity: "info",
        title: "Aún no tienes nada programado",
        detail: "Calendario de la semana vacío",
        impact: "Menos reach y menos constancia con la audiencia",
        recommendation: "Programa al menos un stream o post",
        ctaLabel: "Ir al calendario",
        action: "open-stream-calendar",
        product: "streamautomator",
      });
    } else if (upcoming > 0) {
      const hasRules = automationEnabled > 0;
      actions.push({
        id: "stream-automation",
        severity: "info",
        title: label(upcoming, "1 publicación programada", "{n} publicaciones programadas"),
        detail: hasRules
          ? label(automationEnabled, "1 regla IF/THEN activa", "{n} reglas IF/THEN activas")
          : "Contenido sin automatizar anuncios",
        impact: hasRules
          ? "Las reglas te ahorran trabajo en el próximo live"
          : "Sin reglas IF/THEN, anuncias a mano",
        recommendation: hasRules
          ? "Echa un vistazo a la automatización antes del directo"
          : "Crea reglas para Discord y Hub",
        ctaLabel: hasRules ? "Automatización" : "Crear reglas",
        action: "open-stream-automation",
        product: "streamautomator",
      });
    } else if (automationTotal === 0) {
      actions.push({
        id: "stream-setup-automation",
        severity: "info",
        title: "Automatiza tus directos",
        detail: "Todavía no hay reglas IF/THEN",
        impact: "Cada stream es trabajo manual repetido",
        recommendation: "Crea reglas para Discord, AkoeNet y Hub",
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
        title: label(dm, "1 mensaje sin leer en tu comunidad", "{n} mensajes sin leer en tu comunidad"),
        detail: "Conversaciones privadas pendientes",
        impact: "Responder tarde enfría el engagement",
        recommendation: "Contesta cuando puedas desde AkoeNet",
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
      detail: "Todavía no hay señales de productos",
      impact: "Sin apps activas, Hub no te puede avisar de lo urgente",
      recommendation: "Abre Dakinis One u otra app para empezar",
      ctaLabel: "Ver aplicaciones",
      action: "open-apps",
      product: "hub",
    });
  }

  return actions.slice(0, 6);
}
