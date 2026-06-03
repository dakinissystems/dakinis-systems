import company from "./company.js";

export const DAKINIS_CONTACT_EMAIL = company.contacts.general;

export const DAKINIS_CONTACT_WHATSAPP_URL =
  import.meta.env?.VITE_CONTACT_WHATSAPP_URL ||
  "https://wa.me/34600000000?text=Hola%20Dakinis%20Systems";
