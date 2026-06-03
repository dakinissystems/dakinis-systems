import { DAKINIS_URL_AKOENET, DAKINIS_URL_STREAMAUTOMATOR } from "./product-urls.js";
import { dakinisGetProduct } from "./products.js";

export const DAKINIS_ECOSYSTEM_SESSION_KEY = "dakinis_ecosystem_sso_v1";
export const DAKINIS_IDP_TOKENS_KEY = "dakinis_idp_tokens_v1";

const URL_BY_KEY = {
  streamautomator: DAKINIS_URL_STREAMAUTOMATOR,
  akoenet: DAKINIS_URL_AKOENET
};

/**
 * Guarda contexto de sesión Core para que productos externos puedan leerlo (mismo origen o postMessage futuro).
 * @param {{ token?: string, business?: object, user?: object }} session
 */
export function dakinisPersistEcosystemSession(session) {
  if (typeof sessionStorage === "undefined" || !session?.token) return;
  try {
    sessionStorage.setItem(
      DAKINIS_ECOSYSTEM_SESSION_KEY,
      JSON.stringify({
        token: session.token,
        business: session.business,
        user: session.user,
        savedAt: Date.now()
      })
    );
  } catch {
    /* quota / private mode */
  }
}

export function dakinisClearEcosystemSession() {
  try {
    sessionStorage.removeItem(DAKINIS_ECOSYSTEM_SESSION_KEY);
    sessionStorage.removeItem(DAKINIS_IDP_TOKENS_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @param {{ accessToken: string, refreshToken?: string|null }} tokens
 */
export function dakinisPersistIdpTokens(tokens) {
  if (typeof sessionStorage === "undefined" || !tokens?.accessToken) return;
  try {
    sessionStorage.setItem(
      DAKINIS_IDP_TOKENS_KEY,
      JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || null,
        savedAt: Date.now()
      })
    );
  } catch {
    /* ignore */
  }
}

export function dakinisReadIdpTokens() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DAKINIS_IDP_TOKENS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * URL de lanzamiento a producto externo o ruta Core.
 * @param {string} productId
 * @param {{ session?: { token?: string }, returnUrl?: string }} [opts]
 */
export function dakinisBuildProductLaunchUrl(productId, opts = {}) {
  const product = dakinisGetProduct(productId);
  if (!product) return "/";

  if (!product.external) {
    return product.corePath || "/hub";
  }

  const base = product.url || URL_BY_KEY[product.urlKey] || "";
  if (!base) return "/hub";

  const origin = base.replace(/\/$/, "");
  const hubPath = product.sso?.hubSsoPath || "";
  const url = new URL(hubPath ? `${origin}${hubPath.startsWith("/") ? hubPath : `/${hubPath}`}` : origin);
  url.searchParams.set("utm_source", "dakinis-hub");
  url.searchParams.set("utm_medium", "ecosystem");

  if (opts.session?.token) {
    url.searchParams.set("dakinis_sso", "1");
    const email = opts.session?.user?.email;
    if (typeof email === "string" && email.trim()) {
      url.searchParams.set("email", email.trim());
    }
  }

  if (opts.returnUrl) {
    url.searchParams.set("return_url", opts.returnUrl);
  }

  return url.href;
}

/**
 * Producto externo con token IdP guardado en Core → puente /ecosystem/launch antes de redirigir.
 * @param {string} productId
 * @param {{ idp?: { accessToken?: string } } | null} session
 */
export function dakinisNeedsEcosystemLaunchBridge(productId, session) {
  if (!session?.idp?.accessToken) return false;
  return dakinisProductRequiresIdpExchange(productId);
}

/**
 * @param {string} productId
 */
export function dakinisProductRequiresIdpExchange(productId) {
  const p = dakinisGetProduct(productId);
  return p?.sso?.mode === "idp-exchange";
}
