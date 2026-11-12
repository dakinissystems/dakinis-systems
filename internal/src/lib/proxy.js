/** Proxy HTTP a servicios platform (red Docker o gateway). */
import { config } from "../config.js";

function serviceHeaders(baseUrl) {
  const base = String(baseUrl || "").replace(/\/$/, "");
  const guarded = [config.notificationsUrl, config.searchUrl]
    .filter(Boolean)
    .map((url) => String(url).replace(/\/$/, ""));
  if (!guarded.includes(base)) return {};
  const key = String(config.serviceKey || "").split(",")[0].trim();
  if (!key) return {};
  return { Authorization: `Bearer ${key}`, "X-Internal-Api-Key": key };
}

/**
 * @param {string} baseUrl
 * @param {string} path
 * @param {RequestInit} [init]
 */
export function actorForwardHeaders(req) {
  const raw = req?.headers?.["x-dakinis-actor"];
  if (typeof raw !== "string" || !raw.trim()) return {};
  return { "X-Dakinis-Actor": raw.trim() };
}

export async function proxyJson(baseUrl, path, init = {}) {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const headers = { Accept: "application/json", ...serviceHeaders(baseUrl), ...(init.headers || {}) };
  if (init.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data };
}
