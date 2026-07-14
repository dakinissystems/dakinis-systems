import { indexSearchDocument } from "./search-platform-index.js";

const LIFEFLOW_BASE =
  String(process.env.DAKINIS_LIFEFLOW_URL || "https://finance.dakinissystems.com").replace(/\/$/, "");

const STREAM_BASE =
  String(process.env.STREAMAUTOMATOR_URL || "https://streamautomator.com").replace(/\/$/, "");

function eventName(event) {
  return String(event?.event || event?.type || "").trim();
}

function eventPayload(event) {
  return event?.payload && typeof event.payload === "object" ? event.payload : {};
}

function lifeflowTitle(type, payload) {
  if (payload.title) return payload.title;
  if (type === "lifeflow.goal_reached") return "Meta LifeFlow alcanzada";
  if (type === "lifeflow.scenario_saved") return "Escenario LifeFlow guardado";
  if (type === "lifeflow.score_updated") return "LifeFlow Score actualizado";
  return "Evento LifeFlow";
}

function streamTitle(type, payload) {
  if (payload.title) return payload.title;
  if (type === "stream.started") return "Directo iniciado";
  if (type === "stream.scheduled") return "Stream programado";
  if (type === "stream.published" || type === "stream.post_published") return "Publicación stream";
  if (type === "stream.ended") return "Directo finalizado";
  return "Stream Automator";
}

/**
 * Indexa eventos de plataforma (SA, LifeFlow, etc.) en dakinis-search.
 * @param {object} event
 */
export async function indexPlatformEventForSearch(event) {
  const type = eventName(event);
  if (!type) return { indexed: false, reason: "no_event_type" };

  const payload = eventPayload(event);
  const userId = event.userId || payload.platformUserId || payload.userId || null;
  const source = String(event.source || payload.source || "").toLowerCase();

  if (type.startsWith("stream.") || source === "streamautomator") {
    const contentId = payload.contentId || payload.id || payload.content_id;
    const docId = contentId ? `streamautomator:content:${contentId}` : `streamautomator:event:${type}:${userId || "anon"}`;
    const platforms = Array.isArray(payload.platforms)
      ? payload.platforms.join(", ")
      : String(payload.platform || payload.platforms || "");

    return indexSearchDocument({
      scope: "events",
      id: docId,
      title: streamTitle(type, payload),
      body: [
        payload.streamer,
        payload.content,
        platforms,
        payload.scheduledFor || payload.scheduled_for,
        payload.status,
      ]
        .filter(Boolean)
        .join(" ")
        .slice(0, 2000),
      metadata: {
        product: "streamautomator",
        eventType: type,
        userId,
        contentId: contentId || null,
        path: contentId ? `${STREAM_BASE}/schedule?content=${contentId}` : `${STREAM_BASE}/director`,
      },
    });
  }

  if (type.startsWith("lifeflow.") || source === "lifeflow") {
    const entityId = payload.goalId || payload.scenarioId || payload.id || type;
    return indexSearchDocument({
      scope: "events",
      id: `lifeflow:${type}:${entityId}`,
      title: lifeflowTitle(type, payload),
      body: [payload.message, payload.description, payload.label, payload.amount, payload.category]
        .filter(Boolean)
        .join(" ")
        .slice(0, 2000),
      metadata: {
        product: "lifeflow",
        eventType: type,
        userId,
        path: `${LIFEFLOW_BASE}${payload.path || ""}`,
      },
    });
  }

  return { indexed: false, reason: "unsupported_event" };
}
