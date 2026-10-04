/**
 * Attention del Hub: acciones recomendadas + badges por producto.
 */

import { buildRecommendedActions } from "./hub-actions.js";

function toAttentionItem(a) {
  return {
    id: a.id,
    title: a.title,
    detail: a.detail,
    impact: a.impact,
    recommendation: a.recommendation,
    ctaLabel: a.ctaLabel,
    severity: a.severity,
    product: a.product,
    action: a.action,
    href: a.href,
  };
}

/**
 * @param {{ db?: object; summary?: object; enabledProducts?: string[]; apps?: object[]; actions?: object[] }} input
 */
export function buildHubAttention(input = {}) {
  const actions = Array.isArray(input.actions) ? input.actions : buildRecommendedActions(input);
  const attention = actions.slice(0, 8).map(toAttentionItem);

  const counts = Object.create(null);
  for (const item of attention) {
    const key = item.product || "hub";
    counts[key] = (counts[key] || 0) + 1;
  }

  const apps = (input.apps || []).map((app) => {
    const product = app.product || app.id;
    const badge = counts[product] || counts[app.id] || 0;
    return {
      ...app,
      alertCount: typeof app.alertCount === "number" ? app.alertCount : badge,
      notifications: typeof app.notifications === "number" ? app.notifications : badge,
    };
  });

  return { attention, apps, actions };
}
