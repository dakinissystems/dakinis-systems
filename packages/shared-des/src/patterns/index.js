/**
 * Patrones UX oficiales — reutilizar al crear productos nuevos.
 */
export const DES_PATTERNS = {
  emptyStates: { status: "ready", module: "@dakinis/shared-ux/empty-states" },
  loading: { status: "ready", module: "@dakinis/shared-loading" },
  errors: { status: "ready", module: "@dakinis/shared-illustrations" },
  aiResponses: { status: "ready", module: "@dakinis/shared-des/ai" },
  search: { status: "planned", module: "@dakinis/shared-ux/command-palette" },
  crud: { status: "documented", surfaces: [0, 1], layout: "list-detail" },
  wizards: { status: "planned", module: "@dakinis/shared-onboarding" },
  dashboards: { status: "ready", module: "@dakinis/shared-layouts" },
  settings: { status: "documented", layout: "sidebar-sections" },
  analytics: { status: "ready", module: "@dakinis/shared-charts" },
  marketplace: { status: "ready", module: "@dakinis/shared-ux/marketplace" },
  notifications: { status: "ready", module: "@dakinis/shared-ux/react/NotificationsCenter.jsx" },
  chat: { status: "planned" },
  aiConversation: { status: "ready", module: "@dakinis/shared-des/ai" },
  timeline: { status: "ready", module: "@dakinis/shared-ux/react/ActivityTimeline.jsx" },
  calendar: { status: "planned" },
};
