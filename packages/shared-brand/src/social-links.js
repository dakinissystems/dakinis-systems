import company from "./company.js";

export const DAKINIS_CONTACT_EMAIL = company.contacts.general;

/** E.164 sin + (override en build: VITE_CONTACT_WHATSAPP_PHONE). */
const DAKINIS_WHATSAPP_PHONE_DEFAULT = "34637169174";

/**
 * URL wa.me para la landing (y otros frontends Vite).
 * Prioridad: `options.text` → VITE_CONTACT_WHATSAPP_URL (sin texto custom) → teléfono + texto según idioma.
 * @param {"es"|"en"} [locale]
 * @param {{ text?: string }} [options]
 */
export function dakinisContactWhatsappUrl(locale = "es", options = {}) {
  const customText = String(options?.text || "").trim();
  const full = String(import.meta.env?.VITE_CONTACT_WHATSAPP_URL || "").trim();
  if (full && !customText) return full;

  const phone = String(import.meta.env?.VITE_CONTACT_WHATSAPP_PHONE || DAKINIS_WHATSAPP_PHONE_DEFAULT).replace(
    /\D/g,
    ""
  );
  const text =
    customText ||
    (locale === "en" ? "Hello, I'd like to contact Dakinis Systems" : "Hola, quiero contactar con Dakinis Systems");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/** @deprecated Prefer `dakinisContactWhatsappUrl(locale)` en UI con i18n. */
export const DAKINIS_CONTACT_WHATSAPP_URL = dakinisContactWhatsappUrl("es");
