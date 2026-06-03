/**
 * Eventos de conversión del ecosistema (Landing → Hub → producto).
 * En prod: breadcrumbs Sentry si está cargado; siempre dataLayer opcional.
 */

export const DAKINIS_ANALYTICS_EVENTS = Object.freeze({
  CTA_DAKINIS_ONE_CLICKED: "cta_dakinis_one_clicked",
  HUB_OPENED: "hub_opened",
  LOGIN_STARTED: "login_started",
  LOGIN_SUCCESS: "login_success",
  DEMO_OPENED: "demo_opened",
  CONTACT_FORM_SUBMITTED: "contact_form_submitted",
  PRODUCT_OPENED: "product_opened",
  HUB_TILE_CLICKED: "hub_tile_clicked",
  LANDING_PRODUCT_VIEW: "landing_product_view"
});

function dakinisPushDataLayer(name, props) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...props });
}

function dakinisSentryBreadcrumb(name, props) {
  if (typeof window === "undefined") return;
  const S = window.Sentry;
  if (S?.addBreadcrumb) {
    S.addBreadcrumb({
      category: "dakinis.conversion",
      message: name,
      data: props,
      level: "info"
    });
  }
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} [props]
 */
function dakinisGaEvent(name, props) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, props);
}

/**
 * Carga gtag.js si `VITE_GA_MEASUREMENT_ID` está definido (Core, Landing, etc.).
 */
export function dakinisInitAnalytics() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const measurementId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GA_MEASUREMENT_ID) || "";
  const id = String(measurementId).trim();
  if (!id || window.__dakinisGaInitialized) return;

  window.__dakinisGaInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function dakinisTrackEvent(name, props = {}) {
  const payload = {
    ...props,
    ts: new Date().toISOString(),
    page: typeof window !== "undefined" ? window.location.pathname : undefined
  };
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.debug("[dakinis-analytics]", name, payload);
  }
  dakinisPushDataLayer(name, payload);
  dakinisSentryBreadcrumb(name, payload);
  dakinisGaEvent(name, payload);
}
