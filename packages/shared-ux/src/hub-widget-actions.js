/**
 * Acciones al pulsar «Ver» en widgets del Hub dashboard.
 */

/** Widget Hub nativo → sección DOM (#id) */
const HUB_WIDGET_SCROLL_TARGETS = {
  "hub-today-agenda": "agenda",
  "hub-ai-summary": "ai-summary",
  "hub-notifications-unread": "notifications",
  "hub-recent-activity": "activity",
  "hub-app-launcher": "apps",
};

/** product slug del widget → id en HUB_APPS / launcher */
const HUB_WIDGET_PRODUCT_APP_ID = {
  core: "core",
  lifeflow: "lifeflow",
  streamautomator: "streamautomator",
  akoenet: "akoenet",
  tabletop: "tabletop",
};

/**
 * @param {{ id: string; product: string; section?: string }} widget
 * @param {Array<{ id: string; product?: string; url?: string; name?: string }>} apps
 * @returns {{ type: "scroll"; targetId: string } | { type: "app"; app: object } | { type: "url"; href: string } | null}
 */
export function dakinisResolveHubWidgetOpen(widget, apps = []) {
  const scrollId = HUB_WIDGET_SCROLL_TARGETS[widget.id];
  if (scrollId) return { type: "scroll", targetId: scrollId };

  const appId = HUB_WIDGET_PRODUCT_APP_ID[widget.product];
  const app = appId
    ? apps.find((a) => a.id === appId)
    : apps.find((a) => a.product === widget.product || a.id === widget.product);
  if (app) return { type: "app", app };

  if (widget.product === "ai") {
    return { type: "url", href: "https://ai.dakinissystems.com/?utm_source=dakinis-hub&utm_medium=widget" };
  }

  if (widget.section) return { type: "scroll", targetId: widget.section };

  return null;
}

/**
 * @param {{ type: string; targetId?: string; app?: object; href?: string }} action
 * @param {{ onAppOpen?: (app: object) => void }} handlers
 */
export function dakinisRunHubWidgetAction(action, handlers = {}) {
  if (!action) return;
  if (action.type === "scroll" && action.targetId) {
    document.getElementById(action.targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action.type === "app" && action.app && handlers.onAppOpen) {
    handlers.onAppOpen(action.app);
    return;
  }
  if (action.type === "url" && action.href) {
    window.location.href = action.href;
  }
}
