/**
 * Cliente HTTP para Dakinis AI Platform.
 * @example
 * const ai = new DakinisAI({ baseUrl: "http://localhost:4020" });
 * await ai.ask("core-advisor", { message: "¿Stock bajo?", context: {} });
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

  /**
   * @param {{ message: string; context?: object; locale?: string }} body
   */
  chat(body) {
    return this.request("/v1/chat", { method: "POST", body: JSON.stringify(body) });
  }

  /**
   * @param {string} agentId
   * @param {{ message: string; context?: object; userId?: string; locale?: string }} body
   */
  ask(agentId, body) {
    return this.request(`/v1/agents/${encodeURIComponent(agentId)}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** @param {{ query: string; namespace?: string; topK?: number }} body */
  rag(body) {
    return this.request("/v1/rag", { method: "POST", body: JSON.stringify(body) });
  }

  /** Resumen de métricas IA (tokens, coste estimado). */
  analytics() {
    return this.request("/v1/analytics/usage");
  }
}

export class LifeFlowClient {
  /**
   * @param {DakinisAI} ai
   */
  constructor(ai) {
    this.ai = ai;
  }

  /** @param {{ message: string; context: object; userId?: string }} input */
  coach(input) {
    return this.ai.ask("lifeflow-coach", {
      message: input.message,
      context: input.context,
      userId: input.userId,
    });
  }
}

export class CoreAdvisorClient {
  /**
   * @param {DakinisAI} ai
   */
  constructor(ai) {
    this.ai = ai;
  }

  /** @param {{ message: string; context: object; tenantId?: string }} input */
  advise(input) {
    return this.ai.ask("core-advisor", {
      message: input.message,
      context: input.context,
      tenantId: input.tenantId,
    });
  }
}

export default DakinisAI;
