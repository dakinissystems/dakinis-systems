/** Unified UI state vocabulary — pair with @dakinis/shared-platform/ui-states. */
export const PLATFORM_UI_STATES = Object.freeze([
  "loading",
  "empty",
  "error",
  "success",
  "warning",
  "offline",
  "permission_denied",
  "not_found",
]);

export const UI_STATE_COMPONENTS = Object.freeze({
  EmptyState: "@dakinis/shared-ux/react/EmptyState.jsx",
  LoadingState: "@dakinis/shared-loading",
  ErrorState: "@dakinis/shared-illustrations",
  PermissionState: "planned",
  OfflineState: "planned",
});
