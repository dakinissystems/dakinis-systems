/**
 * Tokens de marca Dakinis — fondo unificado + acentos por producto + IA.
 * Importar también tokens.css en apps web.
 */
export const DAKINIS_SURFACES = {
  bg: "#08111D",
  surface: "#122840",
  panel: "#17344E",
  text: "#f0f4f9",
  muted: "#b8c6d9",
  line: "#23415f",
};

/** Acento IA en todo el ecosistema (Copilot, Coach, badges). */
export const DAKINIS_AI_ACCENT = {
  primary: "#7C3AED",
  primarySoft: "#A855F7",
  glow: "rgba(124, 58, 237, 0.22)",
  border: "rgba(168, 85, 247, 0.45)",
};

/** @deprecated use DAKINIS_SURFACES + product accent */
export const DAKINIS_BRAND_COLORS = {
  bg: DAKINIS_SURFACES.bg,
  bgSoft: DAKINIS_SURFACES.surface,
  card: DAKINIS_SURFACES.surface,
  text: DAKINIS_SURFACES.text,
  muted: DAKINIS_SURFACES.muted,
  brand: "#2dd4bf",
  brandDark: "#14b8a6",
  line: DAKINIS_SURFACES.line,
  landingBg: DAKINIS_SURFACES.bg,
  landingSurface: DAKINIS_SURFACES.surface,
  landingAccent: "#22d3ee",
  ai: DAKINIS_AI_ACCENT.primary,
  aiSoft: DAKINIS_AI_ACCENT.primarySoft,
};

/** Tema base oscuro + acento por producto (identidad sin romper ecosistema). */
export const DAKINIS_PRODUCT_THEMES = {
  core: { accent: "#2dd4bf", accentDark: "#14b8a6", label: "Dakinis One" },
  landing: { accent: "#22d3ee", accentDark: "#06b6d4", label: "Corporate" },
  lifeflow: { accent: "#3dd6c6", accentDark: "#2a9d8f", premium: "#a78bfa", label: "LifeFlow" },
  streamautomator: { accent: "#3b82f6", accentDark: "#2563eb", label: "StreamAutomator" },
  akoenet: { accent: "#7c3aed", accentDark: "#6d28d9", link: "#3b82f6", label: "AkoeNet" },
  dnd: { accent: "#4a7c9e", accentDark: "#5d94b8", gold: "#c9a227", label: "D&D 5e" },
  fitness: { accent: "#059669", accentDark: "#047857", label: "Fitness demo" },
};
