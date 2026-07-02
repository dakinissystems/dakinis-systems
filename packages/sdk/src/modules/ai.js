/**
 * Cliente HTTP para Dakinis AI Platform.
 */
export class DakinisAI {
  /**
   * @param {{ baseUrl?: string; apiKey?: string; fetch?: typeof fetch }} [opts]
   */
  constructor(opts = {}) {
    this.baseUrl = (opts.baseUrl || process.env.DAKINIS_AI_URL || "http://localhost:4020").replace(/\/$/, "");
    this.apiKey = opts.apiKey || process.env.DAKINIS_AI_API_KEY || "";
    this.fetchFn = opts.fetch || fetch;
  }

  /**
   * @param {string} path
   * @param {RequestInit} [init]
   */
  async request(path, init = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    const res = await this.fetchFn(`${this.baseUrl}${path}`, { ...init, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || res.statusText || "ai_request_failed");
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  chat(body) {
    return this.request("/v1/chat", { method: "POST", body: JSON.stringify(body) });
  }

  ask(agentId, body) {
    return this.request(`/v1/agents/${encodeURIComponent(agentId)}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  rag(body) {
    return this.request("/v1/rag", { method: "POST", body: JSON.stringify(body) });
  }

  analytics() {
    return this.request("/v1/analytics/usage");
  }
}

export class LifeFlowClient {
  /** @param {DakinisAI} ai */
  constructor(ai) {
    this.ai = ai;
  }

  coach(input) {
    return this.ai.ask("lifeflow-coach", {
      message: input.message,
      context: input.context,
      userId: input.userId,
    });
  }
}

export class CoreAdvisorClient {
  /** @param {DakinisAI} ai */
  constructor(ai) {
    this.ai = ai;
  }

  advise(input) {
    return this.ai.ask("core-advisor", {
      message: input.message,
      context: input.context,
      tenantId: input.tenantId,
    });
  }
}

export default DakinisAI;
