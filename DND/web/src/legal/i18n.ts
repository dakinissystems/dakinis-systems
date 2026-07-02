export type LegalDocKey = "privacy" | "terms" | "notice" | "ogl";

export type LegalSection = { h: string; p: string };

export type LegalDoc = {
  title: string;
  sections: LegalSection[];
};

type LegalPack = {
  docs: Record<LegalDocKey, LegalDoc>;
  nav: { key: LegalDocKey; label: string }[];
};

export const LEGAL_DOCS: Record<"en" | "es", Record<LegalDocKey, LegalDoc>> = {
  es: {
    privacy: {
      title: "Privacidad",
      sections: [
        {
          h: "Datos almacenados",
          p: "Los personajes se guardan en localStorage de tu navegador. Si creas cuenta, también se sincronizan en los servidores de Dakinis Tabletop (personajes, campañas, notas y botín compartido). No vendemos tus datos.",
        },
        {
          h: "Eliminación",
          p: "Borra datos locales desde el navegador o eliminando personajes en la app. Para cuenta en nube, contacta con soporte para eliminar tu perfil.",
        },
        {
          h: "Contacto",
          p: "Dakinis Systems - privacy@dakinissystems.com",
        },
      ],
    },
    terms: {
      title: "Términos de uso",
      sections: [
        {
          h: "Uso",
          p: "Dakinis Tabletop es una app gratuita de gestión de partidas de rol de mesa. Uso personal. El MVP incluye reglas SRD 5e; no garantizamos compatibilidad con todas las reglas oficiales.",
        },
        {
          h: "Contenido SRD",
          p: "Reglas y textos del SRD se usan bajo Open Game License. Ver aviso OGL.",
        },
        {
          h: "Limitación",
          p: "Servicio \"tal cual\". Dakinis Systems no está afiliado a Wizards of the Coast.",
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
          p: "Aplicación web Dakinis Tabletop para fichas de personaje, campañas y mesa compartida (MVP: reglas SRD 5ª edición).",
        },
        {
          h: "Propiedad intelectual",
          p: "Código y diseño de la app: Dakinis Systems. Dungeons & Dragons y marcas relacionadas: Wizards of the Coast LLC.",
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
          p: "Dungeons & Dragons, D&D, Wizards of the Coast y related marks are trademarks of Wizards of the Coast LLC. Dakinis Tabletop is not affiliated with or endorsed by Wizards of the Coast.",
        },
        {
          h: "Contenido custom",
          p: "Armas y elementos de campaña personalizados son creación del usuario o de la app y no forman parte del SRD oficial.",
        },
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy",
      sections: [
        {
          h: "Stored data",
          p: "Characters are saved in your browser localStorage. If you create an account, they are also synced to Dakinis Tabletop servers (characters, campaigns, notes, and shared loot). We do not sell your data.",
        },
        {
          h: "Deletion",
          p: "Delete local data from your browser or by removing characters in the app. For cloud accounts, contact support to remove your profile.",
        },
        {
          h: "Contact",
          p: "Dakinis Systems - privacy@dakinissystems.com",
        },
      ],
    },
    terms: {
      title: "Terms of use",
      sections: [
        {
          h: "Use",
          p: "Dakinis Tabletop is a free app for tabletop RPG campaign management. Personal use only. The MVP includes SRD 5e rules; compatibility with all official rules is not guaranteed.",
        },
        {
          h: "SRD content",
          p: "SRD rules and texts are used under the Open Game License. See OGL notice.",
        },
        {
          h: "Limitation",
          p: "Service provided \"as is\". Dakinis Systems is not affiliated with Wizards of the Coast.",
        },
      ],
    },
    notice: {
      title: "Legal notice",
      sections: [
        {
          h: "Owner",
          p: "Christian David Villar Colodro · Dakinis Systems · NIF 18513473Z · Malaga, Spain",
        },
        {
          h: "Purpose",
          p: "Dakinis Tabletop web app for character sheets, campaigns, and shared table play (MVP: SRD 5th edition rules).",
        },
        {
          h: "Intellectual property",
          p: "App code and design: Dakinis Systems. Dungeons & Dragons and related marks: Wizards of the Coast LLC.",
        },
      ],
    },
    ogl: {
      title: "Open Game License (SRD)",
      sections: [
        {
          h: "SRD 5e",
          p: "Part of the content (races, classes, SRD spells) comes from the System Reference Document under OGL 1.0a.",
        },
        {
          h: "Attribution",
          p: "Dungeons & Dragons, D&D, Wizards of the Coast and related marks are trademarks of Wizards of the Coast LLC. Dakinis Tabletop is not affiliated with or endorsed by Wizards of the Coast.",
        },
        {
          h: "Custom content",
          p: "Custom campaign weapons and elements are created by the user or app and are not part of the official SRD.",
        },
      ],
    },
  },
};

export const LEGAL_NAV: Record<"en" | "es", { key: LegalDocKey; label: string }[]> = {
  es: [
    { key: "privacy", label: "Privacidad" },
    { key: "terms", label: "Términos" },
    { key: "notice", label: "Aviso legal" },
    { key: "ogl", label: "OGL / SRD" },
  ],
  en: [
    { key: "privacy", label: "Privacy" },
    { key: "terms", label: "Terms" },
    { key: "notice", label: "Legal notice" },
    { key: "ogl", label: "OGL / SRD" },
  ],
};

export function legalPack(locale: "en" | "es"): LegalPack {
  return {
    docs: LEGAL_DOCS[locale],
    nav: LEGAL_NAV[locale],
  };
}
