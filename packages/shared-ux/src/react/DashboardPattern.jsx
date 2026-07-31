/**
 * Patrón Dashboard DES — secciones canónicas sin AppShell anidado.
 * Orden: topbar → widgets → cards → timeline → quickActions.
 * Para shell completo usar DashboardTemplate de @dakinis/shared-layouts.
 */
export default function DashboardPattern({
  topbar,
  widgets,
  cards,
  timeline,
  quickActions,
  className = "",
  children,
}) {
  return (
    <div className={`dakinis-dashboard dakinis-pattern-dashboard ${className}`.trim()}>
      {topbar ? <section className="dakinis-dashboard__topbar">{topbar}</section> : null}
      {widgets ? (
        <section className="dakinis-dashboard__widgets" aria-label="Widgets">
          {widgets}
        </section>
      ) : null}
      {cards ? (
        <section className="dakinis-dashboard__cards" aria-label="Tarjetas">
          {cards}
        </section>
      ) : null}
      {timeline ? (
        <section className="dakinis-dashboard__timeline" aria-label="Actividad">
          {timeline}
        </section>
      ) : null}
      {quickActions ? (
        <section className="dakinis-dashboard__actions" aria-label="Acciones rápidas">
          {quickActions}
        </section>
      ) : null}
      {children}
    </div>
  );
}
