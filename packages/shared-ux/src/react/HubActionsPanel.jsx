import { resolveHubT } from "../hub-i18n.js";

const SEVERITY_META = {
  critical: { icon: "!", label: "Urgente" },
  warning: { icon: "!", label: "Atención" },
  info: { icon: "→", label: "Sugerencia" },
};

/**
 * Panel de acciones recomendadas — Hub «Mi día».
 */
export default function HubActionsPanel({ actions = [], onAction, t }) {
  if (!actions.length) return null;

  const title = resolveHubT(t, "hub.actions.title", "Qué hacer ahora");
  const subtitle = resolveHubT(t, "hub.actions.subtitle", "");
  const defaultCta = resolveHubT(t, "hub.actions.cta", "Abrir");

  return (
    <section className="hub-actions" aria-labelledby="hub-actions-title">
      <header className="hub-actions__head">
        <h2 id="hub-actions-title" className="hub-actions__title">
          {title}
        </h2>
        {subtitle ? <p className="hub-actions__subtitle">{subtitle}</p> : null}
      </header>
      <ul className="hub-actions__list">
        {actions.map((a) => {
          const meta = SEVERITY_META[a.severity] || SEVERITY_META.info;
          const cta = a.ctaLabel || defaultCta;
          return (
            <li key={a.id}>
              <button
                type="button"
                className={`hub-actions__item hub-actions__item--${a.severity || "info"}`}
                onClick={() => onAction?.(a.action, a)}
              >
                <span className={`hub-actions__badge hub-actions__badge--${a.severity || "info"}`} aria-hidden>
                  {meta.icon}
                </span>
                <span className="hub-actions__body">
                  <span className="hub-actions__label">{a.title}</span>
                  {a.detail ? <span className="hub-actions__detail">{a.detail}</span> : null}
                </span>
                <span className="hub-actions__cta">{cta}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <style>{`
        .hub-actions__head { margin-bottom: 0.85rem; }
        .hub-actions__title { margin: 0; font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em; }
        .hub-actions__subtitle { margin: 0.2rem 0 0; font-size: 0.82rem; color: var(--dakinis-muted, rgba(255,255,255,0.55)); line-height: 1.4; }
        .hub-actions__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; }
        .hub-actions__item {
          display: flex; align-items: center; gap: 0.75rem; width: 100%;
          text-align: left; padding: 0.85rem 1rem; border-radius: 0.75rem;
          border: 1px solid var(--dakinis-border, rgba(255,255,255,0.1));
          background: var(--dakinis-surface-1, rgba(255,255,255,0.04));
          color: inherit; cursor: pointer; font: inherit;
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease;
        }
        .hub-actions__item:hover {
          border-color: var(--dakinis-primary, #2dd4bf);
          background: var(--dakinis-surface-2, rgba(45,212,191,0.06));
        }
        .hub-actions__item:active { transform: scale(0.995); }
        .hub-actions__item--critical { border-color: rgba(239,68,68,0.35); }
        .hub-actions__item--warning { border-color: rgba(245,158,11,0.35); }
        .hub-actions__badge {
          flex-shrink: 0; width: 2rem; height: 2rem; border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.9rem;
          background: rgba(255,255,255,0.06);
        }
        .hub-actions__badge--critical { background: rgba(239,68,68,0.15); color: #fca5a5; }
        .hub-actions__badge--warning { background: rgba(245,158,11,0.15); color: #fcd34d; }
        .hub-actions__badge--info { background: rgba(45,212,191,0.12); color: var(--dakinis-primary, #2dd4bf); }
        .hub-actions__body { flex: 1; min-width: 0; }
        .hub-actions__label { display: block; font-weight: 600; font-size: 0.92rem; line-height: 1.35; }
        .hub-actions__detail { display: block; font-size: 0.8rem; opacity: 0.72; margin-top: 0.2rem; line-height: 1.4; }
        .hub-actions__cta {
          flex-shrink: 0; font-size: 0.78rem; font-weight: 600;
          color: var(--dakinis-primary, #2dd4bf); white-space: nowrap;
        }
        @media (max-width: 520px) {
          .hub-actions__item { flex-wrap: wrap; }
          .hub-actions__cta { width: 100%; padding-left: 2.75rem; text-align: left; }
        }
      `}</style>
    </section>
  );
}
