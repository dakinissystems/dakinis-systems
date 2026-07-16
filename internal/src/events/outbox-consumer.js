import { recordHubTimelineFromPlatformEvent } from "../services/hub-timeline.js";
import { invalidateUserBffCache } from "../lib/cache.js";

/**
 * @param {string} eventType
 */
export function mapOutboxEventToPlatformEvent(eventType) {
  if (eventType.startsWith("invite.accepted")) return "workspace.member.accepted";
  if (eventType.startsWith("invite.")) return eventType.replace(/\.v\d+$/, "");
  if (eventType.startsWith("director.started")) return "stream.director.started";
  if (eventType.startsWith("director.ended") || eventType.startsWith("director.completed")) {
    return "stream.director.ended";
  }
  return eventType;
}

/**
 * Internal outbox consumer — invite.*.v1 → Hub timeline + cache tags.
 * @param {import('pg').Pool} _pool
 * @param {object} event
 * @param {(msg: string, meta?: object) => void} log
 */
export async function handleInternalOutboxEvent(_pool, event, log) {
  const eventType = String(event.event_type || "");
  const payload =
    event.payload && typeof event.payload === "object" ? event.payload : {};
  const domain = payload._domain && typeof payload._domain === "object" ? payload._domain : {};

  if (eventType.startsWith("invite.")) {
    const userId = payload.userId || domain.actorId || null;
    const platformEvent = mapOutboxEventToPlatformEvent(eventType);

    const result = await recordHubTimelineFromPlatformEvent({
      event: platformEvent,
      userId,
      payload: {
        ...payload,
        inviteId: event.aggregate_id,
        workspaceId: domain.workspaceId || payload.workspaceId,
        role: payload.role,
        outboxId: event.id,
      },
      source: "internal-outbox",
    });

    if (userId) {
      await invalidateUserBffCache(String(userId)).catch(() => {});
    }

    log("outbox_invite_handled", {
      id: event.id,
      eventType,
      platformEvent,
      timeline: result,
    });
    return;
  }

  if (
    eventType.startsWith("director.") ||
    eventType.startsWith("automation.") ||
    eventType.startsWith("stream.") ||
    eventType.startsWith("workspace.")
  ) {
    log("outbox_event_ack", { id: event.id, eventType });
    return;
  }

  log("outbox_event_ignored", { id: event.id, eventType });
}
