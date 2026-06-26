import { dakinisPickLocaleString } from "./i18n.js";

/** Fuente de verdad de marca (sincronizar con docs/legal/company.json). */
const company = {
  legalName: "Christian David Villar Colodro",
  tradingName: "Dakinis Systems",
  productLineName: "Dakinis One",
  taxId: "18513473Z",
  registeredAddress: "Málaga, España",
  tagline: "Transformamos negocios mediante software.",
  taglineI18n: {
    es: "Transformamos negocios mediante software.",
    en: "We transform businesses through software."
  },
  jurisdiction: "España",
  countryCode: "ES",
  contacts: {
    general: "hello@dakinissystems.com",
    support: "help@dakinissystems.com",
    billing: "billing@dakinissystems.com",
    legal: "legal@dakinissystems.com",
    privacy: "privacy@dakinissystems.com",
    admin: "admin@dakinissystems.com",
    security: "help@dakinissystems.com",
    safety: "legal@dakinissystems.com"
  },
  sites: {
    corporate: "https://dakinissystems.com/",
    core: "https://core.dakinissystems.com/",
    hub: "https://hub.dakinissystems.com/",
    lifeflow: "https://finance.dakinissystems.com/",
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
