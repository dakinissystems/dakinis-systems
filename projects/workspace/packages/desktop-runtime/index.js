/**
 * @dakinis/desktop-runtime — client layout sync with meta.workspace_desktop_profiles
 *
 * Implemented in AkoeNet Client:
 *   apps/akoenet/Client/src/workspace/desktopRuntime/
 *
 * API (via akoenet-backend → Internal API):
 *   GET  /workspace/desktop/profiles
 *   GET  /workspace/desktop/layout/:addonId?profileKey=
 *   PUT  /workspace/desktop/layout/:addonId  { profileKey?, windows[] }
 *
 * Internal routes:
 *   GET  /internal/workspaces/me/:userId/desktop/profiles
 *   GET  /internal/workspaces/me/:userId/desktop/layout/:addonId
 *   PUT  /internal/workspaces/me/:userId/desktop/layout/:addonId
 *
 * Window rects stored at: profile.windowState.addons[addonId].windows
 * Preset opens (no rects) merged via layoutMerge.js
 */

export const DESKTOP_RUNTIME_VERSION = "0.1.0";
