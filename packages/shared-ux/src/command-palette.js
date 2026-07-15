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
  { id: "search", group: "navigation", label: "Buscar en todo el ecosistema", keywords: ["buscar", "find", "ctrl+k"] },
  { id: "open-hub", group: "navigation", label: "Ir al Hub", keywords: ["hub", "inicio", "mi día"] },
  { id: "open-core", group: "products", label: "Abrir Dakinis One (Core)", product: "core" },
  { id: "open-lifeflow", group: "products", label: "Abrir LifeFlow", product: "lifeflow" },
  { id: "open-stream", group: "products", label: "Abrir StreamAutomator", product: "streamautomator" },
  { id: "stream-director", group: "create", label: "Modo Director (stream)", product: "streamautomator", keywords: ["directo", "live", "twitch", "obs"] },
  { id: "stream-schedule", group: "create", label: "Programar stream", product: "streamautomator", keywords: ["calendario", "publicar", "tweet"] },
  { id: "stream-automation", group: "create", label: "Automatización stream IF/THEN", product: "streamautomator", keywords: ["reglas", "discord", "zap"] },
  { id: "stream-campaign", group: "create", label: "Campaign Center", product: "streamautomator", keywords: ["campaña", "lanzamiento", "kit"] },
  { id: "open-akoenet", group: "products", label: "Abrir AkoeNet", product: "akoenet" },
  { id: "open-workspace", group: "products", label: "Abrir Workspace (desktop)", product: "akoenet", keywords: ["escritorio", "addons"] },
  { id: "create-customer", group: "create", label: "Crear cliente", product: "core", keywords: ["crm", "cliente", "contacto"] },
  { id: "create-invoice", group: "create", label: "Crear factura", product: "core", keywords: ["factura", "cobro"] },
  { id: "create-order", group: "create", label: "Crear pedido", product: "core", keywords: ["pedido", "venta"] },
  { id: "open-kitchen", group: "navigation", label: "Ir a cocina / pedidos", product: "core", keywords: ["restaurante", "mesa", "comanda"] },
  { id: "open-whatsapp", group: "navigation", label: "Abrir WhatsApp", product: "core", keywords: ["chat", "mensaje"] },
  { id: "ask-ai", group: "ai", label: "Preguntar a Dakinis AI", keywords: ["ia", "copilot", "coach", "asistente"] },
  { id: "ai-summary", group: "ai", label: "Resumir con IA", keywords: ["resumen"] },
  { id: "open-notifications", group: "navigation", label: "Ver notificaciones", keywords: ["alertas", "bandeja"] },
  { id: "open-activity", group: "navigation", label: "Ver actividad reciente", keywords: ["timeline", "historial"] },
  { id: "toggle-theme", group: "settings", label: "Cambiar tema", product: "streamautomator" },
  { id: "switch-product", group: "settings", label: "Cambiar producto activo" },
];

export const SEARCH_SCOPES = [
  { id: "all", label: "Todo" },
  { id: "customers", label: "Clientes", product: "core" },
  { id: "invoices", label: "Facturas", product: "core" },
  { id: "orders", label: "Pedidos", product: "core" },
  { id: "streams", label: "Streams", product: "streamautomator" },
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

/** Alinea scopes UI Command Palette con Search API. */
export function mapCmdkScopeToSearch(scope) {
  const map = {
    customers: "clients",
    documents: "documentation",
    orders: "global",
    streams: "global",
    knowledge: "knowledge",
    ai: "knowledge",
  };
  return map[scope] || scope || "all";
}

/** Etiqueta de grupo para un hit de Search en la paleta. */
export function searchHitGroupLabel(scope) {
  const match = SEARCH_SCOPES.find((s) => s.id === scope);
  if (match) return match.label;
  if (scope === "clients") return "Clientes";
  if (scope === "documentation") return "Documentos";
  return scope || "Resultado";
}

/**
 * Destino por defecto al abrir un hit (Core/Hub pueden sobreescribir).
 * @param {{ scope?: string; id?: string; title?: string; path?: string; metadata?: { path?: string } }} hit
 */
export function resolveSearchHitPath(hit) {
  const explicit = hit?.path || hit?.metadata?.path;
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();

  const scope = hit?.scope || "global";
  const id = hit?.id ? encodeURIComponent(String(hit.id)) : "";
  const title = encodeURIComponent(hit?.title || "");

  if (scope === "knowledge" || scope === "documentation") {
    return title ? `/faq?q=${title}` : "/faq";
  }
  if (scope === "clients" || scope === "customers") {
    return id ? `/app/whatsapp?contact=${id}` : "/app/crm";
  }
  if (scope === "invoices") {
    return id ? `/app/ventas?invoice=${id}` : "/app/ventas";
  }
  if (scope === "orders") {
    return id ? `/app/ventas?order=${id}` : "/app/ventas";
  }
  if (scope === "messages" || scope === "chats") {
    const product = hit?.product || hit?.metadata?.product;
    if (product === "akoenet") return "/hub";
    return id ? `/app/whatsapp?msg=${id}` : "/app/whatsapp";
  }
  if (scope === "events") return "/app/dashboard";
  if (scope === "streams" || scope === "streamautomator") return "/hub";
  return "/hub";
}
