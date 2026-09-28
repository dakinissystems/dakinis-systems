/**
 * @dakinis/design-system v1.0
 * Versioned façade over shared-des (+ Platform UI vocabulary).
 * Apps should depend on this package instead of copying DES trees.
 */

export const DES_VERSION = "1.0.0";

export * from "../../shared-des/src/index.js";
export { DES_TOKENS_META } from "./tokens.js";
export { DES_THEMES_META } from "./themes.js";
export { DES_PLATFORM_UI, DES_PRODUCT_UI } from "./components.js";
export { DES_LAYOUTS_META } from "./layouts.js";
export { DES_PATTERNS_EXTENDED } from "./patterns.js";
export {
  UI_STATE_COMPONENTS,
  PLATFORM_UI_STATES,
} from "./ui-states.js";
