/**
 * F1 readiness — widgets Mi día with real data from ≥2 products.
 */

const PRODUCT_WIDGET_KEYS = {
  hub: ["hub-notifications-unread", "hub-today-agenda", "hub-recent-activity"],
  core: ["core-sales-today", "core-orders-pending", "core-appointments-today", "core-business-health"],
  streamautomator: ["stream-next-live", "stream-posts-week", "stream-upcoming", "stream-automation-rules"],
  akoenet: ["akoenet-unread-messages", "akoenet-online", "akoenet-new-members"],
  lifeflow: ["lifeflow-score", "lifeflow-financial-health", "lifeflow-calendar"],
};

function widgetHasRealData(entry) {
  if (!entry || entry.value == null) return false;
  const v = String(entry.value).trim();
  if (!v || v === "—" || v === "-" || v === "0" || v === "0 €") return false;
  if (
    v === "Sin eventos" ||
    v === "Sin score" ||
    v === "Sin actividad" ||
    v === "Sin negocios" ||
    v === "Próximamente" ||
    v === "Ver en Core"
  ) {
    return false;
  }
  return true;
}

/**
 * @param {Record<string, { value?: string }>} widgetValues
 * @param {string[]} [enabledProducts]
 */
export function computeF1WidgetCoverage(widgetValues = {}, enabledProducts = null) {
  const products = [];
  for (const [product, keys] of Object.entries(PRODUCT_WIDGET_KEYS)) {
    if (Array.isArray(enabledProducts) && enabledProducts.length && product !== "hub") {
      if (!enabledProducts.includes(product)) continue;
    }
    const hit = keys.some((k) => widgetHasRealData(widgetValues[k]));
    if (hit) products.push(product);
  }

  const nonHub = products.filter((p) => p !== "hub");
  return {
    productsWithData: products,
    productCount: products.length,
    nonHubCount: nonHub.length,
    /** STATUS Hub 90%: widgets con datos reales de ≥2 productos (excl. hub-only). */
    f1Ready: nonHub.length >= 2,
  };
}
