import { query } from "../lib/db.js";
import { invalidateUserBffCache } from "../lib/cache.js";
import { AppError } from "@dakinis/shared-error";
import { OutboxPublisher } from "@dakinis/shared-db/outbox";
import { getWorkspaceForUser } from "./workspace-admin.js";

const ALLOWED_KEYS = new Set(["kanban", "calendar", "notes", "code-editor"]);
const outbox = new OutboxPublisher(query);

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
 * @param {string} addonKey
 */
export function isAllowedAddonDataKey(addonKey) {
  return ALLOWED_KEYS.has(String(addonKey || "").trim());
}

/**
 * @param {string} userId
 * @param {string} addonKey
 * @param {{ email?: string }} [opts]
 */
export async function getAddonDataForUser(userId, addonKey, opts = {}) {
  if (!isAllowedAddonDataKey(addonKey)) {
    return {
      workspaceId: null,
      addonKey,
      data: null,
      updatedAt: null,
      revision: null,
      error: "invalid_addon_key",
    };
  }

  const workspace = await getWorkspaceForUser(userId, opts);
  const workspaceId = await ensureWorkspaceId(workspace);
  if (!workspaceId) {
    return { workspaceId: null, addonKey, data: null, updatedAt: null, revision: null };
  }

  const { rows } = await query(
    `SELECT data, updated_at, revision FROM meta.workspace_addon_data
     WHERE workspace_id = $1::uuid AND addon_key = $2
     LIMIT 1`,
    [workspaceId, addonKey],
  );

  return {
    workspaceId,
    addonKey,
    data: rows[0]?.data ?? null,
    updatedAt: rows[0]?.updated_at ?? null,
    revision: rows[0]?.revision != null ? Number(rows[0].revision) : null,
  };
}

/**
 * @param {string} userId
 * @param {string} addonKey
 * @param {{ data: object; email?: string; revision?: number }} input
 */
export async function saveAddonDataForUser(userId, addonKey, input) {
  if (!isAllowedAddonDataKey(addonKey)) {
    return { stored: false, reason: "invalid_addon_key" };
  }
  if (!input?.data || typeof input.data !== "object") {
    return { stored: false, reason: "data_required" };
  }

  const workspace = await getWorkspaceForUser(userId, { email: input.email });
  const workspaceId = await ensureWorkspaceId(workspace);
  if (!workspaceId) {
    return { stored: false, reason: "no_workspace" };
  }

  const expectedRevision =
    input.revision != null && Number.isFinite(Number(input.revision))
      ? Number(input.revision)
      : null;

  if (expectedRevision != null) {
    const { rows: current } = await query(
      `SELECT revision FROM meta.workspace_addon_data
       WHERE workspace_id = $1::uuid AND addon_key = $2
       LIMIT 1`,
      [workspaceId, addonKey],
    );
    const actual = current[0] ? Number(current[0].revision) : 0;
    if (actual !== expectedRevision) {
      throw new AppError("conflict", "revision_conflict", {
        statusCode: 409,
        details: { expectedRevision, actualRevision: actual },
      });
    }
  }

  const { rows } = await query(
    `INSERT INTO meta.workspace_addon_data (workspace_id, addon_key, data, revision, updated_at)
     VALUES ($1::uuid, $2, $3::jsonb, 1, now())
     ON CONFLICT (workspace_id, addon_key)
     DO UPDATE SET
       data = EXCLUDED.data,
       revision = meta.workspace_addon_data.revision + 1,
       updated_at = now()
     RETURNING updated_at, revision`,
    [workspaceId, addonKey, JSON.stringify(input.data)],
  );

  const revision = rows[0]?.revision != null ? Number(rows[0].revision) : null;

  await outbox
    .publish({
      aggregateType: "workspace_addon_data",
      aggregateId: `${workspaceId}:${addonKey}`,
      eventType: "workspace.addon_data.saved",
      payload: { workspaceId, addonKey, revision },
    })
    .catch(() => {});

  await invalidateUserBffCache(userId).catch(() => {});

  return {
    stored: true,
    workspaceId,
    addonKey,
    updatedAt: rows[0]?.updated_at ?? new Date().toISOString(),
    revision,
  };
}
