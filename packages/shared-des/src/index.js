/**
 * DES v1.0 — Experience System entry.
 * Layers: Foundation → Theme Engine → Experience (this) → Products
 */
export const DES_VERSION = "1.1.0";
export const DES_CODENAME = "navy-contrast";

/** Architecture layers (do not collapse into shared-brand). */
export const DES_LAYERS = {
  foundation: {
    package: "@dakinis/shared-foundation",
    version: "1.0.0",
    owns: ["spacing", "radius", "motion", "typography", "surfaces", "elevation", "a11y"],
  },
  theme: {
    package: "@dakinis/shared-theme",
    version: "1.1.0",
    owns: ["dark", "light", "high-contrast", "system-default", "product-accent", "persistence", "tailwind-bridge"],
  },
  experience: {
    package: "@dakinis/shared-des",
    version: DES_VERSION,
    owns: ["components", "patterns", "layouts", "charts", "ai-ui"],
  },
  brand: {
    package: "@dakinis/shared-brand",
    version: "1.0.0",
    owns: ["company", "products-catalog", "sso-urls", "hub-modules"],
    note: "Not a design-token God Package — catalog + BC facade only",
  },
};

export * from "./foundations/index.js";
export * from "./components/index.js";
export * from "./patterns/index.js";
export * from "./layouts/index.js";
export * from "./charts/index.js";
export * from "./branding/index.js";
export * from "./ai/index.js";
