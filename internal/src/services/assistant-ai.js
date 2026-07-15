import { query } from "../lib/db.js";
import { dakinisChat, dakinisAiConfigured, extractChatReply } from "../lib/dakinis-ai-client.js";
import { postAkoeNetIntegration } from "../lib/akoenet-integration.js";

const MAX_REPLY_CHARS = 3800;

/**
 * @param {string|number} serverId
 */
async function fetchServerInfo(serverId) {
  const { rows } = await query(
    `SELECT id, name, description FROM akoenet.servers WHERE id = $1::bigint LIMIT 1`,
    [serverId]
  );
  return rows[0] || { id: serverId, name: "Servidor" };
}

/**
 * @param {string|number} serverId
 */
async function fetchActiveStreamContext(serverId) {
  const { rows } = await query(
    `SELECT payload, created_at
     FROM akoenet.assistant_events
     WHERE server_id = $1::bigint
       AND event_type = 'stream.started'
       AND created_at > now() - interval '8 hours'
     ORDER BY created_at DESC
     LIMIT 1`,
    [serverId]
  );
  if (!rows[0]) return null;
  const data = rows[0].payload && typeof rows[0].payload === "object" ? rows[0].payload : {};
  return {
    platform: data.platform || "twitch",
    streamer: data.streamer || data.scheduler_slug || data.username,
    title: data.title,
    url: data.url,
    startedAt: rows[0].created_at,
  };
}

/**
 * @param {string|number} channelId
 * @param {number} [limit=12]
 */
async function fetchRecentChannelMessages(channelId, limit = 12) {
  const { rows } = await query(
    `SELECT content, created_at
     FROM akoenet.messages
     WHERE channel_id = $1::bigint
       AND content IS NOT NULL
       AND length(trim(content)) > 0
     ORDER BY created_at DESC
     LIMIT $2`,
    [channelId, limit]
  );
  return rows.reverse().map((r) => String(r.content).slice(0, 300));
}

/**
 * @param {Record<string, unknown>} parts
 */
function buildSystemPrompt(parts) {
  const serverName = parts.server?.name || "servidor AkoeNet";
  const lines = [
    `Eres el asistente de IA del servidor "${serverName}" en AkoeNet (comunidad Dakinis).`,
    "Responde en el idioma del usuario, de forma clara y útil. Sé conciso (máx. 2-3 párrafos).",
    "Si no sabes algo del servidor, dilo sin inventar datos.",
    "Puedes ayudar con configuración del Assistant, moderación, bienvenidas, directos y FAQs.",
  ];

  if (parts.stream) {
    const s = parts.stream;
    lines.push(
      "",
      "Contexto de directo activo o reciente:",
      `- Streamer: ${s.streamer || "desconocido"}`,
      `- Plataforma: ${String(s.platform || "twitch").toUpperCase()}`,
      s.title ? `- Título: ${s.title}` : "",
      s.url ? `- URL: ${s.url}` : ""
    );
  }

  if (parts.recentMessages?.length) {
    lines.push("", "Mensajes recientes en el canal (referencia):");
    for (const msg of parts.recentMessages.slice(-8)) {
      lines.push(`- ${msg}`);
    }
  }

  if (parts.contextSummary) {
    lines.push("", String(parts.contextSummary));
  }

  return lines.filter(Boolean).join("\n");
}

/**
 * @param {string} text
 */
function formatAssistantReply(text) {
  const trimmed = String(text || "").trim().slice(0, MAX_REPLY_CHARS);
  if (!trimmed) return "No pude generar una respuesta. Intenta reformular la pregunta.";
  return `🤖 **Assistant**\n${trimmed}`;
}

/**
 * @param {{ serverId: string|number; channelId: string|number; content: string }} input
 */
export async function publishAiReplyToChannel(input) {
  return postAkoeNetIntegration("/integrations/assistant/ai-reply", {
    server_id: Number(input.serverId),
    channel_id: Number(input.channelId),
    content: input.content,
  });
}

/**
 * Procesa @AI en chat: contexto → Dakinis AI → mensaje en canal.
 * @param {import("../../packages/akoenet-orchestrator/src/orchestrator.js").AssistantCommand & { context?: Record<string, unknown> }} command
 */
export async function processAssistantAiAsk(command) {
  const serverId = command.serverId;
  const channelId = command.channelId;
  const userMessage = String(command.payload?.message || "").trim();

  if (!userMessage) {
    return { status: "error", error: "empty_message" };
  }
  if (channelId == null || channelId === "") {
    return { status: "error", error: "channel_required" };
  }

  const [server, stream, recentMessages] = await Promise.all([
    fetchServerInfo(serverId),
    fetchActiveStreamContext(serverId),
    fetchRecentChannelMessages(channelId).catch(() => []),
  ]);

  const enrichedContext = command.context && typeof command.context === "object" ? command.context : {};
  const systemPrompt = buildSystemPrompt({
    server,
    stream,
    recentMessages,
    contextSummary: enrichedContext.summary,
  });

  if (!dakinisAiConfigured()) {
    const fallback = formatAssistantReply(
      "El asistente de IA no está disponible en este entorno (falta DAKINIS_AI_SERVICE_KEY)."
    );
    const posted = await publishAiReplyToChannel({ serverId, channelId, content: fallback });
    return {
      status: posted.ok ? "replied_fallback" : "post_failed",
      error: posted.ok ? undefined : posted.error,
      posted: posted.ok,
      messageId: posted.message_id,
    };
  }

  const ai = await dakinisChat({
    product: "akoenet",
    userId: command.userId,
    agentId: "akoenet-assistant",
    metadata: {
      serverId: String(serverId),
      channelId: String(channelId),
      module: "assistant",
      action: "ai.ask",
    },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.4,
    maxTokens: 900,
  });

  if (!ai.ok) {
    const errText = formatAssistantReply(
      ai.message || "No pude conectar con el servicio de IA. Prueba de nuevo en unos segundos."
    );
    const posted = await publishAiReplyToChannel({ serverId, channelId, content: errText });
    return {
      status: "ai_error",
      error: ai.error,
      posted: posted.ok,
      messageId: posted.message_id,
    };
  }

  const replyText = extractChatReply(ai);
  const content = formatAssistantReply(replyText);
  const posted = await publishAiReplyToChannel({ serverId, channelId, content });

  if (!posted.ok) {
    return {
      status: "post_failed",
      error: posted.error,
      reply: replyText,
    };
  }

  return {
    status: "replied",
    messageId: posted.message_id,
    channelId: posted.channel_id,
    provider: ai.provider,
    tokensInput: ai.usage?.prompt_tokens ?? ai.tokensInput ?? null,
    tokensOutput: ai.usage?.completion_tokens ?? ai.tokensOutput ?? null,
    replyLength: replyText.length,
  };
}
