/** Proxy HTTP a servicios platform (red Docker o gateway). */

/**
 * @param {string} baseUrl
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function proxyJson(baseUrl, path, init = {}) {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const headers = { Accept: "application/json", ...(init.headers || {}) };
  if (init.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data };
}
