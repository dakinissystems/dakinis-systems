/**
 * Tokens de marca Dakinis — fondo unificado + acentos por producto + IA.
 * Importar también tokens.css en apps web.
 */
export { DAKINIS_SURFACES, DAKINIS_SURFACE_STACK, DAKINIS_SURFACE_LEVELS } from "./surfaces.js";
export { DAKINIS_SEMANTIC_COLORS, DAKINIS_AI_ACCENT } from "./semantic-colors.js";

/** @deprecated use DAKINIS_BRAND_COLORS or DAKINIS_SURFACES */
export const DAKINIS_BRAND_COLORS = {
  bg: "#08111D",
  bgSoft: "#122840",
  card: "#122840",
  text: "#f0f4f9",
  muted: "#b8c6d9",
  brand: "#2dd4bf",
  brandDark: "#14b8a6",
  line: "#23415f",
  landingBg: "#08111D",
  landingSurface: "#122840",
  landingAccent: "#22d3ee",
  ai: "#7C3AED",
  aiSoft: "#A855F7",
};

/**
 * Acento por producto — solo branding. Todo lo demás es DES común.
 * Core cyan · LifeFlow verde · Tabletop oro · AkoeNet violeta · SA azul.
 */
export const DAKINIS_PRODUCT_THEMES = {
  core: { accent: "#2dd4bf", accentDark: "#14b8a6", label: "Dakinis One" },
  hub: { accent: "#2dd4bf", accentDark: "#14b8a6", label: "Hub" },
  landing: { accent: "#22d3ee", accentDark: "#06b6d4", label: "Corporate" },
  lifeflow: { accent: "#22c55e", accentDark: "#16a34a", label: "LifeFlow" },
  streamautomator: { accent: "#3b82f6", accentDark: "#2563eb", label: "StreamAutomator" },
  akoenet: { accent: "#7c3aed", accentDark: "#6d28d9", label: "AkoeNet" },
  tabletop: { accent: "#c9a227", accentDark: "#a8841f", label: "Tabletop" },
  dnd: { accent: "#c9a227", accentDark: "#a8841f", label: "D&D 5e" },
  fitness: { accent: "#059669", accentDark: "#047857", label: "Fitness demo" },
};
