import { GatewayClient } from "@dakinis/shared-platform/gateway-client";

/**
 * Cliente base para servicios platform (Internal API).
 * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch; timeoutMs?: number; retries?: number }} [opts]
 */
export class PlatformClient extends GatewayClient {
  constructor(opts = {}) {
    super({
      baseUrl:
        opts.baseUrl || process.env.DAKINIS_INTERNAL_URL || "http://localhost/internal",
      apiKey: opts.apiKey || process.env.DAKINIS_INTERNAL_SERVICE_KEY || "",
      fetch: opts.fetch,
      timeoutMs: opts.timeoutMs,
      retries: opts.retries,
    });
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

  /** @param {string} userId @param {{ fresh?: boolean }} [opts] */
  dashboardAggregated(userId, opts = {}) {
    const qs = opts.fresh ? "?fresh=1" : "";
    return this.request(`/hub/dashboard/aggregated/${encodeURIComponent(userId)}${qs}`);
  }

  /** @param {{ fresh?: boolean }} [opts] */
  platformHealth(opts = {}) {
    const qs = opts.fresh ? "?fresh=1" : "";
    return this.request(`/platform/health${qs}`);
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

  /** @param {string} userId @param {{ fresh?: boolean }} [opts] */
  summary(userId, opts = {}) {
    const qs = opts.fresh ? "?fresh=1" : "";
    return this.request(`/workspace/summary/${encodeURIComponent(userId)}${qs}`);
  }

  /** @param {string} workspaceId @param {{ email: string; role?: string; invitedBy?: string }} body */
  inviteMember(workspaceId, body) {
    return this.request(`/workspaces/${encodeURIComponent(workspaceId)}/members/invite`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** @param {string} token @param {{ userId: string }} body */
  acceptInvite(token, body) {
    return this.request(`/workspaces/invites/${encodeURIComponent(token)}/accept`, {
      method: "POST",
      body: JSON.stringify(body),
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

/** @extends PlatformClient */
export class FeatureFlagsClient extends PlatformClient {
  /**
   * @param {string | string[]} keys
   * @param {{ userId?: string; workspaceId?: string; tenantId?: string; plan?: string }} [ctx]
   */
  async evaluate(keys, ctx = {}) {
    const list = Array.isArray(keys) ? keys : String(keys).split(",").map((k) => k.trim()).filter(Boolean);
    const params = new URLSearchParams({ keys: list.join(",") });
    if (ctx.userId) params.set("userId", ctx.userId);
    if (ctx.workspaceId) params.set("workspaceId", ctx.workspaceId);
    if (ctx.tenantId) params.set("tenantId", ctx.tenantId);
    if (ctx.plan) params.set("plan", ctx.plan);
    const data = await this.request(`/feature-flags/evaluate?${params.toString()}`);
    return data.flags || data;
  }

  evaluateBatch(keys, ctx) {
    return this.evaluate(keys, ctx);
  }
}

/** @extends PlatformClient */
export class TelemetryClient extends PlatformClient {
  /**
   * @param {{ product: string; action: string; tenantId?: string; metadata?: object }} body
   */
  track(body) {
    return this.request("/events", {
      method: "POST",
      body: JSON.stringify({
        event: "telemetry.action",
        payload: body,
        source: body.product || "sdk",
      }),
    }).catch(() => ({}));
  }
}
