import { query } from "../lib/db.js";
import {
  dakinisFilterHubApps,
  dakinisNormalizeHubProducts,
  dakinisResolveUserHubProducts,
} from "../hub-product-access.js";

/**
 * @param {string} userId
 */
export async function fetchUserHubProducts(userId) {
  try {
    const { rows } = await query(`SELECT hub.v1_get_user_hub_products($1::uuid) AS data`, [userId]);
    const data = rows[0]?.data ?? null;
    if (!data) {
      return {
        products: ["core"],
        isPlatformAdmin: false,
        email: null,
        tenantHubAccess: [],
      };
    }
    const tenantAccess = Array.isArray(data.tenant_hub_access)
      ? data.tenant_hub_access
      : data.tenant_hub_access
        ? JSON.parse(JSON.stringify(data.tenant_hub_access))
        : [];
    const products = Array.isArray(data.products)
      ? data.products
      : dakinisResolveUserHubProducts(tenantAccess, data.email, {
          is_platform_admin: Boolean(data.is_platform_admin),
        });
    return {
      products: dakinisNormalizeHubProducts(products),
      isPlatformAdmin: Boolean(data.is_platform_admin),
      email: data.email ?? null,
      tenantHubAccess: tenantAccess,
    };
  } catch (err) {
    console.warn("[internal] hub product access fallback:", err instanceof Error ? err.message : err);
    return {
      products: ["core"],
      isPlatformAdmin: false,
      email: null,
      tenantHubAccess: [],
    };
  }
}

/**
 * @param {string} tenantSlug
 * @param {string[]} products
 */
export async function upsertTenantHubProducts(tenantSlug, products) {
  const slug = String(tenantSlug || "").trim().toLowerCase();
  if (!slug) throw new Error("tenant_slug_required");
  const normalized = dakinisNormalizeHubProducts(products);
  await query(
    `INSERT INTO hub.tenant_product_access (tenant_slug, products, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (tenant_slug) DO UPDATE SET
       products = EXCLUDED.products,
       updated_at = now()`,
    [slug, JSON.stringify(normalized)]
  );
  return { tenantSlug: slug, products: normalized };
}

/**
 * @param {string} tenantSlug
 */
export async function getTenantHubProducts(tenantSlug) {
  const slug = String(tenantSlug || "").trim().toLowerCase();
  const { rows } = await query(
    `SELECT products FROM hub.tenant_product_access WHERE lower(tenant_slug) = lower($1) LIMIT 1`,
    [slug]
  );
  const raw = rows[0]?.products;
  const list = Array.isArray(raw) ? raw : raw ? JSON.parse(JSON.stringify(raw)) : null;
  return { tenantSlug: slug, products: dakinisNormalizeHubProducts(list || ["core"]) };
}

export { dakinisFilterHubApps };
