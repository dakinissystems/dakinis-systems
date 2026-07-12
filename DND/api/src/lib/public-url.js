function trimUrl(url = "") {
  return String(url || "").trim().replace(/\/$/, "");
}

function isLocalhostUrl(u) {
  if (!u) return false;
  try {
    const h = new URL(u).hostname;
    return h === "localhost" || h === "127.0.0.1";
  } catch {
    return false;
  }
}

function isHostedDeploy() {
  return Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PUBLIC_DOMAIN);
}

function useProductionUrlRules() {
  return process.env.NODE_ENV === "production" || isHostedDeploy();
}

/** SPA origin for email links (no trailing slash). */
export function getTabletopFrontendUrl() {
  const onHosted = isHostedDeploy();
  const candidates = [
    process.env.FRONTEND_URL,
    process.env.TABLETOP_WEB_URL,
    process.env.PUBLIC_FRONTEND_URL,
  ]
    .map(trimUrl)
    .filter(Boolean);

  for (const url of candidates) {
    if (!(onHosted && isLocalhostUrl(url))) return url;
  }

  if (useProductionUrlRules()) {
    return "https://tabletop.dakinissystems.com";
  }

  return "http://localhost:5174";
}

export function buildTabletopRegistrationCompleteUrl(rawToken) {
  const base = trimUrl(getTabletopFrontendUrl());
  const q = `token=${encodeURIComponent(rawToken)}`;
  return new URL(`register/complete?${q}`, `${base}/`).toString();
}

export function buildTabletopPasswordResetCompleteUrl(rawToken) {
  const base = trimUrl(getTabletopFrontendUrl());
  const q = `token=${encodeURIComponent(rawToken)}`;
  return new URL(`login/reset?${q}`, `${base}/`).toString();
}
