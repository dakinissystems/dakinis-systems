/**
 * Eventos de conversión del ecosistema (Landing → Hub → producto).
 * En prod: breadcrumbs Sentry si está cargado; siempre dataLayer opcional.
 */

export const DAKINIS_ANALYTICS_EVENTS = Object.freeze({
  CTA_DAKINIS_ONE_CLICKED: "cta_dakinis_one_clicked",
  LANDING_PAGE_VIEW: "landing_page_view",
  LANDING_PRICING_CLICKED: "landing_pricing_clicked",
  LANDING_SAVINGS_CALC_CLICKED: "landing_savings_calc_clicked",
  CORE_PAGE_VIEW: "core_page_view",
  CORE_PRICING_VIEW: "core_pricing_view",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
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

function dakinisMetaPixelEvent(name, props) {
  if (typeof window === "undefined") return;
  const fbq = window.fbq;
  if (typeof fbq !== "function") return;
  fbq("trackCustom", name, props);
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

  const pixelId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_META_PIXEL_ID) || "";
  const pid = String(pixelId).trim();
  if (pid && !window.__dakinisMetaPixelInitialized) {
    window.__dakinisMetaPixelInitialized = true;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", pid);
    window.fbq("track", "PageView");
  }
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
  dakinisMetaPixelEvent(name, payload);
}
