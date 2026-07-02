/** Marca pública del producto (UI, PDF, exports). Repo interno: DND / dakinis-tabletop */

export const BRAND_KEYS = {
  productName: "brand.productName",
  fullName: "brand.fullName",
  tagline: "brand.tagline",
} as const;

/** MVP: reglas SRD 5e — no usar como nombre del producto */
export const DEFAULT_RULESET = "D&D 5e";

export const PRODUCT_DOMAINS = {
  web: "tabletop.dakinissystems.com",
  api: "tabletop-api.dakinissystems.com",
} as const;
