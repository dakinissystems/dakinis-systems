import { query } from "../lib/db.js";
import { randomBytes } from "node:crypto";

const MEMBER_ROLES = new Set(["owner", "admin", "member", "viewer"]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeUuid(value) {
  const s = String(value || "").trim();
  return UUID_RE.test(s) ? s : null;
}

/**
 * @param {string} email
 */
async function resolveAuthUserIdByEmail(email) {
  const norm = String(email || "").trim().toLowerCase();
  if (!norm) return null;
  const { rows } = await query(
    `SELECT id FROM dakinis_auth.users WHERE lower(trim(email)) = $1 LIMIT 1`,
    [norm],
  );
  return rows[0]?.id ? String(rows[0].id) : null;
}

/**
 * @param {string} userId
 * @param {{ email?: string }} [opts]
 */
export async function getWorkspaceForUser(userId, opts = {}) {
  let uid = normalizeUuid(userId);
  if (!uid && opts.email) {
    uid = await resolveAuthUserIdByEmail(opts.email);
  }
  if (!uid) return null;

  try {
    const { rows } = await query(
      `SELECT w.id, w.name, w.slug, w.core_tenant_slug, w.owner_id, w.plan, w.status,
              w.trial_ends_at, w.logo_url, w.settings, w.created_at, w.updated_at,
              wm.role AS member_role, wm.status AS member_status
       FROM meta.workspace_members wm
       JOIN meta.workspaces w ON w.id = wm.workspace_id
       WHERE wm.user_id = $1::uuid AND wm.status = 'active'
       ORDER BY wm.last_accessed_at DESC NULLS LAST, wm.created_at DESC
       LIMIT 1`,
      [uid]
    );
    if (rows[0]) {
      return {
        ...rows[0],
        isAdmin: ["owner", "admin"].includes(rows[0].member_role),
      };
    }
  } catch {
    /* meta schema may be pending */
  }

  const { rows: coreRows } = await query(
    `SELECT t.id AS core_tenant_id, t.slug, t.name, t.plan, tm.role
     FROM core.tenant_memberships tm
     JOIN core.tenants t ON t.id = tm.tenant_id
     WHERE tm.user_id = $1::uuid
     ORDER BY tm.created_at ASC
     LIMIT 1`,
    [uid]
  );
  const core = coreRows[0];
  if (core) {
    return {
      id: null,
      name: core.name,
      slug: core.slug,
      core_tenant_slug: core.slug,
      plan: core.plan === "free" ? "starter" : core.plan,
      status: "active",
      member_role: core.role || "admin",
      member_status: "active",
      isAdmin: ["owner", "admin", "platform_admin"].includes(String(core.role || "").toLowerCase()),
      legacyCoreOnly: true,
    };
  }

  // Post-031: super admin / tenant_id en IdP sin core.tenant_memberships
  const { rows: authRows } = await query(
    `SELECT u.tenant_id, u.is_super_admin, u.role,
            w.id, w.name, w.slug, w.core_tenant_slug, w.owner_id, w.plan, w.status,
            w.trial_ends_at, w.logo_url, w.settings, w.created_at, w.updated_at,
            wm.role AS member_role, wm.status AS member_status
     FROM dakinis_auth.users u
     LEFT JOIN meta.workspaces w
       ON lower(coalesce(w.core_tenant_slug, w.slug))
        = lower(coalesce(nullif(trim(u.tenant_id), ''), 'dakinis-platform'))
     LEFT JOIN meta.workspace_members wm
       ON wm.workspace_id = w.id AND wm.user_id = u.id AND wm.status = 'active'
     WHERE u.id = $1::uuid
     LIMIT 1`,
    [uid]
  );
  const auth = authRows[0];
  if (!auth) return null;

  const isPlatformAdmin =
    auth.is_super_admin || String(auth.role || "").toLowerCase() === "platform_admin";

  if (auth.id) {
    const role = auth.member_role || (isPlatformAdmin ? "owner" : "member");
    return {
      ...auth,
      member_role: role,
      member_status: auth.member_status || "active",
      isAdmin: ["owner", "admin"].includes(role) || isPlatformAdmin,
      legacyCoreOnly: !auth.member_role,
    };
  }

  if (isPlatformAdmin || auth.tenant_id) {
    const slug = String(auth.tenant_id || "dakinis-platform").trim() || "dakinis-platform";
    return {
      id: null,
      name: "Dakinis Plataforma",
      slug,
      core_tenant_slug: slug,
      plan: "starter",
      status: "active",
      member_role: isPlatformAdmin ? "owner" : "member",
      member_status: "active",
      isAdmin: isPlatformAdmin,
      legacyCoreOnly: true,
    };
  }

  return null;
}

/**
 * @param {string} workspaceId
 * @param {{ name?: string, logo_url?: string, settings?: object }} patch
 * @param {string} [actorId]
 */
export async function updateWorkspace(workspaceId, patch, actorId) {
  const fields = [];
  const params = [workspaceId];
  if (patch.name) {
    params.push(String(patch.name).trim());
    fields.push(`name = $${params.length}`);
  }
  if (patch.logo_url !== undefined) {
    params.push(patch.logo_url);
    fields.push(`logo_url = $${params.length}`);
  }
  if (patch.settings) {
    params.push(JSON.stringify(patch.settings));
    fields.push(`settings = settings || $${params.length}::jsonb`);
  }
  if (!fields.length) throw new Error("nothing_to_update");

  const { rows } = await query(
    `UPDATE meta.workspaces SET ${fields.join(", ")}, updated_at = now()
     WHERE id = $1::uuid
     RETURNING id, name, slug, plan, status, logo_url, settings`,
    params
  );
  if (!rows[0]) throw new Error("workspace_not_found");

  await query(
    `SELECT meta.log_audit($1::uuid, 'workspace.updated', 'workspace', $2, $3::jsonb, '{}'::jsonb, $2::uuid, 'internal-api')`,
    [actorId || null, workspaceId, JSON.stringify(patch)]
  ).catch(() => {});

  return rows[0];
}

/**
 * @param {string} workspaceId
 * @param {string} userId
 * @param {string} [actorId]
 */
export async function removeWorkspaceMember(workspaceId, userId, actorId) {
  const { rows } = await query(
    `DELETE FROM meta.workspace_members
     WHERE workspace_id = $1::uuid AND user_id = $2::uuid
     RETURNING id, user_id, role`,
    [workspaceId, userId]
  );
  if (!rows[0]) throw new Error("member_not_found");

  await query(
    `SELECT meta.log_audit($1::uuid, 'workspace.member.removed', 'workspace_member', $2,
      jsonb_build_object('user_id', $3), '{}'::jsonb, $4::uuid, 'internal-api')`,
    [actorId || null, rows[0].id, userId, workspaceId]
  ).catch(() => {});

  return { ok: true };
}

/**
 * @param {string} workspaceId
 */
export async function touchWorkspaceAccess(workspaceId, userId) {
  await query(
    `UPDATE meta.workspace_members
     SET last_accessed_at = now(), updated_at = now()
     WHERE workspace_id = $1::uuid AND user_id = $2::uuid`,
    [workspaceId, userId]
  ).catch(() => {});
}

/**
 * @param {string} workspaceId
 */
export async function getWorkspace(workspaceId) {
  const { rows } = await query(
    `SELECT id, name, slug, core_tenant_slug, owner_id, plan, status,
            trial_ends_at, logo_url, settings, created_at, updated_at
     FROM meta.workspaces
     WHERE id = $1::uuid
     LIMIT 1`,
    [workspaceId]
  );
  return rows[0] ?? null;
}

/**
 * @param {string} workspaceId
 */
export async function listWorkspaceMembers(workspaceId) {
  const { rows } = await query(
    `SELECT wm.id, wm.user_id, wm.role, wm.status, wm.invited_at, wm.accepted_at,
            wm.last_accessed_at, u.email
     FROM meta.workspace_members wm
     LEFT JOIN dakinis_auth.users u ON u.id = wm.user_id
     WHERE wm.workspace_id = $1::uuid
     ORDER BY wm.created_at ASC`,
    [workspaceId]
  );
  return rows;
}

/**
 * @param {string} workspaceId
 */
export async function listWorkspaceProducts(workspaceId) {
  const { rows } = await query(
    `SELECT product_slug, enabled, activated_at, settings
     FROM meta.workspace_products
     WHERE workspace_id = $1::uuid
     ORDER BY product_slug`,
    [workspaceId]
  );
  return rows;
}

/**
 * @param {string} workspaceId
 * @param {{ email: string, role?: string, invitedBy?: string }} input
 */
export async function inviteWorkspaceMember(workspaceId, input) {
  const email = String(input.email || "").trim().toLowerCase();
  if (!email) throw new Error("email_required");
  const role = MEMBER_ROLES.has(input.role) ? input.role : "member";
  const token = randomBytes(24).toString("hex");

  const { rows } = await query(
    `INSERT INTO meta.workspace_invites (workspace_id, email, role, token, invited_by)
     VALUES ($1::uuid, $2, $3, $4, $5::uuid)
     ON CONFLICT DO NOTHING
     RETURNING id, email, role, token, expires_at, created_at`,
    [workspaceId, email, role, token, input.invitedBy || null]
  );

  if (!rows[0]) {
    const existing = await query(
      `SELECT id, email, role, token, expires_at, created_at
       FROM meta.workspace_invites
       WHERE workspace_id = $1::uuid AND lower(email) = $2 AND used_at IS NULL
       LIMIT 1`,
      [workspaceId, email]
    );
    return { invite: existing.rows[0] ?? null, created: false };
  }

  await query(
    `SELECT meta.log_audit($1::uuid, 'workspace.member.invited', 'workspace_invite', $2,
      jsonb_build_object('email', $3, 'role', $4), '{}'::jsonb, $5::uuid, 'internal-api')`,
    [input.invitedBy || null, rows[0].id, email, role, workspaceId]
  ).catch(() => {});

  return { invite: rows[0], created: true };
}

import { acceptInviteViaFacade } from "../facades/invite-facade.js";
import { buildInternalContext } from "../platform/context.js";

/**
 * Accept a pending workspace invite by token for the authenticated IdP user.
 * @param {string} token
 * @param {{ userId: string; traceId?: string }} input
 */
export async function acceptWorkspaceInvite(token, input) {
  const inviteToken = String(token || "").trim();
  if (!inviteToken) throw new Error("token_required");

  const userId = normalizeUuid(input.userId);
  if (!userId) throw new Error("user_id_required");

  const ctx = buildInternalContext({
    userId,
    traceId: input.traceId,
  });

  return acceptInviteViaFacade(inviteToken, { userId, ctx });
}

/**
 * @param {string} workspaceId
 * @param {string} userId
 * @param {string} role
 * @param {string} [actorId]
 */
export async function updateMemberRole(workspaceId, userId, role, actorId) {
  if (!MEMBER_ROLES.has(role)) throw new Error("invalid_role");
  const { rows } = await query(
    `UPDATE meta.workspace_members
     SET role = $3, updated_at = now()
     WHERE workspace_id = $1::uuid AND user_id = $2::uuid
     RETURNING id, user_id, role, status`,
    [workspaceId, userId, role]
  );
  if (!rows[0]) throw new Error("member_not_found");

  await query(
    `SELECT meta.log_audit($1::uuid, 'workspace.member.role_updated', 'workspace_member', $2,
      jsonb_build_object('role', $3), '{}'::jsonb, $4::uuid, 'internal-api')`,
    [actorId || null, rows[0].id, role, workspaceId]
  ).catch(() => {});

  return rows[0];
}

/**
 * @param {string} workspaceId
 */
export async function getWorkspaceUsage(workspaceId) {
  const [members, products, aiUsage] = await Promise.all([
    query(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE status = 'active')::int AS active,
              count(*) FILTER (WHERE last_accessed_at > now() - interval '7 days')::int AS active_7d
       FROM meta.workspace_members WHERE workspace_id = $1::uuid`,
      [workspaceId]
    ),
    query(
      `SELECT count(*)::int AS enabled
       FROM meta.workspace_products
       WHERE workspace_id = $1::uuid AND enabled = true`,
      [workspaceId]
    ),
    query(
      `SELECT coalesce(sum(cost_cents), 0)::int AS cost_cents_30d,
              coalesce(sum(tokens_input + tokens_output), 0)::int AS tokens_30d
       FROM meta.ai_usage
       WHERE workspace_id = $1::uuid AND created_at > now() - interval '30 days'`,
      [workspaceId]
    ),
  ]);

  return {
    members: members.rows[0] ?? { total: 0, active: 0, active_7d: 0 },
    productsEnabled: products.rows[0]?.enabled ?? 0,
    ai: aiUsage.rows[0] ?? { cost_cents_30d: 0, tokens_30d: 0 },
  };
}

/**
 * @param {string} workspaceId
 * @param {string[]} products
 */
export async function setWorkspaceProducts(workspaceId, products) {
  const normalized = [...new Set(products.map((p) => String(p).toLowerCase()))];
  await query(
    `UPDATE meta.workspace_products SET enabled = false, deactivated_at = now()
     WHERE workspace_id = $1::uuid AND product_slug <> ALL($2::text[])`,
    [workspaceId, normalized]
  );
  for (const slug of normalized) {
    await query(
      `INSERT INTO meta.workspace_products (workspace_id, product_slug, enabled, activated_at)
       VALUES ($1::uuid, $2, true, now())
       ON CONFLICT (workspace_id, product_slug) DO UPDATE SET
         enabled = true, activated_at = coalesce(meta.workspace_products.activated_at, now()),
         deactivated_at = NULL`,
      [workspaceId, slug]
    );
  }
  return listWorkspaceProducts(workspaceId);
}
