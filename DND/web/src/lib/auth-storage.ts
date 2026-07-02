export const AUTH_TOKEN_KEY = "dnd_token";

/** Descarta tokens corruptos o de un JWT secret anterior (evita 401 ruidoso en /me). */
export function readStoredAuthToken(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }
  if (token.split(".").length !== 3) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }
  return token;
}

export function clearStoredAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
