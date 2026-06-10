import { DAKINIS_URL_CORPORATE, DAKINIS_URL_CORE } from "./product-urls.js";

/** Contacto comercial en la landing corporativa. */
export const DAKINIS_CORPORATE_PRICING_PATH = "/#contacto";

/** Planes BOS y paquetes en Core (página dedicada). */
export const DAKINIS_PRODUCT_PRICING_PATH = "/precios";

/** @deprecated Use DAKINIS_CORPORATE_PRICING_PATH */
export const DAKINIS_PRICING_PATH = DAKINIS_CORPORATE_PRICING_PATH;

export function dakinisCorporatePricingUrl() {
  const base = DAKINIS_URL_CORPORATE.replace(/\/$/, "");
  return `${base}${DAKINIS_CORPORATE_PRICING_PATH}`;
}

export function dakinisProductPricingUrl() {
  const base = DAKINIS_URL_CORE.replace(/\/$/, "");
  return `${base}${DAKINIS_PRODUCT_PRICING_PATH}`;
}
