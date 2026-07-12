const DEFAULT_AUTH_URL =
  process.env.DAKINIS_AUTH_URL ||
  process.env.AUTH_PUBLIC_URL ||
  (process.env.NODE_ENV === "production" ? "https://auth.dakinissystems.com" : "http://localhost:4000");

export function getPlatformAuthUrl() {
  return String(DEFAULT_AUTH_URL).trim().replace(/\/$/, "");
}

export function buildGoogleOAuthStartUrl(returnTo) {
  const auth = getPlatformAuthUrl();
  const target = returnTo || process.env.FRONTEND_URL || "https://tabletop.dakinissystems.com";
  const url = new URL(`${auth}/auth/oauth/google/start`);
  url.searchParams.set("return_to", target);
  url.searchParams.set("product", "tabletop");
  return url.href;
}

export async function verifyPlatformAccessToken(accessToken) {
  const auth = getPlatformAuthUrl();
  const res = await fetch(`${auth}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || "invalid_platform_token");
    err.status = res.status === 401 ? 401 : 502;
    throw err;
  }
  const email = String(data?.email || "").trim().toLowerCase();
  if (!email) {
    const err = new Error("platform_token_missing_email");
    err.status = 401;
    throw err;
  }
  return { sub: data.sub, email, role: data.role, tenantId: data.tenantId };
}
