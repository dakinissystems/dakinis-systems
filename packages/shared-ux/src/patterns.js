/**
 * Patrones Experience listos para producto (B4).
 * El registro DES_PATTERNS en shared-des apunta aquí.
 */
export const UX_PATTERNS = {
  dashboard: {
    status: "ready",
    export: "DashboardPattern",
    shell: "DashboardTemplate",
    sections: ["topbar", "widgets", "cards", "timeline", "quickActions"],
  },
  chat: {
    status: "ready",
    export: "ChatPattern",
    note: "AiMessage + composer · acento vía data-product",
  },
  forms: {
    status: "ready",
    export: "FormPattern",
    note: "Input + Button · error/success semánticos",
  },
};
