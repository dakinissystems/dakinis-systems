/** Textos Hub — español e inglés (Mi día, Workspace, admin). */

export const HUB_I18N_ES = {
  "hub.actions.title": "Qué hacer ahora",
  "hub.actions.subtitle": "Sugerencias según tu actividad y tus apps",
  "hub.actions.cta": "Abrir",
  "hub.workspace.title": "Dakinis Workspace",
  "hub.workspace.open": "Abrir",
  "hub.workspace.roadmap": "Roadmap",
  "hub.workspace.appsTitle": "Aplicaciones",
  "hub.workspace.adminTitle": "Addons del workspace",
  "hub.workspace.adminLead": "Activa o desactiva mini-aplicaciones nativas para tu workspace.",
  "hub.workspace.adminEnableAll": "Activar todos",
  "hub.workspace.adminSaving": "Guardando…",
  "hub.workspace.adminSaved": "Guardado",
  "hub.workspace.adminError": "No se pudo guardar",
  "hub.workspace.adminPinned": "Fijado",
  "hub.workspace.adminOn": "Activo",
  "hub.workspace.adminOff": "Inactivo",
  "hub.workspace.adminCategory.system": "Sistema",
  "hub.workspace.adminCategory.productivity": "Productividad",
  "hub.workspace.adminCategory.developer": "Desarrollo",
  "hub.workspace.adminCategory.stream": "Streaming",
  "hub.workspace.adminCategory.media": "Media",
  "hub.workspace.adminCategory.entertainment": "Entretenimiento",
};

export const HUB_I18N_EN = {
  "hub.actions.title": "What to do now",
  "hub.actions.subtitle": "Suggestions based on your activity and apps",
  "hub.actions.cta": "Open",
  "hub.workspace.title": "Dakinis Workspace",
  "hub.workspace.open": "Open",
  "hub.workspace.roadmap": "Roadmap",
  "hub.workspace.appsTitle": "Applications",
  "hub.workspace.adminTitle": "Workspace addons",
  "hub.workspace.adminLead": "Enable or disable native mini-apps for your workspace.",
  "hub.workspace.adminEnableAll": "Enable all",
  "hub.workspace.adminSaving": "Saving…",
  "hub.workspace.adminSaved": "Saved",
  "hub.workspace.adminError": "Could not save",
  "hub.workspace.adminPinned": "Pinned",
  "hub.workspace.adminOn": "On",
  "hub.workspace.adminOff": "Off",
  "hub.workspace.adminCategory.system": "System",
  "hub.workspace.adminCategory.productivity": "Productivity",
  "hub.workspace.adminCategory.developer": "Developer",
  "hub.workspace.adminCategory.stream": "Streaming",
  "hub.workspace.adminCategory.media": "Media",
  "hub.workspace.adminCategory.entertainment": "Entertainment",
};

/**
 * @param {"es"|"en"} [locale]
 */
export function dakinisHubT(key, locale = "es") {
  const table = locale === "en" ? HUB_I18N_EN : HUB_I18N_ES;
  return table[key] ?? HUB_I18N_ES[key] ?? key;
}

/**
 * @param {(key: string) => string} [t]
 * @param {string} key
 * @param {string} [fallback]
 */
export function resolveHubT(t, key, fallback = "") {
  const fromT = typeof t === "function" ? t(key) : undefined;
  if (fromT && fromT !== key) return fromT;
  return dakinisHubT(key) || fallback || key;
}
