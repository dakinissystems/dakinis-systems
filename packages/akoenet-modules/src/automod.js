/**
 * Rules-based AutoMod evaluation (shared by Internal Guardian + AkoeNet Server).
 * Pure: no I/O. Callers supply flood/spam counters in ctx when needed.
 */

/** @typedef {'block'|'warn'|'delete'|'delete_and_warn'} AutoModAction */
/** @typedef {'banned_word'|'invite_link'|'link'|'spam'|'flood'} AutoModReason */

export const DEFAULT_AUTOMOD_CONFIG = {
  enabled: true,
  bannedWords: [],
  inviteLinks: true,
  blockLinks: false,
  spamThreshold: 5,
  floodThreshold: 8,
  windowSec: 10,
  actions: {
    banned_word: "block",
    invite_link: "block",
    link: "block",
    spam: "block",
    flood: "block",
  },
};

const INVITE_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:discord(?:app)?\.com\/invite|discord\.gg)\/[a-z0-9-]+/i;
const URL_RE = /https?:\/\/[^\s<>"']+/i;

/**
 * @param {unknown} raw
 */
export function mergeAutoModConfig(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const nested =
    src.autoMod && typeof src.autoMod === "object"
      ? src.autoMod
      : src;
  return {
    ...DEFAULT_AUTOMOD_CONFIG,
    ...nested,
    actions: {
      ...DEFAULT_AUTOMOD_CONFIG.actions,
      ...(nested.actions && typeof nested.actions === "object" ? nested.actions : {}),
    },
    bannedWords: Array.isArray(nested.bannedWords)
      ? nested.bannedWords.map((w) => String(w).trim().toLowerCase()).filter(Boolean)
      : DEFAULT_AUTOMOD_CONFIG.bannedWords,
  };
}

/**
 * @param {string} content
 * @param {ReturnType<typeof mergeAutoModConfig>} config
 * @param {{ recentMessageCount?: number; sameContentCount?: number }} [ctx]
 * @returns {{ allowed: boolean; reason?: AutoModReason; action?: AutoModAction; matched?: string }}
 */
export function evaluateAutoMod(content, config, ctx = {}) {
  const cfg = mergeAutoModConfig(config);
  if (!cfg.enabled) return { allowed: true };

  const text = String(content || "");
  if (!text.trim()) return { allowed: true };

  const lower = text.toLowerCase();

  for (const word of cfg.bannedWords) {
    if (!word) continue;
    if (lower.includes(word)) {
      return {
        allowed: false,
        reason: "banned_word",
        action: cfg.actions.banned_word || "block",
        matched: word,
      };
    }
  }

  if (cfg.inviteLinks !== false && INVITE_RE.test(text)) {
    const m = text.match(INVITE_RE);
    return {
      allowed: false,
      reason: "invite_link",
      action: cfg.actions.invite_link || "block",
      matched: m ? m[0] : undefined,
    };
  }

  if (cfg.blockLinks && URL_RE.test(text)) {
    const m = text.match(URL_RE);
    return {
      allowed: false,
      reason: "link",
      action: cfg.actions.link || "block",
      matched: m ? m[0] : undefined,
    };
  }

  const floodThreshold = Number(cfg.floodThreshold) || 0;
  const recent = Number(ctx.recentMessageCount) || 0;
  if (floodThreshold > 0 && recent >= floodThreshold) {
    return {
      allowed: false,
      reason: "flood",
      action: cfg.actions.flood || "block",
      matched: String(recent),
    };
  }

  const spamThreshold = Number(cfg.spamThreshold) || 0;
  const same = Number(ctx.sameContentCount) || 0;
  if (spamThreshold > 0 && same >= spamThreshold) {
    return {
      allowed: false,
      reason: "spam",
      action: cfg.actions.spam || "block",
      matched: String(same),
    };
  }

  return { allowed: true };
}
