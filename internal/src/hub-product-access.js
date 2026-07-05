/** Mirror @brand/hub-product-access.js (internal API standalone). */

export const HUB_PLATFORM_SUPER_ADMIN_EMAIL = "christiandvillar@gmail.com";

export const HUB_ECOSYSTEM_PRODUCT_IDS = [
  "core",
  "lifeflow",
  "streamautomator",
  "akoenet",
  "tabletop",
];

export const HUB_OPTIONAL_ECOSYSTEM_PRODUCT_IDS = [
  "lifeflow",
  "streamautomator",
  "akoenet",
  "tabletop",
];

export const HUB_DEFAULT_TENANT_PRODUCTS = ["core"];

export function dakinisNormalizeHubProducts(list) {
  const set = new Set(["core"]);
  if (Array.isArray(list)) {
    for (const id of list) {
      const key = String(id || "").trim();
      if (HUB_ECOSYSTEM_PRODUCT_IDS.includes(key)) set.add(key);
    }
  }
  return HUB_ECOSYSTEM_PRODUCT_IDS.filter((id) => set.has(id));
}

export function dakinisIsHubPlatformSuperAdmin(email, ctx = {}) {
  if (ctx.is_platform_admin) return true;
  return String(email || "").trim().toLowerCase() === HUB_PLATFORM_SUPER_ADMIN_EMAIL;
}

export function dakinisResolveUserHubProducts(tenantAccess = [], email = "", ctx = {}) {
  if (dakinisIsHubPlatformSuperAdmin(email, ctx)) {
    return [...HUB_ECOSYSTEM_PRODUCT_IDS];
  }
  const set = new Set(["core"]);
  for (const row of tenantAccess) {
    for (const id of dakinisNormalizeHubProducts(row?.products)) {
      set.add(id);
    }
  }
  return HUB_ECOSYSTEM_PRODUCT_IDS.filter((id) => set.has(id));
}

export function dakinisHubProductEnabled(productId, enabledProducts) {
  const set = new Set(enabledProducts || HUB_DEFAULT_TENANT_PRODUCTS);
  const id = String(productId || "").trim();
  if (id === "hub" || id === "ai") return true;
  if (id === "dnd") return set.has("tabletop");
  if (id === "dakinis-one") return set.has("core");
  return set.has(id);
}

/**
 * @param {Array<{ id: string; product?: string }>} apps
 * @param {string[]} enabledProducts
 */
export function dakinisFilterHubApps(apps, enabledProducts) {
  return apps.filter((app) =>
    dakinisHubProductEnabled(app.id, enabledProducts) ||
    dakinisHubProductEnabled(app.product, enabledProducts)
  );
}
