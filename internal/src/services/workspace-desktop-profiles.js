import { query } from "../lib/db.js";
import { getWorkspaceForUser } from "./workspace-admin.js";

function rowToProfile(row) {
  return {
    profileKey: row.profile_key,
    name: row.name,
    baseLayout: row.base_layout,
    windowState: row.window_state || {},
    dockPins: row.dock_pins || [],
    widgetGrid: row.widget_grid || {},
    isDefault: Boolean(row.is_default),
    updatedAt: row.updated_at,
  };
}

/**
 * @param {string} workspaceId
 */
export async function listDesktopProfiles(workspaceId) {
  const { rows } = await query(
    `SELECT profile_key, name, base_layout, window_state, dock_pins, widget_grid, is_default, updated_at
     FROM meta.workspace_desktop_profiles
     WHERE workspace_id = $1::uuid
     ORDER BY is_default DESC, profile_key ASC`,
    [workspaceId],
  );
  return rows.map(rowToProfile);
}

/**
 * @param {string} workspaceId
 * @param {string} profileKey
 */
export async function getDesktopProfile(workspaceId, profileKey) {
  const { rows } = await query(
    `SELECT profile_key, name, base_layout, window_state, dock_pins, widget_grid, is_default, updated_at
     FROM meta.workspace_desktop_profiles
     WHERE workspace_id = $1::uuid AND profile_key = $2
     LIMIT 1`,
    [workspaceId, profileKey],
  );
  return rows[0] ? rowToProfile(rows[0]) : null;
}

/**
 * @param {string} workspaceId
 * @param {string} [preferredKey]
 */
export async function resolveDesktopProfileKey(workspaceId, preferredKey) {
  if (preferredKey) {
    const hit = await getDesktopProfile(workspaceId, preferredKey);
    if (hit) return preferredKey;
  }
  const { rows } = await query(
    `SELECT profile_key FROM meta.workspace_desktop_profiles
     WHERE workspace_id = $1::uuid AND is_default = true
     LIMIT 1`,
    [workspaceId],
  );
  if (rows[0]?.profile_key) return rows[0].profile_key;
  const { rows: anyRow } = await query(
    `SELECT profile_key FROM meta.workspace_desktop_profiles
     WHERE workspace_id = $1::uuid
     ORDER BY profile_key ASC LIMIT 1`,
    [workspaceId],
  );
  return anyRow[0]?.profile_key || null;
}

/**
 * @param {string} userId
 */
export async function listDesktopProfilesForUser(userId) {
  const workspace = await getWorkspaceForUser(userId);
  if (!workspace?.id) {
    return { workspaceId: null, items: [] };
  }
  const items = await listDesktopProfiles(workspace.id);
  return { workspaceId: workspace.id, items };
}

/**
 * @param {string} userId
 * @param {string} addonId
 * @param {{ profileKey?: string }} [opts]
 */
export async function getAddonLayoutForUser(userId, addonId, opts = {}) {
  const workspace = await getWorkspaceForUser(userId);
  if (!workspace?.id) {
    return { workspaceId: null, profileKey: null, windows: null, profile: null };
  }

  const profileKey = await resolveDesktopProfileKey(workspace.id, opts.profileKey);
  if (!profileKey) {
    return { workspaceId: workspace.id, profileKey: null, windows: null, profile: null };
  }

  const profile = await getDesktopProfile(workspace.id, profileKey);
  const windows = profile?.windowState?.addons?.[addonId]?.windows ?? null;

  return {
    workspaceId: workspace.id,
    profileKey,
    windows,
    profile,
  };
}

/**
 * @param {string} userId
 * @param {string} addonId
 * @param {{ profileKey?: string; windows: unknown[] }} input
 */
export async function saveAddonLayoutForUser(userId, addonId, input) {
  const workspace = await getWorkspaceForUser(userId);
  if (!workspace?.id) {
    return { stored: false, reason: "no_workspace" };
  }

  const profileKey = await resolveDesktopProfileKey(workspace.id, input.profileKey);
  if (!profileKey) {
    return { stored: false, reason: "no_profile" };
  }

  const profile = await getDesktopProfile(workspace.id, profileKey);
  const prevState =
    profile?.windowState && typeof profile.windowState === "object" ? profile.windowState : {};
  const prevAddons =
    prevState.addons && typeof prevState.addons === "object" ? prevState.addons : {};

  const nextState = {
    ...prevState,
    addons: {
      ...prevAddons,
      [addonId]: {
        windows: input.windows,
        updatedAt: new Date().toISOString(),
      },
    },
  };

  await query(
    `UPDATE meta.workspace_desktop_profiles
     SET window_state = $1::jsonb, updated_at = now()
     WHERE workspace_id = $2::uuid AND profile_key = $3`,
    [JSON.stringify(nextState), workspace.id, profileKey],
  );

  return { stored: true, workspaceId: workspace.id, profileKey, addonId };
}
