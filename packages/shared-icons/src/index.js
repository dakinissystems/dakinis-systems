/**
 * Iconografía Dakinis — Lucide como única librería autorizada.
 * Instalar en apps: npm i lucide-react (web) o lucide (vanilla).
 *
 * @see https://lucide.dev
 */

export const DAKINIS_ICON_LIBRARY = "lucide";

/** Tamaños estándar (px) — prohibido usar otros en UI nueva. */
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

/** Pesos de trazo Lucide. */
export const ICON_WEIGHTS = {
  outline: 1.75,
  filled: 2.5,
  duotone: 2,
};

/** Iconos canónicos Hub Navigation Language. */
export const HUB_ICONS = {
  home: "home",
  search: "search",
  notifications: "bell",
  profile: "user",
  help: "help-circle",
};

/** Iconos producto / widgets. */
export const PRODUCT_ICONS = {
  core: "building-2",
  lifeflow: "heart-pulse",
  streamautomator: "radio",
  akoenet: "messages-square",
  tabletop: "swords",
  ai: "sparkles",
  hub: "layout-grid",
  dnd: "swords",
};

/** Iconos estados UX. */
export const STATE_ICONS = {
  success: "check-circle",
  error: "alert-circle",
  warning: "alert-triangle",
  loading: "loader-circle",
  offline: "wifi-off",
  empty: "inbox",
};

/**
 * @param {string} name — nombre Lucide kebab-case
 * @param {{ size?: keyof typeof ICON_SIZES; weight?: keyof typeof ICON_WEIGHTS; className?: string }} [opts]
 */
export function iconProps(name, opts = {}) {
  const size = ICON_SIZES[opts.size || "md"] || ICON_SIZES.md;
  const strokeWidth = ICON_WEIGHTS[opts.weight || "outline"] || ICON_WEIGHTS.outline;
  return {
    name,
    size,
    strokeWidth,
    className: opts.className || "",
    "aria-hidden": true,
  };
}
