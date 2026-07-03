/**
 * Registro de componentes DES — implementación en @dakinis/shared-ux / shared-layouts.
 */
export const DES_COMPONENTS = {
  button: { status: "ready", package: "@dakinis/shared-ux", export: "Button" },
  card: { status: "ready", package: "@dakinis/shared-ux", export: "DashboardCard" },
  dialog: { status: "ready", package: "@dakinis/shared-ux", export: "Dialog" },
  input: { status: "ready", package: "@dakinis/shared-ux", export: "Input" },
  table: { status: "ready", package: "@dakinis/shared-ux", export: "Table" },
  sidebar: { status: "ready", package: "@dakinis/shared-layouts", export: "AppShell" },
  hubShell: { status: "ready", package: "@dakinis/shared-layouts", export: "HubShell" },
  navigation: { status: "ready", package: "@dakinis/shared-ux", export: "hub-nav" },
  dashboard: { status: "ready", package: "@dakinis/shared-layouts", export: "DashboardTemplate" },
  hubDashboard: { status: "ready", package: "@dakinis/shared-layouts", export: "HubDashboardPage" },
  timeline: { status: "ready", package: "@dakinis/shared-ux", export: "react/ActivityTimeline.jsx" },
  notifications: { status: "ready", package: "@dakinis/shared-ux", export: "react/NotificationsCenter.jsx" },
  commandPalette: { status: "ready", package: "@dakinis/shared-ux", export: "react/CommandPalette.jsx" },
  emptyState: { status: "ready", package: "@dakinis/shared-ux", export: "react/EmptyState.jsx" },
};

export const DES_COMPONENT_CATEGORIES = ["actions", "data", "navigation", "feedback", "ai"];
