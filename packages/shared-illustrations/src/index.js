/**
 * Ilustraciones Dakinis — claves y metadatos.
 * Assets SVG en src/assets/ (roadmap); hoy placeholders CSS + emoji fallback.
 */

export const ILLUSTRATION_KEYS = {
  emptyGeneric: "empty-generic",
  emptyWallet: "empty-wallet",
  emptyGoals: "empty-goals",
  emptyChart: "empty-chart",
  emptyCrm: "empty-crm",
  emptyInbox: "empty-inbox",
  emptyBox: "empty-box",
  emptyCommunity: "empty-community",
  emptyChat: "empty-chat",
  emptyCalendar: "empty-calendar",
  emptyDashboard: "empty-dashboard",
  emptySearch: "empty-search",
  offline: "offline",
  error: "error",
  aiThinking: "ai-thinking",
  success: "success",
  celebration: "celebration",
};

/** @typedef {{ key: string; title: string; fallbackEmoji: string; accent?: 'brand'|'ai'|'warn' }} IllustrationMeta */

export const ILLUSTRATION_CATALOG = {
  [ILLUSTRATION_KEYS.emptyGeneric]: { key: ILLUSTRATION_KEYS.emptyGeneric, title: "Sin contenido", fallbackEmoji: "📭", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyWallet]: { key: ILLUSTRATION_KEYS.emptyWallet, title: "Cartera vacía", fallbackEmoji: "👛", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyGoals]: { key: ILLUSTRATION_KEYS.emptyGoals, title: "Sin objetivos", fallbackEmoji: "🎯", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyChart]: { key: ILLUSTRATION_KEYS.emptyChart, title: "Sin datos", fallbackEmoji: "📊", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyCrm]: { key: ILLUSTRATION_KEYS.emptyCrm, title: "Sin clientes", fallbackEmoji: "👥", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyInbox]: { key: ILLUSTRATION_KEYS.emptyInbox, title: "Bandeja vacía", fallbackEmoji: "📥", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyBox]: { key: ILLUSTRATION_KEYS.emptyBox, title: "Sin productos", fallbackEmoji: "📦", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyCommunity]: { key: ILLUSTRATION_KEYS.emptyCommunity, title: "Sin servidores", fallbackEmoji: "🏠", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyChat]: { key: ILLUSTRATION_KEYS.emptyChat, title: "Sin mensajes", fallbackEmoji: "💬", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyCalendar]: { key: ILLUSTRATION_KEYS.emptyCalendar, title: "Calendario vacío", fallbackEmoji: "📅", accent: "brand" },
  [ILLUSTRATION_KEYS.emptyDashboard]: { key: ILLUSTRATION_KEYS.emptyDashboard, title: "Hub vacío", fallbackEmoji: "🧩", accent: "brand" },
  [ILLUSTRATION_KEYS.emptySearch]: { key: ILLUSTRATION_KEYS.emptySearch, title: "Sin resultados", fallbackEmoji: "🔍", accent: "brand" },
  [ILLUSTRATION_KEYS.offline]: { key: ILLUSTRATION_KEYS.offline, title: "Sin conexión", fallbackEmoji: "📡", accent: "warn" },
  [ILLUSTRATION_KEYS.error]: { key: ILLUSTRATION_KEYS.error, title: "Error", fallbackEmoji: "⚠️", accent: "warn" },
  [ILLUSTRATION_KEYS.aiThinking]: { key: ILLUSTRATION_KEYS.aiThinking, title: "IA pensando", fallbackEmoji: "✨", accent: "ai" },
  [ILLUSTRATION_KEYS.success]: { key: ILLUSTRATION_KEYS.success, title: "Éxito", fallbackEmoji: "✅", accent: "brand" },
  [ILLUSTRATION_KEYS.celebration]: { key: ILLUSTRATION_KEYS.celebration, title: "Logro", fallbackEmoji: "🎉", accent: "ai" },
};

export const illustrationStylesheet = `
.dakinis-illustration {
  display: flex; align-items: center; justify-content: center;
  width: 5rem; height: 5rem; margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: var(--dakinis-surface, #122840);
  border: 1px solid var(--dakinis-line, #23415f);
  font-size: 2rem;
}
.dakinis-illustration--ai {
  border-color: var(--dakinis-ai-border, rgba(168, 85, 247, 0.45));
  box-shadow: var(--dakinis-shadow-ai, 0 0 24px rgba(124, 58, 237, 0.25));
}
.dakinis-empty-state { text-align: center; max-width: 28rem; margin: 2rem auto; padding: 1rem; }
.dakinis-empty-state__title { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.35rem; }
.dakinis-empty-state__hint { color: var(--dakinis-muted, #b8c6d9); margin: 0 0 1rem; font-size: 0.9rem; }
.dakinis-empty-state__actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
`;

/**
 * @param {string} key
 * @returns {IllustrationMeta | null}
 */
export function getIllustration(key) {
  return ILLUSTRATION_CATALOG[key] || null;
}
