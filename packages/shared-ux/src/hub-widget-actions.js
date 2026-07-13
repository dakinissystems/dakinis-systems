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
    handlers.onAppOpen(action.app, action.path);
    return;
  }
  if (action.type === "url" && action.href) {
    window.location.href = action.href;
  }
}

/** Acciones recomendadas del panel «Mi día» → scroll o abrir app */
const RECOMMENDED_ACTION_TARGETS = {
  "open-notifications": { type: "scroll", targetId: "notifications" },
  "open-apps": { type: "scroll", targetId: "apps" },
  "open-core-orders": { product: "core" },
  "open-core-inventory": { product: "core" },
  "open-core-calendar": { product: "core" },
  "open-lifeflow": { product: "lifeflow" },
  "open-stream-calendar": { product: "streamautomator" },
  "open-stream-director": { product: "streamautomator", path: "/director" },
  "open-stream-automation": { product: "streamautomator", path: "/automation" },
  "open-stream-campaigns": { product: "streamautomator", path: "/creator/campaign-kits" },
  "open-akoenet": { product: "akoenet" },
};

/**
 * @param {string} actionId
 * @param {Array<{ id: string; product?: string }>} apps
 */
export function dakinisResolveHubRecommendedAction(actionId, apps = []) {
  const spec = RECOMMENDED_ACTION_TARGETS[actionId];
  if (!spec) return null;
  if (spec.type === "scroll") return spec;
  if (spec.path) {
    const app = apps.find((a) => a.id === spec.product || a.product === spec.product);
    return app ? { type: "app", app, path: spec.path } : null;
  }
  const app = apps.find((a) => a.id === spec.product || a.product === spec.product);
  return app ? { type: "app", app } : null;
}

/**
 * @param {string} actionId
 * @param {{ apps?: object[]; onAppOpen?: (app: object) => void }} ctx
 */
export function dakinisRunHubRecommendedAction(actionId, ctx = {}) {
  const resolved = dakinisResolveHubRecommendedAction(actionId, ctx.apps || []);
  dakinisRunHubWidgetAction(resolved, { onAppOpen: ctx.onAppOpen });
}
