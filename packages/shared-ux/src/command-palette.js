/**
 * Definiciones Command Palette (Ctrl+K) — buscar + comandos + IA.
 */

export const COMMAND_PALETTE_GROUPS = {
  navigation: "Navegación",
  create: "Crear",
  ai: "Dakinis AI",
  products: "Productos",
  settings: "Configuración",
};

/** @typedef {{ id: string; group: string; label: string; keywords?: string[]; shortcut?: string; product?: string }} CommandDef */

/** Comandos base del ecosistema — cada app puede extender. */
export const DAKINIS_COMMANDS = [
  { id: "search", group: "navigation", label: "Buscar en todo el ecosistema", keywords: ["buscar", "find"] },
  { id: "open-hub", group: "navigation", label: "Ir al Hub", keywords: ["hub", "inicio"] },
  { id: "open-core", group: "products", label: "Abrir Dakinis One (Core)", product: "core" },
  { id: "open-lifeflow", group: "products", label: "Abrir LifeFlow", product: "lifeflow" },
  { id: "open-stream", group: "products", label: "Abrir StreamAutomator", product: "streamautomator" },
  { id: "open-akoenet", group: "products", label: "Abrir AkoeNet", product: "akoenet" },
  { id: "create-customer", group: "create", label: "Crear cliente", product: "core", keywords: ["crm", "cliente"] },
  { id: "create-invoice", group: "create", label: "Crear factura", product: "core" },
  { id: "create-order", group: "create", label: "Crear pedido", product: "core" },
  { id: "ask-ai", group: "ai", label: "Preguntar a Dakinis AI", keywords: ["ia", "copilot", "coach"] },
  { id: "ai-summary", group: "ai", label: "Resumir con IA", keywords: ["resumen"] },
  { id: "toggle-theme", group: "settings", label: "Cambiar tema", product: "streamautomator" },
  { id: "switch-product", group: "settings", label: "Cambiar producto activo" },
];

export const SEARCH_SCOPES = [
  { id: "all", label: "Todo" },
  { id: "customers", label: "Clientes", product: "core" },
  { id: "invoices", label: "Facturas", product: "core" },
  { id: "orders", label: "Pedidos", product: "core" },
  { id: "documents", label: "Documentos" },
  { id: "messages", label: "Mensajes", product: "akoenet" },
  { id: "chats", label: "Chats", product: "akoenet" },
  { id: "events", label: "Eventos" },
  { id: "knowledge", label: "Ayuda y docs", rag: true },
  { id: "ai", label: "Preguntas IA", rag: true },
  { id: "settings", label: "Configuración" },
];

/**
 * @param {string} query
 * @param {CommandDef[]} [extra=[]]
 */
export function filterCommands(query, extra = []) {
  const q = String(query || "").trim().toLowerCase();
  const all = [...DAKINIS_COMMANDS, ...extra];
  if (!q) return all;
  return all.filter((cmd) => {
    const hay = [cmd.label, ...(cmd.keywords || [])].join(" ").toLowerCase();
    return hay.includes(q);
  });
}
