/**
 * Iconografía Dakinis — Lucide como única librería autorizada.
 * Instalar en apps: npm i lucide-react (web) o lucide (vanilla).
 *
 * @see https://lucide.dev
 */

export const DAKINIS_ICON_LIBRARY = "lucide";

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

/** Tamaños estándar (px). */
export const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * @param {string} name — nombre Lucide kebab-case
 * @param {{ size?: keyof typeof ICON_SIZES; className?: string }} [opts]
 */
export function iconProps(name, opts = {}) {
  const size = ICON_SIZES[opts.size || "md"] || ICON_SIZES.md;
  return {
    name,
    size,
    strokeWidth: 2,
    className: opts.className || "",
    "aria-hidden": true,
  };
}
