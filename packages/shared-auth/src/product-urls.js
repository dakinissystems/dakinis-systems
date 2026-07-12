/** URLs públicas por producto (enlaces en correos y OAuth return_to). */

const DEFAULTS = {
  auth: "https://auth.dakinissystems.com",
  core: "https://core.dakinissystems.com",
  lifeflow: "https://finance.dakinissystems.com",
  streamautomator: "https://streamautomator.com",
  akoenet: "https://akoenet.dakinissystems.com",
  tabletop: "https://tabletop.dakinissystems.com",
  hub: "https://hub.dakinissystems.com",
};

export function getProductFrontendUrl(productKey) {
  const key = String(productKey || "").trim().toLowerCase();
  const envMap = {
    auth: process.env.AUTH_PUBLIC_URL || process.env.FRONTEND_URL,
    core: process.env.CORE_WEB_URL || process.env.FRONTEND_URL_CORE,
    lifeflow: process.env.LIFEFLOW_WEB_URL || process.env.FINANZAS_WEB_URL,
    streamautomator: process.env.STREAMAUTOMATOR_WEB_URL || process.env.FRONTEND_URL,
    akoenet: process.env.AKOENET_FRONTEND_URL || process.env.FRONTEND_URL,
    tabletop: process.env.TABLETOP_WEB_URL || process.env.FRONTEND_URL,
    hub: process.env.HUB_WEB_URL,
  };
  const fromEnv = envMap[key];
  if (fromEnv) return String(fromEnv).trim().replace(/\/$/, "");
  return DEFAULTS[key] || DEFAULTS.hub;
}

export function resolveReturnToUrl(returnTo, productKey) {
  const raw = String(returnTo || "").trim();
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.protocol === "https:" || u.protocol === "http:") {
        return u.origin;
      }
    } catch {
      /* fall through */
    }
  }
  return getProductFrontendUrl(productKey);
}
