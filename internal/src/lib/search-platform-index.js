function serviceAuthHeaders() {
  const key = String(process.env.DAKINIS_INTERNAL_SERVICE_KEY || process.env.DAKINIS_INTERNAL_API_KEY || "")
    .split(",")[0]
    .trim();
  if (!key) return {};
  return { Authorization: `Bearer ${key}`, "X-Internal-Api-Key": key };
}

function searchBaseUrl() {
  const direct = String(process.env.DAKINIS_SEARCH_URL || "").trim().replace(/\/$/, "");
  if (direct) return direct;
  const gateway = String(process.env.DAKINIS_GATEWAY_URL || "").trim().replace(/\/$/, "");
  if (gateway) return `${gateway}/search`;
  return "";
}

export function isSearchPlatformConfigured() {
  return Boolean(searchBaseUrl());
}

/**
 * @param {{ scope: string; id: string; title?: string; body?: string; metadata?: object }} doc
 */
export async function indexSearchDocument(doc) {
  const base = searchBaseUrl();
  if (!base || !doc?.scope || !doc?.id) return { indexed: false, reason: "not_configured" };

  try {
    const res = await fetch(`${base}/v1/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...serviceAuthHeaders() },
      body: JSON.stringify({
        scope: doc.scope,
        id: doc.id,
        title: doc.title || "",
        body: doc.body || "",
        metadata: doc.metadata || {},
      }),
      signal: AbortSignal.timeout(8_000),
    });
    return { indexed: res.ok, status: res.status };
  } catch (err) {
    console.warn("[internal] search index failed:", err instanceof Error ? err.message : err);
    return { indexed: false, error: err instanceof Error ? err.message : "index_error" };
  }
}

/**
 * @param {string} scope
 * @param {string} id
 */
export async function removeSearchDocument(scope, id) {
  const base = searchBaseUrl();
  if (!base || !scope || !id) return { removed: false };
  try {
    const res = await fetch(`${base}/v1/index/${encodeURIComponent(scope)}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Accept: "application/json", ...serviceAuthHeaders() },
      signal: AbortSignal.timeout(8_000),
    });
    return { removed: res.ok, status: res.status };
  } catch {
    return { removed: false };
  }
}
