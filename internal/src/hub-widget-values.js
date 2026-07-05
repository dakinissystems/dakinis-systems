/**
 * Map hub.v1_get_dashboard → widget card values (internal API; mirror shared-ux).
 * @param {{ db?: object; summary?: object }} dashboard
 */

function dakinisFormatShortDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function dakinisFormatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return "0 €";
  return `${n.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;
}

export function buildWidgetValues(dashboard = {}) {
  const db = dashboard.db || {};
  const summary = dashboard.summary || {};
  const unread = Number(db.unread_notifications ?? summary.notificationsUnread ?? 0);
  const scheduled = db.scheduled_contents;
  const scheduledWeek = db.stream_scheduled_week;
  const streamUpcoming = db.stream_upcoming;
  const streamNextAt = db.stream_next_at;
  const score = db.lifeflow_score;
  const recent = Array.isArray(db.recent_items) ? db.recent_items : [];
  const timeline = Array.isArray(db.timeline) ? db.timeline : [];
  const tenants = Array.isArray(db.tenants) ? db.tenants : [];
  const tenantCount = Number(db.core_tenant_count ?? tenants.length ?? 0);
  const activityItems = timeline.length ? timeline : recent;
  const activityLabel =
    timeline[0]?.title || timeline[0]?.event_type || recent[0]?.label || "Timeline";
  const streamNextLabel = dakinisFormatShortDate(streamNextAt);

  return {
    "hub-today-agenda": {
      value:
        streamUpcoming != null && streamUpcoming > 0
          ? `${streamUpcoming} esta semana`
          : scheduled != null
            ? `${scheduled} programados`
            : "Sin eventos",
      status: streamNextLabel ? `Próximo: ${streamNextLabel}` : "Hoy",
    },
    "hub-ai-summary": {
      value: score != null ? `Score ${Math.round(Number(score))}` : "Sin score",
      status: db.ai_usage_week ? `${db.ai_usage_week} consultas IA` : "IA",
    },
    "hub-notifications-unread": {
      value: String(unread),
      status: unread ? "Sin leer" : "Al día",
    },
    "hub-recent-activity": {
      value: activityItems.length ? `${activityItems.length} recientes` : "Sin actividad",
      status: activityLabel,
    },
    "lifeflow-score": {
      value: score != null ? String(Math.round(Number(score))) : "—",
      status: "LifeFlow",
    },
    "lifeflow-financial-health": {
      value:
        score != null && Number(score) >= 70
          ? "Buena"
          : score != null
            ? "Revisar"
            : db.lifeflow_active_goals
              ? `${db.lifeflow_active_goals} metas`
              : "—",
      status: "LifeFlow",
    },
    "lifeflow-coach-tip": {
      value: db.lifeflow_coach_tip?.trim() || (score != null ? "Coach disponible" : "Sin tip"),
      status: "LifeFlow",
    },
    "lifeflow-calendar": {
      value:
        db.lifeflow_tx_month != null ? `${db.lifeflow_tx_month} movimientos` : "Sin movimientos",
      status: "Este mes",
    },
    "stream-next-live": {
      value: streamNextLabel || (scheduled != null ? `${scheduled} streams` : "Sin directos"),
      status: "Stream",
    },
    "stream-posts-week": {
      value: scheduledWeek != null ? String(scheduledWeek) : scheduled != null ? String(scheduled) : "0",
      status: "Semana",
    },
    "stream-upcoming": {
      value: streamUpcoming != null ? String(streamUpcoming) : scheduled != null ? String(scheduled) : "0",
      status: "7 días",
    },
    "core-appointments-today": {
      value:
        db.core_appointments_today != null && db.core_appointments_today > 0
          ? String(db.core_appointments_today)
          : tenantCount
            ? `${tenantCount} negocio${tenantCount === 1 ? "" : "s"}`
            : "0",
      status: "Core",
    },
    "core-sales-today": {
      value:
        db.core_sales_today != null && Number(db.core_sales_today) > 0
          ? dakinisFormatMoney(db.core_sales_today)
          : tenantCount
            ? "Ver en Core"
            : "0 €",
      status: "Core",
    },
    "core-orders-pending": {
      value:
        db.core_orders_pending != null ? String(db.core_orders_pending) : tenantCount ? "—" : "0",
      status: "Core",
    },
    "core-business-health": {
      value: tenantCount ? `${tenantCount} tenant${tenantCount === 1 ? "" : "s"}` : "Sin negocios",
      status: tenants[0]?.plan || "Core",
    },
    "akoenet-unread-messages": {
      value: db.akoenet_unread_dm != null ? String(db.akoenet_unread_dm) : "0",
      status: db.akoenet_unread_dm ? "Recientes" : "Al día",
    },
    "akoenet-new-members": {
      value: db.akoenet_new_members_week != null ? String(db.akoenet_new_members_week) : "0",
      status: "7 días",
    },
    "akoenet-online": {
      value: db.akoenet_online != null ? String(db.akoenet_online) : "0",
      status: "Comunidad",
    },
    "hub-app-launcher": { value: "5 apps", status: "Suite" },
    "ai-recommendations": {
      value: db.ai_usage_week ? `${db.ai_usage_week} esta semana` : "Próximamente",
      status: "IA",
    },
    "ai-daily-summary": {
      value: score != null ? "Disponible" : db.ai_usage_week ? "Activo" : "—",
      status: "IA",
    },
  };
}

export function getWidgetDisplay(widgetId, widgetValues = {}) {
  return widgetValues[widgetId] || { value: "—", status: null };
}
