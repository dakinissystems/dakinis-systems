/**
 * Catálogo AkoeNet Assistant — módulos nativos por categoría.
 * Fuente de verdad alineada con akoenet.assistant_modules (migr. 032/033).
 */

/** @typedef {'mvp'|'growth'|'future'} ModulePhase */
/** @typedef {'moderation'|'community'|'entertainment'|'stream'|'ai'|'business'|'developer'|'automation'|'system'} ModuleCategory */

/**
 * @typedef {Object} AssistantModuleDef
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {ModuleCategory} category
 * @property {ModulePhase} phase
 * @property {string[]} capabilities
 * @property {string[]} requiresPlan
 * @property {string[]} [permissions]
 * @property {Record<string, unknown>} [defaultConfig]
 */

/** @type {AssistantModuleDef[]} */
export const AKOENET_MODULE_CATALOG = [
  // --- 1. Moderación (Guardian) ---
  {
    id: "guardian",
    name: "Guardian",
    description: "AutoMod, anti-raid, comandos /ban /kick /mute /warn y logs",
    category: "moderation",
    phase: "mvp",
    requiresPlan: ["starter"],
    capabilities: [
      "moderation.automod",
      "moderation.spam",
      "moderation.flood",
      "moderation.links",
      "moderation.invite_links",
      "moderation.banned_words",
      "moderation.anti_raid",
      "moderation.anti_bot",
      "moderation.anti_scam",
      "moderation.ban",
      "moderation.kick",
      "moderation.mute",
      "moderation.timeout",
      "moderation.warn",
      "moderation.unwarn",
      "moderation.slowmode",
      "moderation.purge",
      "moderation.lock",
      "moderation.unlock",
      "moderation.logs",
    ],
    permissions: ["server:moderate", "channel:manage"],
    defaultConfig: {
      autoMod: {
        enabled: true,
        spamThreshold: 5,
        floodThreshold: 8,
        windowSec: 10,
        inviteLinks: true,
        blockLinks: false,
        bannedWords: [],
        actions: {
          banned_word: "block",
          invite_link: "block",
          link: "block",
          spam: "block",
          flood: "block",
        },
      },
      antiRaid: { enabled: true, joinThreshold: 10, action: "captcha" },
      logs: { channels: {} },
    },
  },

  // --- 2. Comunidad ---
  {
    id: "welcome",
    name: "Welcome",
    description: "Bienvenida, DM, rol automático, captcha y verificación",
    category: "community",
    phase: "mvp",
    requiresPlan: ["starter"],
    capabilities: ["community.welcome", "community.auto_role", "community.captcha", "community.verify"],
    defaultConfig: { channelId: null, roleId: null, dmEnabled: false },
  },
  {
    id: "reaction_roles",
    name: "Reaction Roles",
    description: "Roles por reacción — configuración visual",
    category: "community",
    phase: "growth",
    requiresPlan: ["starter"],
    capabilities: ["community.reaction_roles"],
  },
  {
    id: "levels",
    name: "Niveles",
    description: "XP por contribución, niveles con desbloqueos, reputación, misiones y AK Coins",
    category: "community",
    phase: "mvp",
    requiresPlan: ["starter"],
    capabilities: ["community.xp", "community.level", "community.leaderboard", "community.reputation", "community.quests"],
    defaultConfig: {
      messageXp: 15,
      messageCooldownSec: 60,
      messageMinLength: 10,
      reactionXpToAuthor: 8,
      reputationXp: 25,
    },
  },
  {
    id: "economy",
    name: "Economy",
    description: "Monedas, tienda, daily, trabajos y casino",
    category: "community",
    phase: "future",
    requiresPlan: ["growth"],
    capabilities: ["games.economy", "games.daily", "games.shop"],
  },

  // --- 3. Entretenimiento ---
  {
    id: "polls",
    name: "Encuestas y sorteos",
    description: "Polls, votos, quizzes, giveaways y rifas",
    category: "entertainment",
    phase: "growth",
    requiresPlan: ["starter"],
    capabilities: ["community.poll", "community.giveaway", "community.quiz"],
  },
  {
    id: "games",
    name: "Games",
    description: "Trivia, minijuegos y recompensas",
    category: "entertainment",
    phase: "future",
    requiresPlan: ["starter"],
    capabilities: ["games.trivia", "games.minigame"],
  },
  {
    id: "music",
    name: "Music",
    description: "Compartir listening (Spotify) — sin reproducción en servidor",
    category: "entertainment",
    phase: "future",
    requiresPlan: ["growth"],
    capabilities: ["music.spotify_status"],
  },

  // --- 4. Streamers (StreamAutomator) ---
  {
    id: "streamer",
    name: "Streamer",
    description: "Live, horario, clips y alertas Twitch/YouTube/Kick vía StreamAutomator",
    category: "stream",
    phase: "mvp",
    requiresPlan: ["starter"],
    capabilities: [
      "stream.notify",
      "stream.schedule",
      "stream.clip",
      "stream.highlight",
      "stream.vod",
      "stream.twitch_alerts",
      "stream.youtube_alerts",
    ],
    defaultConfig: { autoAnnounce: true, announceChannel: null, pingRole: null },
  },

  // --- 5. IA (Dakinis AI Platform) ---
  {
    id: "assistant",
    name: "AI Assistant",
    description: "@AI — copilot, resúmenes, traducción y búsqueda",
    category: "ai",
    phase: "mvp",
    requiresPlan: ["growth"],
    capabilities: ["ai.ask", "ai.summarize", "ai.translate", "ai.search_messages"],
    permissions: ["ai:use"],
  },
  {
    id: "guardian_ai",
    name: "Moderador IA",
    description: "Toxicidad contextual — no solo palabras prohibidas",
    category: "ai",
    phase: "mvp",
    requiresPlan: ["growth"],
    capabilities: ["ai.moderate"],
    permissions: ["server:moderate"],
  },
  {
    id: "translator",
    name: "Traductor",
    description: "Traducción automática multilingüe en canales",
    category: "ai",
    phase: "growth",
    requiresPlan: ["growth"],
    capabilities: ["ai.translate_auto"],
  },
  {
    id: "knowledge",
    name: "Knowledge",
    description: "FAQ y documentación vía Dakinis Knowledge",
    category: "ai",
    phase: "mvp",
    requiresPlan: ["growth"],
    capabilities: ["knowledge.search", "knowledge.faq", "knowledge.add"],
  },
  {
    id: "meeting_ai",
    name: "Meeting AI",
    description: "Resúmenes de voz — tareas y participantes",
    category: "ai",
    phase: "future",
    requiresPlan: ["pro"],
    capabilities: ["ai.meeting_summary"],
  },
  {
    id: "developer_ai",
    name: "Developer AI",
    description: "Explica código, analiza logs y errores",
    category: "ai",
    phase: "growth",
    requiresPlan: ["pro"],
    capabilities: ["ai.code", "ai.logs"],
  },

  // --- Empresas ---
  {
    id: "business",
    name: "Business",
    description: "CRM, tickets y billing desde Core",
    category: "business",
    phase: "future",
    requiresPlan: ["pro"],
    capabilities: ["business.crm", "business.tickets", "business.billing", "business.hr"],
  },
  {
    id: "support",
    name: "Support",
    description: "Tickets, FAQs y base de conocimiento del servidor",
    category: "business",
    phase: "growth",
    requiresPlan: ["pro"],
    capabilities: ["support.ticket", "support.faq"],
  },
  {
    id: "events",
    name: "Events",
    description: "Calendario, RSVP y recordatorios",
    category: "business",
    phase: "growth",
    requiresPlan: ["starter"],
    capabilities: ["events.create", "events.rsvp", "events.remind"],
  },

  // --- Desarrolladores ---
  {
    id: "developer",
    name: "Developer",
    description: "GitHub, GitLab, Railway, Supabase webhooks",
    category: "developer",
    phase: "growth",
    requiresPlan: ["pro"],
    capabilities: ["dev.github", "dev.gitlab", "dev.railway", "dev.supabase", "dev.docker"],
  },

  // --- Automatización ---
  {
    id: "automation",
    name: "Automation",
    description: "Cuando X → haz Y — flujos visuales tipo Zapier",
    category: "automation",
    phase: "growth",
    requiresPlan: ["pro"],
    capabilities: ["automation.flow"],
  },
];

export function getModuleById(id) {
  return AKOENET_MODULE_CATALOG.find((m) => m.id === id) ?? null;
}

export function getModulesByPhase(phase) {
  return AKOENET_MODULE_CATALOG.filter((m) => m.phase === phase);
}

export function getCapabilityMap() {
  /** @type {Record<string, string>} */
  const map = {};
  for (const mod of AKOENET_MODULE_CATALOG) {
    for (const cap of mod.capabilities) {
      if (!map[cap]) map[cap] = mod.id;
    }
  }
  return map;
}
