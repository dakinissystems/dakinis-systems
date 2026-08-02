/**
 * @dakinis/shared-brand — company/product catalog + BC facade.
 * Tokens/themes: prefer @dakinis/shared-foundation + @dakinis/shared-theme (DES v1 layers).
 */
export { default as company, dakinisCompanyTagline } from "./company.js";
export * from "./i18n.js";
export * from "./product-urls.js";
export * from "./products.js";
export * from "./hub-modules.js";
export * from "./workspace-addons.js";
export * from "./social-links.js";
export * from "./pricing-links.js";
export * from "./analytics.js";
export * from "./sso.js";
export * from "./hub-product-access.js";
export * from "./hub-product-logos.js";

/* Design-system BC (thin re-exports — do not grow new tokens here) */
export {
  DAKINIS_PRODUCT_THEMES,
  DAKINIS_BRAND_COLORS,
} from "../../shared-theme/src/product-accents.js";
export {
  DAKINIS_SURFACES,
  DAKINIS_SURFACE_STACK,
  DAKINIS_SURFACE_LEVELS,
} from "../../shared-foundation/src/surfaces.js";
export {
  DAKINIS_SEMANTIC_COLORS,
  DAKINIS_AI_ACCENT,
} from "../../shared-foundation/src/semantic-colors.js";
export { DAKINIS_ELEVATION, DAKINIS_SURFACE_CSS } from "../../shared-foundation/src/elevation.js";
export {
  DAKINIS_SPACING,
  DAKINIS_SPACING_ALLOWED,
  isAllowedSpacing,
} from "../../shared-foundation/src/spacing.js";
export { DAKINIS_TYPE_SCALE, DAKINIS_BRAND_FONT_STACK } from "../../shared-foundation/src/typography.js";
export { DAKINIS_MOTION, DAKINIS_MOTION_USAGE } from "../../shared-foundation/src/motion.js";
export { DAKINIS_SHADOW } from "../../shared-foundation/src/shadow.js";
export { DAKINIS_RADIUS } from "../../shared-foundation/src/radius.js";
export { DAKINIS_LAYOUT, DAKINIS_ICON_SIZES } from "../../shared-foundation/src/layout.js";
export { DAKINIS_A11Y, DAKINIS_A11Y_CHECKLIST } from "../../shared-foundation/src/accessibility.js";
export {
  DAKINIS_BREAKPOINTS,
  DAKINIS_RESPONSIVE_LAYOUT,
  getResponsiveLayout,
} from "../../shared-foundation/src/responsive.js";
export {
  DAKINIS_THEMES,
  applyDesTheme,
  getProductAccent,
} from "../../shared-theme/src/themes.js";
export * from "../../shared-theme/src/theme-engine.js";
export {
  desTailwindThemeExtend,
  desTailwindColors,
} from "../../shared-theme/src/tailwind-preset.js";

export { default as productsCatalog } from "./products.json" with { type: "json" };
export { default as hubModulesCatalog } from "./hub-modules.json" with { type: "json" };
export { default as workspaceAddonsCatalog } from "./workspace-addons.json" with { type: "json" };
export { default as workspaceWidgetsCatalog } from "./workspace-widgets.json" with { type: "json" };

export const SHARED_BRAND_DES_COMPAT = "1.0.0";
