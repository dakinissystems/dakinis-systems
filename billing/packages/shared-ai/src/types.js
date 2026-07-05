/** @typedef {{ role: "system"|"user"|"assistant"; content: string }} ChatMessage */
/** @typedef {{ provider?: string; model?: string; messages: ChatMessage[]; temperature?: number; maxTokens?: number; agentId?: string; promptVersion?: string }} ChatRequest */

export const AI_ROUTES = {
  chat: "/v1/chat",
  rag: "/v1/rag",
  agents: "/v1/agents",
  analytics: "/v1/analytics",
  ocr: "/v1/ocr",
  moderation: "/v1/moderation",
  images: "/v1/images",
};

export const AGENT_IDS = {
  CORE_ADVISOR: "core-advisor",
  LIFEFLOW_COACH: "lifeflow-coach",
  BUSINESS_ADVISOR: "business-advisor",
  SUPPORT: "support-agent",
};
