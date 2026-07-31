import { config, serviceAuthHeaders } from "../config.js";

/**
 * @param {string} baseUrl
 * @param {string} pathname
 * @param {{ auth?: boolean; timeoutMs?: number; searchParams?: Record<string, string | undefined> }} [opts]
 */
export async function apiGet(baseUrl, pathname, opts = {}) {
  if (!baseUrl) {
    return { ok: false, error: "base_url_not_configured", status: 0, data: null, latencyMs: 0 };
  }

  const url = new URL(pathname, `${baseUrl.replace(/\/$/, "")}/`);
  if (opts.searchParams) {
    for (const [k, v] of Object.entries(opts.searchParams)) {
      if (v != null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const timeoutMs = opts.timeoutMs ?? config.requestTimeoutMs;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(opts.auth ? serviceAuthHeaders() : {}),
      },
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text.slice(0, 2000) };
    }
    return {
      ok: res.ok,
      status: res.status,
      data,
      latencyMs: Date.now() - started,
      url: url.toString(),
      error: res.ok ? null : data?.error || data?.message || `http_${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      latencyMs: Date.now() - started,
      url: url.toString(),
      error: err?.name === "AbortError" ? "timeout" : err?.message || "fetch_failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function jsonResult(payload, { isError = false } = {}) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    isError,
  };
}

export function textResult(text, { isError = false } = {}) {
  return {
    content: [{ type: "text", text: String(text) }],
    isError,
  };
}
