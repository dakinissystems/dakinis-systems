/**
 * Tarjeta dashboard Hub/producto — contrato completo DES.
 */
import { LucideIcon } from "./LucideIcon.jsx";

export function DashboardCard({
  icon,
  title,
  value,
  actionLabel,
  status,
  trend,
  sparkline,
  aiHint,
  loading = false,
  error = null,
  children,
  className = "",
  onAction,
  onAiHintAction,
  quickActions = [],
  onQuickAction,
}) {
  if (loading) {
    return (
      <article className={`dakinis-card dakinis-dashboard-card dakinis-dashboard-card--loading ${className}`.trim()} aria-busy="true">
        <div className="dakinis-skeleton dakinis-skeleton--title" />
        <div className="dakinis-skeleton dakinis-skeleton--value" />
        <div className="dakinis-skeleton dakinis-skeleton--line" />
      </article>
    );
  }

  if (error) {
    return (
      <article className={`dakinis-card dakinis-dashboard-card dakinis-dashboard-card--error ${className}`.trim()}>
        <p className="dakinis-dashboard-card__error-title">{error.title || "No hemos podido cargar esto"}</p>
        <p className="dakinis-dashboard-card__error-hint">{error.hint || "Reinténtalo en unos segundos."}</p>
        {error.retryLabel ? (
          <button type="button" className="dakinis-dashboard-card__action" onClick={error.onRetry}>
            {error.retryLabel}
          </button>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className={`dakinis-card dakinis-dashboard-card ${className}`.trim()}
      aria-label={title || (typeof value === "string" ? value : undefined)}
    >
      <header className="dakinis-dashboard-card__head">
        {icon ? (
          <span className="dakinis-dashboard-card__icon" aria-hidden="true">
            {typeof icon === "string" ? <LucideIcon name={icon} size={20} /> : icon}
          </span>
        ) : null}
        {title ? <h3 className="dakinis-dashboard-card__title">{title}</h3> : null}
        {status ? <span className="dakinis-dashboard-card__status">{status}</span> : null}
      </header>
      {value != null ? (
        <p className="dakinis-dashboard-card__value">
          {value}
          {trend ? <span className="dakinis-dashboard-card__trend">{trend}</span> : null}
        </p>
      ) : null}
      {sparkline ? (
        <div className="dakinis-dashboard-card__sparkline" aria-hidden="true">
          {sparkline}
        </div>
      ) : null}
      {aiHint ? (
        <div className="dakinis-dashboard-card__ai-hint">
          <span className="dakinis-ai-badge">IA</span>
          <span>{aiHint.message}</span>
          {aiHint.actionLabel ? (
            <button type="button" className="dakinis-dashboard-card__ai-action" onClick={onAiHintAction}>
              {aiHint.actionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
      {quickActions.length > 0 ? (
        <div className="dakinis-dashboard-card__quick-actions" role="group" aria-label="Acciones rápidas">
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              type="button"
              className={`dakinis-dashboard-card__quick-btn${
                qa.variant === "primary" ? " dakinis-dashboard-card__quick-btn--primary" : ""
              }`}
              onClick={() => onQuickAction?.(qa.id, qa)}
            >
              {qa.label}
            </button>
          ))}
        </div>
      ) : null}
      {actionLabel ? (
        <button type="button" className="dakinis-dashboard-card__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

export const dashboardCardStyles = `
.dakinis-dashboard-card { display: flex; flex-direction: column; gap: 0.5rem; min-height: 7rem; transition: transform var(--dakinis-duration, 180ms) var(--dakinis-ease, ease); }
.dakinis-dashboard-card:hover { transform: scale(1.02); }
.dakinis-dashboard-card--loading { pointer-events: none; }
.dakinis-dashboard-card--error { border-color: rgba(231, 111, 111, 0.45); }
.dakinis-dashboard-card__head { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.dakinis-dashboard-card__icon { display: inline-flex; align-items: center; color: var(--dakinis-accent, #2dd4bf); flex-shrink: 0; }
.dakinis-dashboard-card__title { margin: 0; font-size: 0.9rem; font-weight: 600; flex: 1; }
.dakinis-dashboard-card__status { font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 999px; background: var(--dakinis-ai-glow, rgba(124,58,237,0.15)); color: var(--dakinis-muted, #b8c6d9); }
.dakinis-dashboard-card__value { margin: 0; font-size: 1.75rem; font-weight: 700; line-height: 1.1; }
.dakinis-dashboard-card__trend { margin-left: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--dakinis-accent, #2dd4bf); }
.dakinis-dashboard-card__sparkline { height: 2rem; opacity: 0.85; }
.dakinis-dashboard-card__ai-hint { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; font-size: 0.78rem; color: var(--dakinis-muted, #b8c6d9); padding: 0.35rem 0; border-top: 1px solid var(--dakinis-line, #23415f); margin-top: 0.25rem; }
.dakinis-dashboard-card__ai-action { font-size: 0.75rem; font-weight: 600; color: var(--dakinis-ai-soft, #a855f7); background: none; border: none; cursor: pointer; padding: 0; }
.dakinis-dashboard-card__action { margin-top: auto; align-self: flex-start; font-size: 0.82rem; background: none; border: none; color: var(--dakinis-accent, #2dd4bf); cursor: pointer; padding: 0; }
.dakinis-dashboard-card__quick-actions { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem; }
.dakinis-dashboard-card__quick-btn {
  font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.55rem; border-radius: 999px;
  border: 1px solid var(--dakinis-line, rgba(255,255,255,0.15));
  background: transparent; color: var(--dakinis-muted, #b8c6d9); cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.dakinis-dashboard-card__quick-btn:hover { border-color: var(--dakinis-accent, #2dd4bf); color: var(--dakinis-accent, #2dd4bf); }
.dakinis-dashboard-card__quick-btn--primary {
  border-color: var(--dakinis-accent, #2dd4bf);
  background: rgba(45, 212, 191, 0.12);
  color: var(--dakinis-accent, #2dd4bf);
}
.dakinis-dashboard-card__error-title { margin: 0; font-weight: 600; font-size: 0.9rem; }
.dakinis-dashboard-card__error-hint { margin: 0; font-size: 0.82rem; color: var(--dakinis-muted, #b8c6d9); }
@media (prefers-reduced-motion: reduce) { .dakinis-dashboard-card:hover { transform: none; } }
`;
