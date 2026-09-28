/**
 * Hub Attention payload — derived from recommended actions + product badges.
 * Consumed by HubAttentionPanel via dashboard.attention / apps[].alertCount.
 */

import { buildRecommendedActions } from "./hub-actions.js";

/**
 * @param {{ db?: object; summary?: object; enabledProducts?: string[]; apps?: object[]; actions?: object[] }} input
 * @returns {{ attention: object[]; apps: object[]; actions: object[] }}
 */
export function buildHubAttention(input = {}) {
  const actions = Array.isArray(input.actions) ? input.actions : buildRecommendedActions(input);
  const attention = actions
    .filter((a) => a.severity === "critical" || a.severity === "warning" || a.severity === "info")
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      title: a.title,
      detail: a.detail,
      severity: a.severity,
      product: a.product,
      action: a.action,
      href: a.href,
    }));

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
