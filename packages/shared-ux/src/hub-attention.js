/**
 * Derive Hub "attention" items — what needs action now across the suite.
 * Prefers `dashboard.attention`; falls back to recommended actions + product badges.
 */

/**
 * @typedef {object} HubAttentionItem
 * @property {string} id
 * @property {string} title
 * @property {string} [detail]
 * @property {string} [impact]
 * @property {string} [recommendation]
 * @property {string} [ctaLabel]
 * @property {'critical'|'warning'|'info'} [severity]
 * @property {string} [product]
 * @property {string} [href]
 * @property {string} [action]
 */

/**
 * @param {object|null|undefined} dashboard
 * @returns {{ count: number; items: HubAttentionItem[]; products: { id: string; name: string; badge: number }[] }}
 */
export function deriveHubAttention(dashboard) {
  if (!dashboard) {
    return { count: 0, items: [], products: [] };
  }

  /** @type {HubAttentionItem[]} */
  let items = [];
  if (Array.isArray(dashboard.attention) && dashboard.attention.length) {
    items = dashboard.attention.map((a, i) => ({
      id: a.id || `att_${i}`,
      title: a.title || a.message || "Atención",
      detail: a.detail || a.message,
      impact: a.impact,
      recommendation: a.recommendation,
      ctaLabel: a.ctaLabel,
      severity: a.severity || "warning",
      product: a.product,
      href: a.href,
      action: a.action,
    }));
  } else if (Array.isArray(dashboard.actions)) {
    items = dashboard.actions
      .filter((a) => a.severity === "critical" || a.severity === "warning" || a.severity === "info")
      .map((a) => ({
        id: a.id,
        title: a.title,
        detail: a.detail,
        impact: a.impact,
        recommendation: a.recommendation,
        ctaLabel: a.ctaLabel,
        severity: a.severity || "info",
        product: a.product,
        href: a.href,
        action: a.action,
      }));
  }

  const apps = Array.isArray(dashboard.apps) ? dashboard.apps : [];
  const products = apps.map((app) => {
    const badge =
      typeof app.alertCount === "number"
        ? app.alertCount
        : typeof app.notifications === "number"
          ? app.notifications
          : typeof app.badge === "number"
            ? app.badge
            : items.filter((it) => it.product === app.id || it.product === app.product).length;
    return {
      id: app.id,
      name: app.name || app.id,
      badge,
      product: app.product || app.id,
    };
  });

  return {
    count: items.length,
    items,
    products,
  };
}
