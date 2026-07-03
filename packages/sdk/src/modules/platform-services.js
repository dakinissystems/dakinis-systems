/**
 * Clientes HTTP para servicios platform desplegados (Billing, Notifications, Search).
 * Base URL: gateway prefix o URL Railway directa.
 */

function trimBase(url) {
  return String(url || "").replace(/\/$/, "");
}

export class ServiceClient {
  constructor(baseUrl, fetchFn = fetch) {
    this.baseUrl = trimBase(baseUrl);
    this.fetchFn = fetchFn;
  }

  async request(path, init = {}) {
    const headers = { Accept: "application/json", ...(init.headers || {}) };
    if (init.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (process.env.DAKINIS_INTERNAL_API_KEY) {
      headers.Authorization = `Bearer ${process.env.DAKINIS_INTERNAL_API_KEY}`;
      headers["X-Internal-Api-Key"] = process.env.DAKINIS_INTERNAL_API_KEY;
    }
    const res = await this.fetchFn(`${this.baseUrl}${path}`, { ...init, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || data.message || res.statusText || "request_failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }
}

function serviceBaseUrl(envKey, gatewayPath, directFallback) {
  if (process.env[envKey]) return trimBase(process.env[envKey]);
  const viteKey = envKey.replace("DAKINIS_", "VITE_DAKINIS_");
  if (process.env[viteKey]) return trimBase(process.env[viteKey]);
  const gw = process.env.DAKINIS_GATEWAY_URL || process.env.VITE_GATEWAY_URL;
  if (gw) return `${trimBase(gw)}${gatewayPath}`;
  return directFallback;
}

export class BillingServiceClient extends ServiceClient {
  constructor(opts = {}) {
    super(
      opts.baseUrl || serviceBaseUrl("DAKINIS_BILLING_URL", "/billing", "http://localhost:4080"),
      opts.fetch
    );
  }

  health() {
    return this.request("/health");
  }

  plans() {
    return this.request("/v1/plans");
  }

  subscription(tenantId) {
    return this.request(`/v1/subscriptions/${encodeURIComponent(tenantId)}`);
  }

  checkout(body) {
    return this.request("/v1/checkout", { method: "POST", body: JSON.stringify(body) });
  }

  portal(body) {
    return this.request("/v1/portal", { method: "POST", body: JSON.stringify(body) });
  }

  checkoutSession(sessionId) {
    return this.request(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  }

  usage(body) {
    return this.request("/v1/usage", { method: "POST", body: JSON.stringify(body) });
  }
}

export class NotificationsServiceClient extends ServiceClient {
  constructor(opts = {}) {
    super(
      opts.baseUrl || serviceBaseUrl("DAKINIS_NOTIFICATIONS_URL", "/notifications", "http://localhost:4081"),
      opts.fetch
    );
  }

  health() {
    return this.request("/health");
  }

  send(body) {
    return this.request("/v1/send", { method: "POST", body: JSON.stringify(body) });
  }

  inbox(userId) {
    return this.request(`/v1/inbox/${encodeURIComponent(userId)}`);
  }
}

export class SearchServiceClient extends ServiceClient {
  constructor(opts = {}) {
    super(
      opts.baseUrl || serviceBaseUrl("DAKINIS_SEARCH_URL", "/search", "http://localhost:4082"),
      opts.fetch
    );
  }

  health() {
    return this.request("/health");
  }

  query(q, scope = "all") {
    const params = new URLSearchParams({ q, scope });
    return this.request(`/v1/query?${params}`);
  }

  index(body) {
    return this.request("/v1/index", { method: "POST", body: JSON.stringify(body) });
  }
}
