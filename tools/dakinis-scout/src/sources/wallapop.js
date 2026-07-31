const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json",
  Origin: "https://es.wallapop.com",
  Referer: "https://es.wallapop.com/",
  "X-DeviceOS": "0",
  "Accept-Language": "es-ES,es;q=0.9",
};

/**
 * @param {{
 *   keywords: string;
 *   latitude?: number;
 *   longitude?: number;
 *   orderBy?: string;
 *   limit?: number;
 *   timeoutMs?: number;
 * }} opts
 */
export async function searchWallapop(opts) {
  const {
    keywords,
    latitude = 40.4168,
    longitude = -3.7038,
    orderBy = "most_relevance",
    limit = 40,
    timeoutMs = 15_000,
  } = opts;

  const url = new URL("https://api.wallapop.com/api/v3/search");
  url.searchParams.set("source", "search_box");
  url.searchParams.set("keywords", keywords);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("order_by", orderBy);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal });
    if (!res.ok) {
      return { ok: false, error: `http_${res.status}`, items: [], url: url.toString() };
    }
    const json = await res.json();
    const raw = json?.data?.section?.payload?.items || [];
    const items = raw
      .map(normalizeItem)
      .filter(Boolean)
      .filter((i) => i.price > 0)
      .slice(0, limit);

    return { ok: true, items, url: url.toString(), total: raw.length };
  } catch (err) {
    return {
      ok: false,
      error: err?.name === "AbortError" ? "timeout" : err?.message || "fetch_failed",
      items: [],
      url: url.toString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== "object") return null;
  const amount = Number(raw.price?.amount);
  const slug = raw.web_slug || raw.slug || "";
  const id = String(raw.id || slug || "");
  if (!id) return null;
  return {
    id,
    title: String(raw.title || "").trim(),
    price: Number.isFinite(amount) ? amount : 0,
    currency: raw.price?.currency || "EUR",
    url: slug ? `https://es.wallapop.com/item/${slug}` : null,
    imageUrl: raw.images?.[0]?.urls?.big || raw.images?.[0]?.urls?.medium || null,
    city: raw.location?.city || null,
    reserved: Boolean(raw.reserved),
    raw,
  };
}
