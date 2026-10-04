/**
 * Deriva ítems de Attention del Hub a partir del dashboard.
 * Usa `dashboard.attention` si viene; si no, cae a `actions` + badges de apps.
 */

function normalizeItem(a, index = 0) {
  return {
    id: a.id || `att_${index}`,
    title: a.title || a.message || "Atención",
    detail: a.detail || a.message,
    impact: a.impact,
    recommendation: a.recommendation,
    ctaLabel: a.ctaLabel,
    severity: a.severity || "warning",
    product: a.product,
    href: a.href,
    action: a.action,
  };
}

function productBadge(app, items) {
  if (typeof app.alertCount === "number") return app.alertCount;
  if (typeof app.notifications === "number") return app.notifications;
  if (typeof app.badge === "number") return app.badge;
  return items.filter((it) => it.product === app.id || it.product === app.product).length;
}

/**
 * @param {object|null|undefined} dashboard
 */
export function deriveHubAttention(dashboard) {
  if (!dashboard) {
    return { count: 0, items: [], products: [] };
  }

  let items = [];
  if (Array.isArray(dashboard.attention) && dashboard.attention.length) {
    items = dashboard.attention.map(normalizeItem);
  } else if (Array.isArray(dashboard.actions)) {
    items = dashboard.actions.map((a, i) => normalizeItem({ ...a, severity: a.severity || "info" }, i));
  }

  const apps = Array.isArray(dashboard.apps) ? dashboard.apps : [];
  const products = apps.map((app) => ({
    id: app.id,
    name: app.name || app.id,
    badge: productBadge(app, items),
    product: app.product || app.id,
  }));

  return { count: items.length, items, products };
}
