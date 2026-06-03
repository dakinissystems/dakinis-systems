import hubModulesJson from "./hub-modules.json" with { type: "json" };
import { dakinisListSaleProducts } from "./products.js";
import { DAKINIS_URL_CORPORATE } from "./product-urls.js";
import { dakinisBuildProductLaunchUrl } from "./sso.js";

/** @type {typeof hubModulesJson} */
export const DAKINIS_ONE_MODULE_TILES = hubModulesJson;

/** Productos del ecosistema como tiles en Hub. */
export function dakinisHubProductTiles(session, returnUrl) {
  return dakinisListSaleProducts().map((p) => ({
    id: p.id,
    label: p.name,
    description: p.summary,
    kind: p.external ? "external" : "core",
    path: p.external
      ? dakinisBuildProductLaunchUrl(p.id, { session, returnUrl })
      : p.corePath || "/hub",
    requiresAuth: false,
    status: p.status,
    ssoReady: Boolean(p.sso?.ssoReady)
  }));
}

export function dakinisHubCustomServicesTile() {
  return {
    id: "custom",
    label: "Soluciones a medida",
    description: "Proyectos e integraciones Dakinis Systems.",
    kind: "corporate",
    path: `${DAKINIS_URL_CORPORATE.replace(/\/$/, "")}/servicios`,
    requiresAuth: false,
    status: "active"
  };
}
