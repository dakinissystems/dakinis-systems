/**
 * Textos bilingües del catálogo (products.json, hub-modules.json).
 * Formato: string plano (legacy) o { es, en }.
 * @param {string | { es?: string, en?: string } | null | undefined} value
 * @param {"es"|"en"} [locale]
 */
export function dakinisPickLocaleString(value, locale = "es") {
  const loc = locale === "en" ? "en" : "es";
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value[loc] ?? value.es ?? value.en ?? "";
  }
  return String(value);
}

/**
 * @param {{ name?: unknown, summary?: unknown, i18n?: Record<string, unknown> }} product
 * @param {"name"|"summary"} field
 * @param {"es"|"en"} [locale]
 */
export function dakinisProductField(product, field, locale = "es") {
  if (!product) return "";
  const fromI18n = product.i18n?.[field];
  if (fromI18n) return dakinisPickLocaleString(fromI18n, locale);
  return dakinisPickLocaleString(product[field], locale);
}

/**
 * @param {{ label?: unknown, description?: unknown, i18n?: Record<string, unknown> }} module
 * @param {"label"|"description"} field
 * @param {"es"|"en"} [locale]
 */
export function dakinisHubModuleField(module, field, locale = "es") {
  if (!module) return "";
  const fromI18n = module.i18n?.[field];
  if (fromI18n) return dakinisPickLocaleString(fromI18n, locale);
  return dakinisPickLocaleString(module[field], locale);
}
