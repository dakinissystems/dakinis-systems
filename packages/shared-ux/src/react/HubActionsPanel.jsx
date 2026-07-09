/**
 * Panel de acciones recomendadas — Hub «Mi día».
 * @param {{ actions?: Array<{ id: string; severity?: string; title: string; detail?: string; action: string }>; onAction?: (action: string) => void; t?: (k: string) => string }} props
 */
export default function HubActionsPanel({ actions = [], onAction, t = (k) => k }) {
  if (!actions.length) return null;

  const icon = { critical: "⚠", warning: "!", info: "→" };

  return (
    <section className="hub-actions" aria-labelledby="hub-actions-title">
      <h2 id="hub-actions-title" className="hub-actions__title">
        {t("hub.actions.title") || "Acciones recomendadas"}
      </h2>
      <ul className="hub-actions__list">
        {actions.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              className={`hub-actions__item hub-actions__item--${a.severity || "info"}`}
              onClick={() => onAction?.(a.action, a)}
            >
              <span className="hub-actions__icon" aria-hidden>
                {icon[a.severity] || "→"}
              </span>
              <span className="hub-actions__text">
                <span className="hub-actions__label">{a.title}</span>
                {a.detail ? <span className="hub-actions__detail">{a.detail}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <style>{`
        .hub-actions__title { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; }
        .hub-actions__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .hub-actions__item {
          display: flex; align-items: flex-start; gap: 0.65rem; width: 100%;
          text-align: left; padding: 0.75rem 1rem; border-radius: 0.65rem;
          border: 1px solid var(--dakinis-border, rgba(255,255,255,0.08));
          background: var(--dakinis-surface-1, rgba(255,255,255,0.04));
          color: inherit; cursor: pointer; font: inherit;
        }
        .hub-actions__item:hover { border-color: var(--dakinis-primary, #2dd4bf); }
        .hub-actions__item--critical { border-color: rgba(239,68,68,0.45); }
        .hub-actions__item--warning { border-color: rgba(245,158,11,0.4); }
        .hub-actions__icon { font-weight: 700; opacity: 0.9; min-width: 1.25rem; }
        .hub-actions__label { display: block; font-weight: 600; font-size: 0.9rem; }
        .hub-actions__detail { display: block; font-size: 0.8rem; opacity: 0.75; margin-top: 0.15rem; }
      `}</style>
    </section>
  );
}
