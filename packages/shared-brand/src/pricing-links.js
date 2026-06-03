import { DAKINIS_URL_CORPORATE } from "./product-urls.js";

/** Precios y paquetes viven en la landing corporativa. */
export const DAKINIS_PRICING_PATH = "/#contacto";

export function dakinisCorporatePricingUrl() {
  const base = DAKINIS_URL_CORPORATE.replace(/\/$/, "");
  return `${base}${DAKINIS_PRICING_PATH}`;
}
