/** Secciones Hub — mirror de @dakinis/shared-ux/hub-dashboard (standalone internal API). */
export const HUB_SECTIONS = [
  { id: "my-day", title: "Mi día", order: 0 },
  { id: "agenda", title: "Agenda de hoy", order: 1 },
  { id: "notifications", title: "Notificaciones", order: 2 },
  { id: "activity", title: "Actividad reciente", order: 3 },
  { id: "ai-summary", title: "Resumen IA", order: 4 },
  { id: "health", title: "Salud", order: 5 },
  { id: "widgets", title: "Widgets", order: 6 },
  { id: "workspace", title: "Dakinis Workspace", order: 7 },
  { id: "apps", title: "Aplicaciones", order: 99 },
];

export const HUB_APPS = [
  { id: "core", name: "Dakinis One", url: "https://core.dakinissystems.com", product: "core", icon: "layers", logo: "core" },
  { id: "lifeflow", name: "LifeFlow", url: "https://finance.dakinissystems.com", product: "lifeflow", icon: "heart-pulse", logo: "lifeflow" },
  { id: "streamautomator", name: "StreamAutomator", url: "https://streamautomator.com", product: "streamautomator", icon: "cast", logo: "streamautomator" },
  { id: "akoenet", name: "AkoeNet", url: "https://akoenet.dakinissystems.com", product: "akoenet", icon: "audio-lines", logo: "akoenet" },
  { id: "tabletop", name: "Tabletop", url: "https://tabletop.dakinissystems.com", product: "tabletop", icon: "dice-5", logo: "tabletop" },
];
