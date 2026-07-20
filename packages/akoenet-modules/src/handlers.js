/**
 * Handlers de módulos AkoeNet Assistant — scaffolds Fase 1.
 * AkoeNet Server invoca vía orchestrator; workers async para IA.
 */

/** @typedef {import('@dakinis/akoenet-orchestrator').AssistantCommand} AssistantCommand */

/**
 * @param {AssistantCommand} command
 * @returns {Promise<{ status: string; [key: string]: unknown }>}
 */
export async function handleGuardian(command) {
  const { action, payload = {}, type } = command;

  if (type === "event") {
    if (action === "message.created") return { status: "automod_evaluated", allowed: true };
    if (action === "member.joined") return { status: "anti_raid_checked" };
    return { status: "event_ack", action };
  }

  switch (action) {
    case "moderation.automod":
      return { status: "automod_evaluated", allowed: true };
    case "moderation.ban":
    case "moderation.kick":
    case "moderation.mute":
    case "moderation.warn":
      return { status: "moderation_logged", action, targetUserId: payload.targetUserId };
    case "moderation.logs":
      return { status: "logs_configured", channels: payload.channels ?? {} };
    default:
      return { status: "not_implemented", action };
  }
}

export async function handleWelcome(command) {
  if (command.type === "event" && command.action === "member.joined") {
    return { status: "welcome_queued", userId: command.payload?.event?.data?.userId };
  }
  if (command.action === "community.welcome") {
    return { status: "welcome_sent", channelId: command.payload?.channelId };
  }
  return { status: "not_implemented", action: command.action };
}

export async function handleAssistant(command) {
  switch (command.action) {
    case "ai.ask":
      return {
        status: "queued_or_sync",
        handler: "internal-api",
        queue: "dakinis.ai",
        message: "IA via Dakinis AI — async BullMQ when DAKINIS_EVENT_BUS=bullmq, else sync",
      };
    case "ai.summarize":
    case "ai.translate":
      return { status: "queued", queue: "dakinis.ai", action: command.action };
    default:
      return { status: "not_implemented", action: command.action };
  }
}

export async function handleGuardianAi(command) {
  if (command.action === "ai.moderate") {
    return { status: "queued", queue: "akoenet:moderation-ai", severity: 0 };
  }
  return { status: "not_implemented", action: command.action };
}

export async function handleStreamer(command) {
  if (command.type === "event") {
    if (command.action === "stream.started") {
      const data = command.payload?.event?.data || {};
      return {
        status: "announcement_queued",
        platform: data.platform,
        streamer: data.streamer || data.scheduler_slug,
      };
    }
    if (command.action === "stream.ended") {
      return { status: "stream_ended_ack", action: command.action };
    }
    if (command.action === "stream.clip") {
      return { status: "clip_published", url: command.payload?.event?.data?.clipUrl };
    }
    return { status: "event_ack", action: command.action };
  }

  switch (command.action) {
    case "stream.notify":
      return { status: "announcement_published", platform: command.payload?.platform };
    case "stream.schedule":
      return { status: "schedule_fetched" };
    case "stream.clip":
      return { status: "clip_published", url: command.payload?.clipUrl };
    default:
      return { status: "not_implemented", action: command.action };
  }
}

export async function handleKnowledge(command) {
  switch (command.action) {
    case "knowledge.search":
    case "knowledge.faq":
      return { status: "queued", queue: "akoenet:knowledge", query: command.payload?.query };
    case "knowledge.add":
      return { status: "indexed", title: command.payload?.title };
    default:
      return { status: "not_implemented", action: command.action };
  }
}

export async function handleAutomation(command) {
  if (command.action === "automation.flow") {
    return { status: "automation_evaluated", matched: false };
  }
  return { status: "not_implemented", action: command.action };
}

export async function handleCommunity(command) {
  return { status: "not_implemented", action: command.action };
}

/**
 * Levels module — awards are applied in AkoeNet Server (local ledger).
 * Internal receives events for audit/orchestration when module is enabled.
 */
export async function handleLevels(command) {
  if (command.type === "event") {
    const event = command.payload?.event || {};
    const data = event.data || command.payload || {};
    return {
      status: "levels_event_ack",
      action: command.action,
      note: "XP awards run on akoenet-backend levels.service",
      hint: {
        serverId: command.serverId || event.metadata?.serverId,
        userId: data.userId || event.metadata?.userId,
        messageId: data.messageId || event.metadata?.messageId,
      },
    };
  }
  switch (command.action) {
    case "community.xp":
    case "community.level":
    case "community.leaderboard":
      return { status: "use_akoenet_api", path: "/servers/:id/levels/*" };
    default:
      return { status: "not_implemented", action: command.action };
  }
}

export async function handleDeveloper(command) {
  return { status: "webhook_received", source: command.payload?.source };
}

export async function handleBusiness(command) {
  return { status: "not_implemented", action: command.action };
}

export async function handleEntertainment(command) {
  return { status: "not_implemented", action: command.action };
}

/** @type {Record<string, (cmd: AssistantCommand) => Promise<unknown>>} */
export const MODULE_HANDLERS = {
  guardian: handleGuardian,
  welcome: handleWelcome,
  assistant: handleAssistant,
  guardian_ai: handleGuardianAi,
  streamer: handleStreamer,
  knowledge: handleKnowledge,
  automation: handleAutomation,
  reaction_roles: handleCommunity,
  levels: handleLevels,
  economy: handleCommunity,
  polls: handleCommunity,
  games: handleEntertainment,
  music: handleEntertainment,
  translator: handleAssistant,
  meeting_ai: handleAssistant,
  developer_ai: handleAssistant,
  business: handleBusiness,
  support: handleBusiness,
  events: handleCommunity,
  developer: handleDeveloper,
};

/**
 * @param {string} moduleId
 * @param {AssistantCommand} command
 */
export async function invokeModule(moduleId, command) {
  const handler = MODULE_HANDLERS[moduleId];
  if (!handler) return { status: "unknown_module", moduleId };
  return handler(command);
}
