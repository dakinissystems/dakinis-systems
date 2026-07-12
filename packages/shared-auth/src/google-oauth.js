/**
 * Google OAuth2 (authorization code) — reutiliza GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
 */

export function readGoogleOAuthCredentials() {
  let clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || "").trim();
  if (
    (clientSecret.startsWith('"') && clientSecret.endsWith('"')) ||
    (clientSecret.startsWith("'") && clientSecret.endsWith("'"))
  ) {
    clientSecret = clientSecret.slice(1, -1).trim();
  }
  return {
    clientId: String(process.env.GOOGLE_CLIENT_ID || "").trim(),
    clientSecret,
  };
}

export function isGoogleOAuthConfigured() {
  const { clientId, clientSecret } = readGoogleOAuthCredentials();
  return Boolean(clientId && clientSecret);
}

export function buildGoogleAuthorizeUrl({ clientId, redirectUri, state, scopes }) {
  const scope = (scopes || ["openid", "email", "profile"]).join(" ");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode({ clientId, clientSecret, code, redirectUri }) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: String(code),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error_description || data?.error || `google_token_${res.status}`);
    err.status = 502;
    err.google = data;
    throw err;
  }
  return data;
}

export async function fetchGoogleUserInfo(accessToken) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `google_userinfo_${res.status}`);
    err.status = 502;
    throw err;
  }
  return data;
}
