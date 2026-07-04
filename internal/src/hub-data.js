/** Secciones Hub — mirror de @dakinis/shared-ux/hub-dashboard (standalone internal API). */
export const HUB_SECTIONS = [
  { id: "my-day", title: "Mi día", order: 0 },
  { id: "agenda", title: "Agenda de hoy", order: 1 },
  { id: "notifications", title: "Notificaciones", order: 2 },
  { id: "activity", title: "Actividad reciente", order: 3 },
  { id: "ai-summary", title: "Resumen IA", order: 4 },
  { id: "health", title: "Salud", order: 5 },
  { id: "widgets", title: "Widgets", order: 6 },
  { id: "apps", title: "Aplicaciones", order: 99 },
];

export const HUB_APPS = [
  { id: "core", name: "Dakinis One", url: "https://core.dakinissystems.com", product: "core", icon: "building-2" },
  { id: "lifeflow", name: "LifeFlow", url: "https://finance.dakinissystems.com", product: "lifeflow", icon: "heart-pulse" },
  { id: "streamautomator", name: "StreamAutomator", url: "https://streamautomator.com", product: "streamautomator", icon: "radio" },
  { id: "akoenet", name: "AkoeNet", url: "https://akoenet.dakinissystems.com", product: "akoenet", icon: "messages-square" },
  { id: "tabletop", name: "Tabletop", url: "https://tabletop.dakinissystems.com", product: "tabletop", icon: "swords" },
];
