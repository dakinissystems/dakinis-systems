/** Tipos de eventos del bus (Core → productos / AI). */
export const DAKINIS_EVENTS = {
  USER_CREATED: "user.created",
  USER_PLAN_CHANGED: "user.plan_changed",
  PAYMENT_SUCCEEDED: "billing.payment_succeeded",
  TENANT_SUSPENDED: "tenant.suspended",
  AI_REQUEST: "ai.request",
  AI_RESPONSE: "ai.response",
  AI_USAGE: "ai.usage",
};

/** Feature flags IA (env: DAKINIS_AI_FLAGS=AI_CHAT,AI_COACH). */
export const AI_FEATURE_FLAGS = {
  AI_CHAT: "AI_CHAT",
  AI_COACH: "AI_COACH",
  AI_RAG: "AI_RAG",
  AI_OCR: "AI_OCR",
  AI_IMAGE: "AI_IMAGE",
  AI_SUMMARY: "AI_SUMMARY",
  AI_AGENTS: "AI_AGENTS",
};

/**
 * @param {string} [envFlags]
 * @returns {Set<string>}
 */
export function parseFeatureFlags(envFlags = process.env.DAKINIS_AI_FLAGS || "") {
  const raw = envFlags.split(",").map((s) => s.trim()).filter(Boolean);
  if (raw.length === 0) {
    return new Set(Object.values(AI_FEATURE_FLAGS));
  }
  return new Set(raw);
}

/**
 * @param {string} flag
 * @param {Set<string>} enabled
 */
export function isFeatureEnabled(flag, enabled) {
  return enabled.has(flag);
}
