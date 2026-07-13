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
 * meta.workspaces.id — algunos fallbacks de getWorkspaceForUser devuelven slug sin id.
 * @param {object|null|undefined} workspace
 */
async function ensureWorkspaceId(workspace) {
  if (!workspace) return null;
  if (workspace.id) return String(workspace.id);
  const slug = String(workspace.core_tenant_slug || workspace.slug || "").trim();
  if (!slug) return null;
  const { rows } = await query(
    `SELECT id FROM meta.workspaces
     WHERE lower(slug) = lower($1) OR lower(core_tenant_slug) = lower($1)
     LIMIT 1`,
    [slug],
  );
  return rows[0]?.id ? String(rows[0].id) : null;
}

/**
 * @param {string} userId
 * @param {{ email?: string }} [opts]
 */
export async function listDesktopProfilesForUser(userId, opts = {}) {
  const workspace = await getWorkspaceForUser(userId, opts);
  const workspaceId = await ensureWorkspaceId(workspace);
  if (!workspaceId) {
    return { workspaceId: null, items: [] };
  }
  const items = await listDesktopProfiles(workspaceId);
  return { workspaceId, items };
}

/**
 * @param {string} userId
 * @param {string} addonId
 * @param {{ profileKey?: string; email?: string }} [opts]
 */
export async function getAddonLayoutForUser(userId, addonId, opts = {}) {
  const workspace = await getWorkspaceForUser(userId, opts);
  const workspaceId = await ensureWorkspaceId(workspace);
  if (!workspaceId) {
    return { workspaceId: null, profileKey: null, windows: null, profile: null };
  }

  const profileKey = await resolveDesktopProfileKey(workspaceId, opts.profileKey);
  if (!profileKey) {
    return { workspaceId, profileKey: null, windows: null, profile: null };
  }

  const profile = await getDesktopProfile(workspaceId, profileKey);
  const windows = profile?.windowState?.addons?.[addonId]?.windows ?? null;

  return {
    workspaceId,
    profileKey,
    windows,
    profile,
  };
}

/**
 * @param {string} userId
 * @param {string} addonId
 * @param {{ profileKey?: string; windows: unknown[]; email?: string }} input
 */
export async function saveAddonLayoutForUser(userId, addonId, input) {
  const workspace = await getWorkspaceForUser(userId, { email: input.email });
  const workspaceId = await ensureWorkspaceId(workspace);
  if (!workspaceId) {
    return { stored: false, reason: "no_workspace" };
  }

  const profileKey = await resolveDesktopProfileKey(workspaceId, input.profileKey);
  if (!profileKey) {
    return { stored: false, reason: "no_profile" };
  }

  const profile = await getDesktopProfile(workspaceId, profileKey);
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
    [JSON.stringify(nextState), workspaceId, profileKey],
  );

  return { stored: true, workspaceId, profileKey, addonId };
}
