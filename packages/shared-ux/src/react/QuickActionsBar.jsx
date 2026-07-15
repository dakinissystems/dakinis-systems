/**
 * Barra de acciones rápidas reutilizable (entidades, Hub, CRM).
 */
export default function QuickActionsBar({ actions = [], onAction, t = (k) => k, title }) {
  if (!actions.length) return null;

  return (
    <div className="dakinis-quick-actions" role="toolbar" aria-label={title || t("hub.quickActions") || "Acciones rápidas"}>
      {title ? <p className="dakinis-quick-actions__title">{title}</p> : null}
      <div className="dakinis-quick-actions__row">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`dakinis-quick-actions__btn${
              action.disabled ? " dakinis-quick-actions__btn--disabled" : ""
            }${action.variant === "primary" ? " dakinis-quick-actions__btn--primary" : ""}`}
            disabled={action.disabled}
            onClick={() => !action.disabled && onAction?.(action.id, action)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <style>{`
        .dakinis-quick-actions__title { margin: 0 0 0.5rem; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.65; }
        .dakinis-quick-actions__row { display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .dakinis-quick-actions__btn {
          font-size: 0.82rem; font-weight: 600; padding: 0.45rem 0.85rem; border-radius: 0.55rem;
          border: 1px solid var(--dakinis-line, rgba(255,255,255,0.15));
          background: var(--dakinis-surface-1, rgba(255,255,255,0.04));
          color: inherit; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease;
        }
        .dakinis-quick-actions__btn:hover:not(:disabled) {
          border-color: var(--dakinis-accent, #2dd4bf);
          background: rgba(45, 212, 191, 0.08);
        }
        .dakinis-quick-actions__btn--primary {
          border-color: var(--dakinis-accent, #2dd4bf);
          background: rgba(45, 212, 191, 0.15);
          color: var(--dakinis-accent, #2dd4bf);
        }
        .dakinis-quick-actions__btn--disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
