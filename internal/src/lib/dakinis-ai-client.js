import { config } from "../config.js";

const AI_BASE = String(
  process.env.DAKINIS_AI_URL ||
    process.env.DAKINIS_AI_BASE_URL ||
    "http://localhost:4020"
).replace(/\/+$/, "");

const AI_KEY = String(process.env.DAKINIS_AI_SERVICE_KEY || "").trim();

export function dakinisAiConfigured() {
  return Boolean(AI_KEY);
}

/**
 * @param {{
 *   messages: { role: string; content: string }[],
 *   agentId?: string,
 *   userId?: string,
 *   product?: string,
 *   metadata?: Record<string, unknown>,
 *   temperature?: number,
 *   maxTokens?: number
 * }} params
 */
export async function dakinisChat(params) {
  if (!AI_KEY) {
    return {
      ok: false,
      error: "ai_not_configured",
      message: "DAKINIS_AI_SERVICE_KEY no configurada en internal-api",
    };
  }

  const url = `${AI_BASE}/v1/chat`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_KEY}`,
        "Content-Type": "application/json",
        "X-Dakinis-Product": params.product || "akoenet",
        "X-Dakinis-User-Id": String(params.userId || ""),
      },
      body: JSON.stringify({
        messages: params.messages,
        agentId: params.agentId,
        metadata: params.metadata,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    return {
      ok: false,
      error: "ai_unreachable",
      message: err instanceof Error ? err.message : "No se pudo conectar con Dakinis AI",
    };
  }

  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "ai_invalid_response", message: raw.slice(0, 200) };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: json.error || "ai_error",
      message: json.message || `HTTP ${res.status}`,
    };
  }

  return { ok: true, ...json };
}

/**
 * @param {Record<string, unknown>} json
 */
export function extractChatReply(json) {
  if (!json || typeof json !== "object") return "";
  if (typeof json.content === "string" && json.content.trim()) return json.content.trim();
  if (typeof json.message === "string" && json.message.trim()) return json.message.trim();
  if (typeof json.reply === "string" && json.reply.trim()) return json.reply.trim();
  const choice = json.choices?.[0];
  if (typeof choice?.message?.content === "string") return choice.message.content.trim();
  if (typeof choice?.text === "string") return choice.text.trim();
  return "";
}
