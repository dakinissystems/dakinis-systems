/**
 * Platform UI vs Product UI — keep product-specific widgets out of DES core.
 */
export const DES_PLATFORM_UI = Object.freeze([
  "Button",
  "Modal",
  "Dialog",
  "Dropdown",
  "CommandPalette",
  "Sidebar",
  "TopBar",
  "Toast",
  "DataTable",
  "Form",
  "DatePicker",
  "EmptyState",
  "ErrorState",
  "LoadingState",
  "PermissionState",
  "OfflineState",
]);

export const DES_PRODUCT_UI = Object.freeze({
  core: ["InventoryTable", "RestaurantTable", "KitchenBoard", "CRMContactCard"],
  streamautomator: ["StreamTimeline", "DirectorPanel"],
  akoenet: ["DiscordChannel", "ChatMessageList"],
  hub: ["HubAttentionPanel", "HubWidgetGrid", "ActivityTimeline"],
});
