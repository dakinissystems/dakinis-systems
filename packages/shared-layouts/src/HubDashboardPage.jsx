import HubShell from "./HubShell.jsx";
import { DashboardCard } from "../../shared-ux/src/DashboardCard.jsx";
import {
  HUB_DASHBOARD_SECTIONS,
  HUB_SECTION_WIDGETS,
  getHubSectionsBeforeApps,
} from "../../shared-ux/src/hub-dashboard.js";
import { getWidgetsForSection } from "../../shared-ux/src/widgets.js";
import { dashboardCardStyles } from "../../shared-ux/src/DashboardCard.jsx";

/**
 * Página referencia Hub «Mi día primero» — copiar/adaptar en repo dakinis-hub.
 */
export default function HubDashboardPage({ userName = "Usuario" }) {
  const sections = getHubSectionsBeforeApps();

  return (
    <HubShell
      header={
        <div className="dakinis-hub-header">
          <h1 className="dakinis-hub-header__title">Hola, {userName}</h1>
          <p className="dakinis-hub-header__subtitle">Tu día en Dakinis</p>
        </div>
      }
    >
      <style>{dashboardCardStyles}</style>
      <style>{`
        .dakinis-hub-header__title { margin: 0; font-size: 1.35rem; font-weight: 700; }
        .dakinis-hub-header__subtitle { margin: 0.15rem 0 0; font-size: 0.85rem; color: var(--dakinis-muted); }
        .dakinis-hub-dashboard { display: flex; flex-direction: column; gap: 1.75rem; }
        .dakinis-hub-section__title { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; }
        .dakinis-hub-section__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
      `}</style>
      <div className="dakinis-hub-dashboard">
        {sections.map((section) => {
          const widgets = getWidgetsForSection(section.id);
          return (
            <section key={section.id} id={section.id} className="dakinis-hub-section" aria-labelledby={`hub-${section.id}`}>
              <h2 id={`hub-${section.id}`} className="dakinis-hub-section__title">
                {section.title}
              </h2>
              <div className="dakinis-hub-section__grid">
                {widgets.length === 0 ? (
                  <DashboardCard title={section.title} value="—" status="Próximamente" />
                ) : (
                  widgets.map((w) => (
                    <DashboardCard
                      key={w.id}
                      title={w.title}
                      icon={w.icon}
                      value="—"
                      status={w.product}
                      actionLabel="Ver"
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
        <section id="apps" className="dakinis-hub-section">
          <h2 className="dakinis-hub-section__title">
            {HUB_DASHBOARD_SECTIONS.find((s) => s.id === "apps")?.title}
          </h2>
          <div className="dakinis-hub-section__grid">
            {HUB_SECTION_WIDGETS.apps?.map((id) => (
              <DashboardCard key={id} title="Mis aplicaciones" icon="grid-3x3" value="6 apps" actionLabel="Abrir" />
            ))}
          </div>
        </section>
      </div>
    </HubShell>
  );
}
