/**
 * Eventos de plataforma AkoeNet Assistant — contrato con BullMQ / Redis.
 */

export const AKOENET_EVENT_TYPES = [
  "message.created",
  "message.updated",
  "message.deleted",
  "member.joined",
  "member.left",
  "member.updated",
  "role.updated",
  "channel.created",
  "voice.joined",
  "voice.left",
  "moderation.action",
  "stream.started",
  "stream.ended",
  "stream.clip",
  "stream.highlight",
  "stream.schedule_updated",
  "automation.triggered",
  "automation.completed",
  "ai.response",
  "knowledge.indexed",
  "dev.webhook",
  "business.invoice_paid",
  "business.new_lead",
];

/**
 * @param {Object} input
 * @param {string} input.type
 * @param {string} input.source
 * @param {Record<string, unknown>} input.data
 * @param {{ serverId?: string|number; channelId?: string|number; userId?: string; correlationId?: string }} [input.metadata]
 */
export function createAkoeNetEvent({ type, source, data, metadata = {} }) {
  return {
    id: crypto.randomUUID(),
    type,
    source,
    timestamp: new Date().toISOString(),
    data,
    metadata,
  };
}

/**
 * @param {string} eventType
 * @param {string[]} activeModuleIds
 * @param {Record<string, string[]>} moduleEventSubscriptions — moduleId → event types
 */
export function resolveModulesForEvent(eventType, activeModuleIds, moduleEventSubscriptions) {
  const matched = [];
  for (const moduleId of activeModuleIds) {
    const subs = moduleEventSubscriptions[moduleId];
    if (!subs?.length) {
      if (eventType.startsWith("message.") && ["guardian", "guardian_ai", "assistant"].includes(moduleId)) {
        matched.push(moduleId);
      }
      if (eventType.startsWith("member.") && ["welcome", "guardian", "levels"].includes(moduleId)) {
        matched.push(moduleId);
      }
      if (eventType.startsWith("stream.") && moduleId === "streamer") matched.push(moduleId);
      continue;
    }
    if (subs.includes(eventType) || subs.includes("*")) matched.push(moduleId);
  }
  return [...new Set(matched)];
}
