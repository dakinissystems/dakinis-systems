import HubShell from "./HubShell.jsx";
import { DashboardCard } from "../../shared-ux/src/DashboardCard.jsx";
import {
  HUB_DASHBOARD_SECTIONS,
  HUB_SECTION_WIDGETS,
  getHubSectionsBeforeApps,
} from "../../shared-ux/src/hub-dashboard.js";
import { getWidgetsForSection } from "../../shared-ux/src/widgets.js";
import { getWidgetDisplay } from "../../shared-ux/src/hub-widget-values.js";
import { dakinisResolveHubWidgetOpen, dakinisRunHubWidgetAction, dakinisRunHubRecommendedAction } from "../../shared-ux/src/hub-widget-actions.js";
import { dakinisHubProductEnabled } from "../../shared-brand/src/hub-product-access.js";
import { HubProductIcon } from "../../shared-ux/src/HubProductIcon.jsx";
import HubActionsPanel from "../../shared-ux/src/react/HubActionsPanel.jsx";
import { dashboardCardStyles } from "../../shared-ux/src/DashboardCard.jsx";

/**
 * Página referencia Hub «Mi día primero» — copiar/adaptar en repo dakinis-hub.
 * @param {{ userName?: string; dashboard?: object }} props
 */
export default function HubDashboardPage({
  userName = "Usuario",
  dashboard = null,
  sidebar = null,
  headerExtra = null,
  HeaderExtraComponent = null,
  headerExtraProps = null,
  onAppOpen = null,
  onWidgetOpen = null,
}) {
  const sections = getHubSectionsBeforeApps();
  const widgetValues = dashboard?.widgetValues || {};
  const apps = dashboard?.apps || [];
  const enabledProducts = dashboard?.enabledProducts || null;
  const recommendedActions = dashboard?.actions || [];

  function widgetsForSection(sectionId) {
    const widgets = getWidgetsForSection(sectionId);
    if (!enabledProducts?.length) return widgets;
    return widgets.filter(
      (w) => w.product === "hub" || dakinisHubProductEnabled(w.product, enabledProducts)
    );
  }

  return (
    <HubShell
      sidebar={sidebar}
      header={
        <div className="dakinis-hub-header">
          <div className="dakinis-hub-header__row">
            <div>
              <h1 className="dakinis-hub-header__title">Hola, {userName}</h1>
              <p className="dakinis-hub-header__subtitle">
                {dashboard?.miDiaEnabled ? "Tu día en Dakinis" : "Centro de la suite Dakinis"}
              </p>
            </div>
            {HeaderExtraComponent ? (
              <HeaderExtraComponent {...(headerExtraProps || {})} />
            ) : (
              headerExtra
            )}
          </div>
        </div>
      }
    >
      <style>{dashboardCardStyles}</style>
      <style>{`
        .dakinis-hub-header__row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .dakinis-hub-header__title { margin: 0; font-size: 1.35rem; font-weight: 700; }
        .dakinis-hub-header__subtitle { margin: 0.15rem 0 0; font-size: 0.85rem; color: var(--dakinis-muted); }
        .dakinis-hub-dashboard { display: flex; flex-direction: column; gap: 1.75rem; }
        .dakinis-hub-section__title { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; }
        .dakinis-hub-section__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
        .dakinis-dashboard-card--app-launcher .dakinis-dashboard-card__head { align-items: center; }
        .dakinis-dashboard-card--app-launcher .dakinis-dashboard-card__value { font-size: 1.15rem; font-weight: 600; }
      `}</style>
      <div className="dakinis-hub-dashboard">
        {recommendedActions.length > 0 ? (
          <HubActionsPanel
            actions={recommendedActions}
            onAction={(actionId) => dakinisRunHubRecommendedAction(actionId, { apps, onAppOpen })}
          />
        ) : null}
        {sections.map((section) => {
          const widgets = widgetsForSection(section.id);
          return (
            <section key={section.id} id={section.id} className="dakinis-hub-section" aria-labelledby={`hub-${section.id}`}>
              <h2 id={`hub-${section.id}`} className="dakinis-hub-section__title">
                {section.title}
              </h2>
              <div className="dakinis-hub-section__grid">
                {widgets.length === 0 ? (
                  <DashboardCard title={section.title} value="—" status="Próximamente" />
                ) : (
                  widgets.map((w) => {
                    const display = getWidgetDisplay(w.id, widgetValues);
                    const widgetAction = dakinisResolveHubWidgetOpen(w, apps);
                    return (
                      <DashboardCard
                        key={w.id}
                        title={w.title}
                        icon={w.icon}
                        value={display.value}
                        status={display.status || w.product}
                        actionLabel={widgetAction ? "Ver" : undefined}
                        onAction={
                          widgetAction
                            ? () => {
                                if (onWidgetOpen) onWidgetOpen(w, widgetAction);
                                else dakinisRunHubWidgetAction(widgetAction, { onAppOpen });
                              }
                            : undefined
                        }
                      />
                    );
                  })
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
            {apps.length > 0
              ? apps.map((app) => (
                  <DashboardCard
                    key={app.id}
                    className="dakinis-dashboard-card--app-launcher"
                    icon={<HubProductIcon appId={app.id} product={app.product} size={20} />}
                    value={app.name}
                    actionLabel="Abrir"
                    onAction={onAppOpen ? () => onAppOpen(app) : undefined}
                  />
                ))
              : HUB_SECTION_WIDGETS.apps?.map((id) => (
                  <DashboardCard key={id} title="Mis aplicaciones" icon="grid-3x3" value="6 apps" actionLabel="Abrir" />
                ))}
          </div>
        </section>
      </div>
    </HubShell>
  );
}
