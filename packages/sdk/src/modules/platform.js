/**
 * Cliente base para servicios platform (Internal API).
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
 */
export class PlatformClient {
  constructor(opts = {}) {
    this.baseUrl = (opts.baseUrl || process.env.DAKINIS_INTERNAL_URL || "http://localhost/internal").replace(
      /\/$/,
      ""
    );
    this.apiKey = opts.apiKey || process.env.DAKINIS_INTERNAL_SERVICE_KEY || "";
    this.fetchFn = opts.fetch || fetch;
  }

  async request(path, init = {}) {
    const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    const res = await this.fetchFn(`${this.baseUrl}${path}`, { ...init, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || res.statusText || "platform_request_failed");
      err.status = res.status;
      throw err;
    }
    return data;
  }
}

/** @extends PlatformClient */
export class AuthClient extends PlatformClient {
  me(userId) {
    return this.request(`/users/${encodeURIComponent(userId)}`);
  }
}

/** @extends PlatformClient */
export class BillingClient extends PlatformClient {
  plans() {
    return this.request("/billing/plans");
  }

  /** @param {string} tenantId */
  subscription(tenantId) {
    return this.request(`/billing/subscriptions/${encodeURIComponent(tenantId)}`);
  }

  /** @param {{ plan: string; email?: string; businessId?: string; userId?: string }} body */
  checkout(body) {
    return this.request("/billing/checkout", { method: "POST", body: JSON.stringify(body) });
  }

  /** @param {{ userId: string; returnUrl?: string }} body */
  portal(body) {
    return this.request("/billing/portal", { method: "POST", body: JSON.stringify(body) });
  }
}

/** @extends PlatformClient */
export class HubClient extends PlatformClient {
  dashboard(userId) {
    return this.request(`/hub/dashboard/${encodeURIComponent(userId)}`);
  }
}

/** @extends PlatformClient */
export class WorkspaceClient extends PlatformClient {
  catalog() {
    return this.request("/workspace-addons/catalog");
  }

  /** @param {string} workspaceId */
  addons(workspaceId) {
    return this.request(`/workspaces/${encodeURIComponent(workspaceId)}/addons`);
  }

  /** @param {string} workspaceId @param {string} key @param {{ enabled?: boolean; pinned?: boolean; config?: object }} body */
  upsertAddon(workspaceId, key, body) {
    return this.request(`/workspaces/${encodeURIComponent(workspaceId)}/addons/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /** @param {string} workspaceId */
  enableAllAddons(workspaceId) {
    return this.request(`/workspaces/${encodeURIComponent(workspaceId)}/addons/enable-all`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }
}

/** @extends PlatformClient */
export class NotificationsClient extends PlatformClient {
  /** @param {{ userId: string; type: string; channel?: string; payload: object }} body */
  send(body) {
    return this.request("/notifications/send", { method: "POST", body: JSON.stringify(body) });
  }
}

/** @extends PlatformClient */
export class StorageClient extends PlatformClient {
  /** @param {{ filename: string; contentType: string; purpose?: string }} meta */
  uploadUrl(meta) {
    return this.request("/storage/upload-url", { method: "POST", body: JSON.stringify(meta) });
  }
}

/** @extends PlatformClient */
export class SearchClient extends PlatformClient {
  /** @param {{ query: string; scopes?: string[]; userId?: string }} body */
  query(body) {
    return this.request("/search", { method: "POST", body: JSON.stringify(body) });
  }
}

/** @extends PlatformClient */
export class EventsClient extends PlatformClient {
  /** @param {{ event: string; payload: object; source?: string }} body */
  publish(body) {
    return this.request("/events", { method: "POST", body: JSON.stringify(body) });
  }
}

/** @extends PlatformClient */
export class KnowledgeClient extends PlatformClient {
  /** @param {{ query: string; sources?: string[] }} body */
  query(body) {
    return this.request("/knowledge/query", { method: "POST", body: JSON.stringify(body) });
  }
}
