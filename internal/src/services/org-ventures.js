import { query } from "../lib/db.js";

/**
 * List ventures (+ locations) for a workspace.
 * Soft-fails if migration 058 is not applied yet.
 * @param {string} workspaceId
 */
export async function listVenturesForWorkspace(workspaceId) {
  const ws = String(workspaceId || "").trim();
  if (!ws) return { items: [], domains: [] };

  try {
    const { rows: ventures } = await query(
      `SELECT v.id, v.workspace_id, v.name, v.slug, v.type, v.status,
              v.brand_domain, v.logo_url, v.settings, v.created_at
       FROM meta.ventures v
       WHERE v.workspace_id = $1::uuid AND v.status <> 'archived'
       ORDER BY v.name ASC`,
      [ws]
    );

    const { rows: locations } = await query(
      `SELECT l.id, l.venture_id, l.name, l.slug, l.status, l.city, l.country,
              l.timezone, l.core_business_slug, l.core_business_id
       FROM meta.venture_locations l
       JOIN meta.ventures v ON v.id = l.venture_id
       WHERE v.workspace_id = $1::uuid AND l.status <> 'archived'
       ORDER BY l.name ASC`,
      [ws]
    );

    const { rows: domains } = await query(
      `SELECT id, workspace_id, venture_id, domain, kind, primary_domain,
              mail_provider, email_aliases, dns_status, notes
       FROM meta.organization_domains
       WHERE workspace_id = $1::uuid
       ORDER BY kind ASC, domain ASC`,
      [ws]
    );

    const byVenture = new Map();
    for (const v of ventures) {
      byVenture.set(String(v.id), { ...v, locations: [] });
    }
    for (const loc of locations) {
      const key = String(loc.venture_id);
      const bucket = byVenture.get(key);
      if (bucket) bucket.locations.push(loc);
    }

    return {
      items: [...byVenture.values()],
      domains,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/ventures|organization_domains|does not exist/i.test(msg)) {
      return { items: [], domains: [], pendingMigration: "058" };
    }
    throw err;
  }
}

/**
 * Persist last Hub context for a user.
 * Requires active workspace membership; venture/location must belong to the workspace.
 * @param {string} userId
 * @param {string} workspaceId
 * @param {{ ventureId?: string|null; locationId?: string|null }} ctx
 */
export async function setUserOrgContext(userId, workspaceId, ctx = {}) {
  const uid = String(userId || "").trim();
  const ws = String(workspaceId || "").trim();
  if (!uid || !ws) {
    const err = new Error("user_and_workspace_required");
    err.status = 400;
    throw err;
  }

  const ventureId = ctx.ventureId ? String(ctx.ventureId).trim() : null;
  const locationId = ctx.locationId ? String(ctx.locationId).trim() : null;

  try {
    const { rows: memberRows } = await query(
      `SELECT 1
       FROM meta.workspace_members
       WHERE workspace_id = $1::uuid
         AND user_id = $2::uuid
         AND status = 'active'
       LIMIT 1`,
      [ws, uid]
    );
    if (!memberRows.length) {
      const err = new Error("not_a_workspace_member");
      err.status = 403;
      throw err;
    }

    if (ventureId) {
      const { rows: ventureRows } = await query(
        `SELECT 1 FROM meta.ventures
         WHERE id = $1::uuid AND workspace_id = $2::uuid
         LIMIT 1`,
        [ventureId, ws]
      );
      if (!ventureRows.length) {
        const err = new Error("venture_not_in_workspace");
        err.status = 400;
        throw err;
      }
    }

    if (locationId) {
      const { rows: locationRows } = await query(
        `SELECT 1
         FROM meta.venture_locations l
         JOIN meta.ventures v ON v.id = l.venture_id
         WHERE l.id = $1::uuid
           AND v.workspace_id = $2::uuid
           AND ($3::uuid IS NULL OR l.venture_id = $3::uuid)
         LIMIT 1`,
        [locationId, ws, ventureId]
      );
      if (!locationRows.length) {
        const err = new Error("location_not_in_workspace");
        err.status = 400;
        throw err;
      }
    }

    await query(
      `INSERT INTO meta.user_org_context (user_id, workspace_id, venture_id, location_id, updated_at)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, now())
       ON CONFLICT (user_id, workspace_id) DO UPDATE SET
         venture_id = EXCLUDED.venture_id,
         location_id = EXCLUDED.location_id,
         updated_at = now()`,
      [uid, ws, ventureId, locationId]
    );
    return { ok: true };
  } catch (err) {
    if (err?.status) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    if (/user_org_context|does not exist/i.test(msg)) {
      return { ok: false, pendingMigration: "058" };
    }
    throw err;
  }
}

/**
 * @param {string} userId
 * @param {string} workspaceId
 */
export async function getUserOrgContext(userId, workspaceId) {
  try {
    const { rows } = await query(
      `SELECT user_id, workspace_id, venture_id, location_id, updated_at
       FROM meta.user_org_context
       WHERE user_id = $1::uuid AND workspace_id = $2::uuid
       LIMIT 1`,
      [userId, workspaceId]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}
