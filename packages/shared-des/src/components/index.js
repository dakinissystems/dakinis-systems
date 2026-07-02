/**
 * Registro de componentes DES — implementación en @dakinis/shared-ux / shared-layouts.
 */
export const DES_COMPONENTS = {
  button: { status: "planned", package: "@dakinis/shared-ux" },
  card: { status: "ready", package: "@dakinis/shared-ux", export: "DashboardCard" },
  dialog: { status: "planned", package: "@dakinis/shared-ux" },
  input: { status: "planned", package: "@dakinis/shared-ux" },
  table: { status: "planned", package: "@dakinis/shared-ux" },
  sidebar: { status: "ready", package: "@dakinis/shared-layouts", export: "AppShell" },
  navigation: { status: "ready", package: "@dakinis/shared-ux", export: "hub-nav" },
  dashboard: { status: "ready", package: "@dakinis/shared-layouts", export: "DashboardTemplate" },
  timeline: { status: "ready", package: "@dakinis/shared-ux", export: "react/ActivityTimeline.jsx" },
  notifications: { status: "ready", package: "@dakinis/shared-ux", export: "react/NotificationsCenter.jsx" },
  commandPalette: { status: "ready", package: "@dakinis/shared-ux", export: "react/CommandPalette.jsx" },
  emptyState: { status: "ready", package: "@dakinis/shared-ux", export: "react/EmptyState.jsx" },
};

export const DES_COMPONENT_CATEGORIES = ["actions", "data", "navigation", "feedback", "ai"];
