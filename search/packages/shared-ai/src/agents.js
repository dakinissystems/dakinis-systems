/**
 * Registro canónico de agentes IA — preferir agents sobre prompts sueltos.
 */

/** @typedef {{ id: string; product: string; name: string; description: string; promptVersion?: string; status: 'live'|'planned' }} AgentDef */

export const AGENT_REGISTRY = [
  {
    id: "core-advisor",
    product: "core",
    name: "Core Advisor",
    description: "Copilot BOS — CRM, inventario, caducidad, catálogo",
    promptVersion: "advisor/v1",
    status: "live",
  },
  {
    id: "sales-advisor",
    product: "core",
    name: "Sales Advisor",
    description: "Pipeline, clientes inactivos, oportunidades",
    status: "planned",
  },
  {
    id: "restaurant-advisor",
    product: "core",
    name: "Restaurant Advisor",
    description: "Vertical restaurante — mesas, stock, alérgenos",
    status: "planned",
  },
  {
    id: "inventory-coach",
    product: "core",
    name: "Inventory Coach",
    description: "Stock bajo, caducidad, compras",
    status: "planned",
  },
  {
    id: "lifeflow-coach",
    product: "lifeflow",
    name: "Life Coach",
    description: "Coach financiero personal — metas y escenarios",
    promptVersion: "coach/v1",
    status: "live",
  },
  {
    id: "content-agent",
    product: "streamautomator",
    name: "Content Agent",
    description: "Ideas de clips, títulos y guiones para streamers",
    promptVersion: "content/v1",
    status: "planned",
  },
  {
    id: "moderation-agent",
    product: "akoenet",
    name: "Moderation Agent",
    description: "Moderación de chat y voz — tono y políticas de comunidad",
    promptVersion: "moderation/v1",
    status: "planned",
  },
  {
    id: "hub-assistant",
    product: "hub",
    name: "Hub Assistant",
    description: "Asistente transversal del Hub — Mi día, apps y marketplace",
    promptVersion: "hub/v1",
    status: "planned",
  },
  {
    id: "finance-coach",
    product: "lifeflow",
    name: "Finance Coach",
    description: "Alias roadmap — proyecciones y riesgo",
    status: "planned",
  },
  {
    id: "support-agent",
    product: "platform",
    name: "Support Agent",
    description: "Soporte usuario + escalado",
    status: "planned",
  },
  {
    id: "knowledge-agent",
    product: "platform",
    name: "Knowledge Agent",
    description: "Consulta corpus Knowledge / docs",
    status: "planned",
  },
  {
    id: "marketplace-agent",
    product: "hub",
    name: "Marketplace Agent",
    description: "Recomienda apps, plugins y automations",
    status: "planned",
  },
];

/** Capacidades IA platform — roadmap más allá de chat/OCR/coach. */
export const AI_CAPABILITIES = [
  { id: "chat", status: "live" },
  { id: "ocr", status: "live" },
  { id: "coach", status: "live" },
  { id: "advisor", status: "live" },
  { id: "rag", status: "live" },
  { id: "embeddings", status: "planned" },
  { id: "planner", status: "planned" },
  { id: "vision", status: "planned" },
  { id: "speech", status: "planned" },
  { id: "transcription", status: "planned" },
  { id: "summaries", status: "planned" },
  { id: "recommendations", status: "planned" },
  { id: "automation", status: "planned" },
  { id: "classification", status: "planned" },
  { id: "extraction", status: "planned" },
  { id: "forecast", status: "planned" },
  { id: "prompt-registry", status: "live" },
];

/**
 * @param {string} product
 * @returns {AgentDef[]}
 */
export function getAgentsForProduct(product) {
  return AGENT_REGISTRY.filter((a) => a.product === product);
}

/**
 * @param {string} id
 * @returns {AgentDef|null}
 */
export function getAgentById(id) {
  return AGENT_REGISTRY.find((a) => a.id === id) || null;
}
