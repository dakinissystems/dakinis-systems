/** Timeline de actividad Hub — interactivo, sin datos mock. */
import { EMPTY_EVENTS } from "./constants.js";

export default function ActivityTimeline({
  events = EMPTY_EVENTS,
  loading = false,
  onAction,
  t = (k) => k,
}) {
  if (loading) {
    return (
      <section className="hub-activity card" aria-label={t("hub.timeline.title")}>
        <h4 className="hub-activity__title">{t("hub.timeline.title")}</h4>
        <p className="hub-activity__empty">{t("hub.timeline.loading") || "Cargando…"}</p>
      </section>
    );
  }

  if (!events.length) {
    return (
      <section className="hub-activity card" aria-label={t("hub.timeline.title")}>
        <h4 className="hub-activity__title">{t("hub.timeline.title")}</h4>
        <p className="hub-activity__empty">{t("hub.timeline.empty") || "Sin actividad reciente"}</p>
      </section>
    );
  }

  return (
    <section className="hub-activity card" aria-label={t("hub.timeline.title")}>
      <h4 className="hub-activity__title">{t("hub.timeline.title")}</h4>
      <ol className="hub-activity__list">
        {events.map((ev) => (
          <li key={ev.id} className={`hub-activity__item${ev.ai ? " hub-activity__item--ai" : ""}`}>
            <time>{ev.time}</time>
            <span className="hub-activity__label">{ev.label}</span>
            {ev.actionLabel && onAction ? (
              <button
                type="button"
                className="hub-activity__action"
                onClick={() => onAction(ev.action || ev.id, ev)}
              >
                {ev.actionLabel}
              </button>
            ) : null}
          </li>
        ))}
      </ol>
      <style>{`
        .hub-activity__empty { margin: 0; font-size: 0.85rem; opacity: 0.65; }
        .hub-activity__item { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .hub-activity__label { flex: 1; min-width: 0; }
        .hub-activity__action {
          font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 999px;
          border: 1px solid var(--dakinis-accent, #2dd4bf); background: transparent;
          color: var(--dakinis-accent, #2dd4bf); cursor: pointer; white-space: nowrap;
        }
        .hub-activity__action:hover { background: rgba(45, 212, 191, 0.1); }
      `}</style>
    </section>
  );
}

/**
 * @param {object[]} timeline — filas hub.v1_get_dashboard.timeline
 */
export function mapHubTimelineEvents(timeline = []) {
  return timeline.map((row, index) => {
    const at = row.at || row.created_at || row.ts;
    let time = "";
    try {
      time = at
        ? new Date(at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : "";
    } catch {
      time = "";
    }
    const label = row.title || row.label || row.event_type || "Actividad";
    const product = row.product || row.source || "";
    return {
      id: row.id || `tl-${index}`,
      time,
      label: product ? `${label} · ${product}` : label,
      action:
        product === "streamautomator" || String(row.event_type || "").startsWith("stream.")
          ? "open-stream-automation"
          : row.action || row.event_type,
      actionLabel: row.actionLabel || (product === "streamautomator" ? "Automatización" : undefined),
      ai: String(row.event_type || "").startsWith("ai."),
      raw: row,
    };
  });
}
