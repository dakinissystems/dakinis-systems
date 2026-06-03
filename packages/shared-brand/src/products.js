import productsJson from "./products.json" with { type: "json" };
import {
  DAKINIS_URL_AKOENET,
  DAKINIS_URL_CORE,
  DAKINIS_URL_STREAMAUTOMATOR
} from "./product-urls.js";

const URL_RESOLVERS = {
  streamautomator: DAKINIS_URL_STREAMAUTOMATOR,
  akoenet: DAKINIS_URL_AKOENET
};

/**
 * @param {typeof productsJson[number]} row
 */
function dakinisHydrateProduct(row) {
  const external = Boolean(row.external);
  return {
    ...row,
    url: row.url || (row.urlKey ? URL_RESOLVERS[row.urlKey] : external ? undefined : DAKINIS_URL_CORE),
    external
  };
}

/** @type {ReturnType<typeof dakinisHydrateProduct>[]} */
export const DAKINIS_PRODUCTS = productsJson.map(dakinisHydrateProduct);

export function dakinisGetProduct(id) {
  return DAKINIS_PRODUCTS.find((p) => p.id === id) ?? null;
}

export function dakinisListSaleProducts() {
  return DAKINIS_PRODUCTS.filter(
    (p) => (p.role === "flagship" || p.role === "product") && p.status !== "inactive"
  );
}

export function dakinisListActiveProducts() {
  return DAKINIS_PRODUCTS.filter((p) => p.status === "active");
}
