/** Email con acceso total al ecosistema Hub (platform super-admin). */
export const HUB_PLATFORM_SUPER_ADMIN_EMAIL = "christiandvillar@gmail.com";

/** Productos visibles en launcher Hub (orden canónico). */
export const HUB_ECOSYSTEM_PRODUCT_IDS = [
  "core",
  "lifeflow",
  "streamautomator",
  "akoenet",
  "tabletop",
];

/** Productos opcionales que el admin de plataforma puede habilitar por tenant. */
export const HUB_OPTIONAL_ECOSYSTEM_PRODUCT_IDS = [
  "lifeflow",
  "streamautomator",
  "akoenet",
  "tabletop",
];

/** Nuevos tenants: solo Core hasta que platform admin habilite más. */
export const HUB_DEFAULT_TENANT_PRODUCTS = ["core"];

const HUB_ECOSYSTEM_PRODUCT_ID_SET = new Set(HUB_ECOSYSTEM_PRODUCT_IDS);

/**
 * @param {unknown} list
 * @returns {string[]}
 */
export function dakinisNormalizeHubProducts(list) {
  const set = new Set(["core"]);
  if (Array.isArray(list)) {
    for (const id of list) {
      const key = String(id || "").trim();
      if (HUB_ECOSYSTEM_PRODUCT_ID_SET.has(key)) set.add(key);
    }
  }
  return HUB_ECOSYSTEM_PRODUCT_IDS.filter((id) => set.has(id));
}

/**
 * @param {string} email
 * @param {{ is_platform_admin?: boolean }} [ctx]
 */
export function dakinisIsHubPlatformSuperAdmin(email, ctx = {}) {
  if (ctx.is_platform_admin) return true;
  return String(email || "").trim().toLowerCase() === HUB_PLATFORM_SUPER_ADMIN_EMAIL;
}

/**
 * @param {Array<{ products?: string[] }>} tenantAccess
 * @param {string} email
 * @param {{ is_platform_admin?: boolean }} [ctx]
 */
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

/**
 * @param {string} productId
 * @param {string[]} enabledProducts
 */
export function dakinisHubProductEnabled(productId, enabledProducts) {
  const set = new Set(enabledProducts || HUB_DEFAULT_TENANT_PRODUCTS);
  const id = String(productId || "").trim();
  if (id === "hub" || id === "ai") return true;
  if (id === "dnd") return set.has("tabletop");
  if (id === "dakinis-one") return set.has("core");
  return set.has(id);
}
