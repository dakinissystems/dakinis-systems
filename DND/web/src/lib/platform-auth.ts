const AUTH_URL =
  import.meta.env.VITE_DAKINIS_AUTH_URL ||
  (import.meta.env.PROD ? "https://auth.dakinissystems.com" : "http://localhost:4000");

function trimUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function buildTabletopGoogleLoginUrl() {
  const returnTo = `${window.location.origin}/`;
  const url = new URL(`${trimUrl(AUTH_URL)}/auth/oauth/google/start`);
  url.searchParams.set("return_to", returnTo);
  url.searchParams.set("product", "tabletop");
  return url.href;
}

export function readPlatformTokenFromLocation(): string | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("platform_token") || params.get("token");
  if (token && token.length > 20) return token;
  return null;
}

export function clearPlatformTokenFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("platform_token");
  url.searchParams.delete("platform_refresh");
  url.searchParams.delete("auth");
  url.searchParams.delete("product");
  url.searchParams.delete("auth_error");
  window.history.replaceState({}, "", url.pathname + url.search);
}
