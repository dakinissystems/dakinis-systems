/** Documentos legales — app local D&D 5e (sin servidor) */

export type LegalDocKey = "privacy" | "terms" | "notice" | "ogl";

export type LegalSection = { h: string; p: string };

export type LegalDoc = {
  title: string;
  sections: LegalSection[];
};

export const LEGAL_UPDATED = "19 mayo 2026";

export const LEGAL_DOCS: Record<LegalDocKey, LegalDoc> = {
  privacy: {
    title: "Privacidad",
    sections: [
      {
        h: "Datos almacenados",
        p: "Todos los personajes se guardan solo en localStorage de tu navegador. No enviamos datos a servidores ni creamos cuentas.",
      },
      {
        h: "Eliminación",
        p: "Borra datos desde el navegador (limpiar sitio / almacenamiento local) o eliminando personajes en la app.",
      },
      {
        h: "Contacto",
        p: "Dakinis Systems — privacy@dakinissystems.com",
      },
    ],
  },
  terms: {
    title: "Términos de uso",
    sections: [
      {
        h: "Uso",
        p: "App gratuita de gestión de fichas D&D 5e. Uso personal. No garantizamos compatibilidad con todas las reglas oficiales.",
      },
      {
        h: "Contenido SRD",
        p: "Reglas y textos del SRD se usan bajo Open Game License. Ver aviso OGL.",
      },
      {
        h: "Limitación",
        p: "Servicio «tal cual». Dakinis Systems no está afiliado a Wizards of the Coast.",
      },
    ],
  },
  notice: {
    title: "Aviso legal",
    sections: [
      {
        h: "Titular",
        p: "Christian David Villar Colodro · Dakinis Systems · NIF 18513473Z · Málaga, España",
      },
      {
        h: "Objeto",
        p: "Aplicación web local para fichas de personaje D&D 5ª edición.",
      },
      {
        h: "Propiedad intelectual",
        p: "Código y diseño de la app: Dakinis Systems. D&D y related marks: Wizards of the Coast LLC.",
      },
    ],
  },
  ogl: {
    title: "Open Game License (SRD)",
    sections: [
      {
        h: "SRD 5e",
        p: "Parte del contenido (razas, clases, hechizos SRD) proviene del System Reference Document bajo OGL 1.0a.",
      },
      {
        h: "Atribución",
        p: "Dungeons & Dragons, D&D, Wizards of the Coast y related marks are trademarks of Wizards of the Coast LLC. This app is not affiliated with or endorsed by Wizards of the Coast.",
      },
      {
        h: "Contenido custom",
        p: "Armas y elementos de campaña personalizados son creación del usuario o de la app y no forman parte del SRD oficial.",
      },
    ],
  },
};

export const LEGAL_NAV: { key: LegalDocKey; label: string }[] = [
  { key: "privacy", label: "Privacidad" },
  { key: "terms", label: "Términos" },
  { key: "notice", label: "Aviso legal" },
  { key: "ogl", label: "OGL / SRD" },
];
