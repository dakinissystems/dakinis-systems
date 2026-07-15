/** Feature flag keys used across Dakinis products. */

export const WORKSPACE_FLAG_PREFIX = "workspace.addon.";

export const WORKSPACE_ADDON_FLAGS = {
  calendar: "workspace.addon.calendar",
  codeEditor: "workspace.addon.code-editor",
  terminal: "workspace.addon.terminal",
  kanban: "workspace.addon.kanban",
  notes: "workspace.addon.notes",
  devops: "workspace.addon.devops",
  monitor: "workspace.addon.monitor",
  dashboard: "workspace.addon.dashboard",
  mediaPlayer: "workspace.addon.media-player",
};

export const PLATFORM_FLAGS = {
  billingUnified: "billing.unified",
  hubBffCache: "hub.bff_cache",
  platformAi: "platform.ai",
  platformBilling: "platform.billing",
};

export const WORKSPACE_CAPABILITY_FLAGS = {
  media: "workspace.media",
  devops: "workspace.devops",
  stream: "workspace.stream",
};

export const PRODUCT_FLAGS = {
  coreRestaurant: "core.restaurant",
  coreWhatsapp: "core.whatsapp",
  streamDirector: "stream.director",
  streamAnalytics: "stream.analytics",
  streamAutomation: "stream.automation",
};

/** @type {string[]} */
export const DEFAULT_WORKSPACE_EVAL_KEYS = Object.values(WORKSPACE_ADDON_FLAGS);

/** @type {string[]} */
export const DEFAULT_PLATFORM_EVAL_KEYS = [
  ...Object.values(PLATFORM_FLAGS),
  ...Object.values(PRODUCT_FLAGS),
];
