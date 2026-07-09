/** Textos Hub «Mi día» — español por defecto (apps pueden sobreescribir con `t`). */

export const HUB_I18N_ES = {
  "hub.actions.title": "Qué hacer ahora",
  "hub.actions.subtitle": "Sugerencias según tu actividad y tus apps",
  "hub.actions.cta": "Abrir",
};

/**
 * @param {(key: string) => string} [t]
 * @param {string} key
 * @param {string} [fallback]
 */
export function resolveHubT(t, key, fallback = "") {
  const fromT = typeof t === "function" ? t(key) : undefined;
  if (fromT && fromT !== key) return fromT;
  return HUB_I18N_ES[key] || fallback || key;
}

/** Traducción Hub solo con defaults DES. */
export function dakinisHubT(key) {
  return HUB_I18N_ES[key] ?? key;
}
