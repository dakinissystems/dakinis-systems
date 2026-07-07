import hubModulesJson from "./hub-modules.json" with { type: "json" };
import { dakinisHubModuleField, dakinisProductField } from "./i18n.js";
import { dakinisGetProduct, dakinisListSaleProducts } from "./products.js";
import { DAKINIS_URL_CORPORATE } from "./product-urls.js";
import { dakinisBuildProductLaunchUrl } from "./sso.js";

/** @type {typeof hubModulesJson} */
export const DAKINIS_ONE_MODULE_TILES = dakinisSortHubModuleTiles(hubModulesJson);

/**
 * Orden estable para el centro de aplicaciones (CRM primero, roadmap al final).
 * @param {typeof hubModulesJson} tiles
 */
export function dakinisSortHubModuleTiles(tiles) {
  return tiles.toSorted((a, b) => {
    const ao = Number(a.sortOrder ?? 999);
    const bo = Number(b.sortOrder ?? 999);
    if (ao !== bo) return ao - bo;
    return String(a.label || "").localeCompare(String(b.label || ""));
  });
}

/** @param {typeof hubModulesJson[number]} mod
 * @param {"es"|"en"} [locale]
 */
export function dakinisHubModuleToTile(mod, locale = "es") {
  return {
    ...mod,
    label: dakinisHubModuleField(mod, "label", locale),
    description: dakinisHubModuleField(mod, "description", locale)
  };
}

/** Productos del ecosistema como tiles en Hub. */
export function dakinisHubProductTiles(session, returnUrl, locale = "es") {
  return dakinisListSaleProducts().map((p) => ({
    id: p.id,
    label: dakinisProductField(p, "name", locale),
    description: dakinisProductField(p, "summary", locale),
    kind: p.external ? "external" : "core",
    path: p.external
      ? dakinisBuildProductLaunchUrl(p.id, { session, returnUrl })
      : p.corePath || "/hub",
    requiresAuth: false,
    status: p.status,
    ssoReady: Boolean(p.sso?.ssoReady)
  }));
}

/** Marketplace: solo productos externos (AkoeNet, StreamAutomator, …). */
export function dakinisHubMarketplaceTiles(session, returnUrl, locale = "es") {
  return dakinisHubProductTiles(session, returnUrl, locale).filter((tile) => tile.kind === "external");
}

export function dakinisHubCustomServicesTile(locale = "es") {
  const custom = dakinisGetProduct("custom");
  return {
    id: "custom",
    label: custom ? dakinisProductField(custom, "name", locale) : dakinisPickLocaleStringFallback(locale),
    description: custom
      ? dakinisProductField(custom, "summary", locale)
      : dakinisPickLocaleStringFallbackDesc(locale),
    kind: "corporate",
    path: `${DAKINIS_URL_CORPORATE.replace(/\/$/, "")}/servicios`,
    requiresAuth: false,
    status: "active"
  };
}

function dakinisPickLocaleStringFallback(locale) {
  return locale === "en" ? "Custom solutions" : "Soluciones a medida";
}

function dakinisPickLocaleStringFallbackDesc(locale) {
  return locale === "en"
    ? "Projects and integrations by Dakinis Systems."
    : "Proyectos e integraciones Dakinis Systems.";
}
