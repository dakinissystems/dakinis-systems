import company from "./company.js";

function dakinisNormalizeUrl(raw, fallback) {
  const u = String(raw ?? "").trim();
  if (!u) return fallback;
  try {
    const parsed = new URL(u);
    return parsed.href.endsWith("/") ? parsed.href : `${parsed.href}/`;
  } catch {
    return fallback;
  }
}

export const DAKINIS_URL_CORPORATE = dakinisNormalizeUrl(
  import.meta.env?.VITE_LANDING_SITE_URL || import.meta.env?.VITE_MARKETING_SITE_URL,
  company.sites.corporate
);

export const DAKINIS_URL_CORE = dakinisNormalizeUrl(
  import.meta.env?.VITE_CORE_APP_URL,
  company.sites.core
);

export const DAKINIS_URL_HUB = dakinisNormalizeUrl(
  import.meta.env?.VITE_HUB_URL,
  company.sites.hub
);

export const DAKINIS_URL_STREAMAUTOMATOR = dakinisNormalizeUrl(
  import.meta.env?.VITE_STREAMAUTOMATOR_SITE_URL,
  company.sites.streamautomator
);

export const DAKINIS_URL_AKOENET = dakinisNormalizeUrl(
  import.meta.env?.VITE_AKOENET_SITE_URL,
  company.sites.akoenet
);

export const DAKINIS_URL_LIFEFLOW = dakinisNormalizeUrl(
  import.meta.env?.VITE_LIFEFLOW_APP_URL,
  company.sites.lifeflow
);

/** @deprecated Use DAKINIS_URL_CORPORATE */
export const DAKINIS_MARKETING_SITE_URL = DAKINIS_URL_CORPORATE;

export const DAKINIS_URL_LANDING = DAKINIS_URL_CORPORATE;
