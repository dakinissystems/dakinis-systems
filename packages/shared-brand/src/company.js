import { dakinisPickLocaleString } from "./i18n.js";

/** Fuente de verdad de marca (sincronizar con docs/legal/company.json). */
const company = {
  legalName: "Christian Villar",
  tradingName: "Dakinis Systems",
  productLineName: "Dakinis One",
  tagline: "Transformamos negocios mediante software.",
  taglineI18n: {
    es: "Transformamos negocios mediante software.",
    en: "We transform businesses through software."
  },
  jurisdiction: "España",
  countryCode: "ES",
  contacts: {
    general: "contacto@dakinis-systems.com",
    legal: "legal@dakinis-systems.com",
    privacy: "privacy@dakinis-systems.com"
  },
  sites: {
    corporate: "https://dakinissystems.com/",
    core: "https://core.dakinissystems.com/",
    hub: "https://core.dakinissystems.com/hub",
    streamautomator: "https://streamautomator.com/",
    akoenet: "https://akoenet.dakinissystems.com/"
  },
  lastUpdated: "2026-05-19"
};

/** @param {"es"|"en"} [locale] */
export function dakinisCompanyTagline(locale = "es") {
  return dakinisPickLocaleString(company.taglineI18n ?? company.tagline, locale);
}

export default company;
