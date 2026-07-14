import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { query } from "../lib/db.js";
import { getWorkspaceForUser } from "./workspace-admin.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {{ addons: object[] } | null} */
let staticCatalog = null;

function loadStaticCatalog() {
  if (staticCatalog) return staticCatalog;
  const candidates = [
    join(__dirname, "../../../packages/shared-brand/src/workspace-addons.json"),
    join(__dirname, "../../../projects/workspace/catalog/workspace-addons.json"),
  ];
  for (const p of candidates) {
    try {
      staticCatalog = JSON.parse(readFileSync(p, "utf8"));
      return staticCatalog;
    } catch {
      /* try next */
    }
  }
  staticCatalog = { addons: [] };
  return staticCatalog;
}

function rowToAddon(row) {
  const i18n =
    row.i18n && typeof row.i18n === "object"
      ? row.i18n
      : {
          name: { en: row.name, es: row.name },
          description: { en: row.description || "", es: row.description || "" },
        };
  return {
    id: row.key,
    key: row.key,
    name: row.name,
    description: row.description,
    category: row.category,
    phase: row.phase,
    icon: row.icon,
    sortOrder: row.sort_order,
    permissions: row.permissions || [],
    windows: row.windows || [],
    builtin: Boolean(row.builtin),
    i18n,
  };
}

function staticToAddon(def) {
  return {
    id: def.id,
    key: def.id,
    name: def.i18n?.name?.en || def.id,
    description: def.i18n?.description?.en || "",
    category: def.category,
    phase: def.phase,
    icon: def.icon,
    sortOrder: def.sortOrder ?? 999,
    permissions: def.permissions || [],
    windows: def.windows || [],
    builtin: Boolean(def.builtin),
    i18n: def.i18n,
  };
}

export async function listAddonCatalog() {
  try {
    const { rows } = await query(
      `SELECT key, name, description, category, phase, icon, sort_order, permissions, windows, builtin, i18n
       FROM meta.workspace_addons
       ORDER BY sort_order ASC, key ASC`
    );
    if (rows.length) return rows.map(rowToAddon);
  } catch {
    /* schema pending */
  }
  const cat = loadStaticCatalog();
  return (cat.addons || []).map(staticToAddon).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * @param {string} workspaceId
 */
export async function listWorkspaceAddons(workspaceId) {
  const catalog = await listAddonCatalog();
  /** @type {Map<string, object>} */
  const installs = new Map();
  try {
    const { rows } = await query(
      `SELECT addon_key, enabled, pinned, config, installed_at, updated_at
       FROM meta.workspace_addon_installs
       WHERE workspace_id = $1::uuid`,
      [workspaceId]
    );
    for (const r of rows) {
      installs.set(r.addon_key, r);
    }
  } catch {
    /* no installs table yet */
  }

  return catalog.map((addon) => {
    const inst = installs.get(addon.key);
    return {
      ...addon,
      enabled: inst ? Boolean(inst.enabled) : addon.builtin === true,
      pinned: inst ? Boolean(inst.pinned) : false,
      config: inst?.config || {},
      installedAt: inst?.installed_at || null,
    };
  });
}

/**
 * @param {string} workspaceId
 * @param {string} addonKey
 * @param {{ enabled?: boolean; pinned?: boolean; config?: object }} input
 */
export async function upsertWorkspaceAddon(workspaceId, addonKey, input) {
  const enabled = input.enabled !== false;
  const pinned = Boolean(input.pinned);
  const config = input.config && typeof input.config === "object" ? input.config : {};

  const { rows } = await query(
    `INSERT INTO meta.workspace_addon_installs (workspace_id, addon_key, enabled, pinned, config)
     VALUES ($1::uuid, $2, $3, $4, $5::jsonb)
     ON CONFLICT (workspace_id, addon_key) DO UPDATE SET
       enabled = EXCLUDED.enabled,
       pinned = EXCLUDED.pinned,
       config = EXCLUDED.config,
       updated_at = now()
     RETURNING addon_key, enabled, pinned, config, installed_at, updated_at`,
    [workspaceId, addonKey, enabled, pinned, JSON.stringify(config)]
  );
  return rows[0];
}

/**
 * @param {string} userId
 * @param {{ isPlatformAdmin?: boolean }} [opts]
 */
/**
 * Enable every catalog addon for a workspace (platform admin provisioning).
 * @param {string} workspaceId
 * @param {{ pinKeys?: string[] }} [opts]
 */
export async function enableAllWorkspaceAddons(workspaceId, opts = {}) {
  const pin = new Set(opts.pinKeys || [
    "command-palette",
    "activity-center",
    "dashboard",
    "ai-workspace",
    "media-player",
  ]);
  const catalog = await listAddonCatalog();
  /** @type {object[]} */
  const rows = [];
  for (const addon of catalog) {
    const row = await upsertWorkspaceAddon(workspaceId, addon.key, {
      enabled: true,
      pinned: pin.has(addon.key),
      config: {},
    });
    rows.push(row);
  }
  return rows;
}

export async function listWorkspaceAddonsForUser(userId, opts = {}) {
  try {
    const { rows } = await query(
      `SELECT w.id
       FROM meta.workspace_members wm
       JOIN meta.workspaces w ON w.id = wm.workspace_id
       WHERE wm.user_id = $1::uuid AND wm.status = 'active'
       ORDER BY wm.last_accessed_at DESC NULLS LAST
       LIMIT 1`,
      [userId]
    );
    if (rows[0]?.id) {
      const items = await listWorkspaceAddons(rows[0].id);
      return { workspaceId: rows[0].id, items };
    }
  } catch {
    /* meta pending */
  }

  if (opts.isPlatformAdmin) {
    const catalog = await listAddonCatalog();
    return {
      workspaceId: null,
      items: catalog.map((a) => ({ ...a, enabled: true, pinned: a.builtin === true, config: {} })),
    };
  }

  const catalog = await listAddonCatalog();
  return {
    workspaceId: null,
    items: catalog.map((a) => ({
      ...a,
      enabled: a.phase === "mvp" || a.builtin,
      pinned: a.builtin === true,
      config: {},
    })),
  };
}

/**
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
 * @param {string} userId platform UUID
 * @param {string} addonKey
 * @param {{ enabled?: boolean; pinned?: boolean; config?: object; email?: string }} input
 */
export async function setAddonForPlatformUser(userId, addonKey, input = {}) {
  const workspace = await getWorkspaceForUser(userId, { email: input.email });
  const workspaceId = await ensureWorkspaceId(workspace);
  if (!workspaceId) {
    return { stored: false, reason: "no_workspace" };
  }
  const row = await upsertWorkspaceAddon(workspaceId, addonKey, {
    enabled: input.enabled !== false,
    pinned: Boolean(input.pinned),
    config: input.config,
  });
  return { stored: true, workspaceId, addonKey, row };
}
