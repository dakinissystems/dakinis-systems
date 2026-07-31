/**
 * Map Hub workspace member role → core.tenant_memberships.role
 * @param {string} workspaceRole
 */
export function mapWorkspaceRoleToCoreRole(workspaceRole) {
  const role = String(workspaceRole || "member").toLowerCase().trim();
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  if (role === "viewer") return "viewer";
  return "member";
}

/**
 * After Hub invite accept: upsert core.tenant_memberships (+ optional IdP tenant_id).
 * No-op if workspace has no core_tenant_slug or tenant row is missing.
 *
 * @param {{ query: (text: string, params?: unknown[]) => Promise<{ rows: object[] }> }} db
 * @param {{ workspaceId: string; userId: string; role: string }} input
 * @returns {Promise<{ linked: boolean; tenantId?: string; tenantSlug?: string; role?: string; reason?: string }>}
 */
export async function ensureCoreTenantMembership(db, input) {
  const workspaceId = String(input.workspaceId || "").trim();
  const userId = String(input.userId || "").trim();
  const coreRole = mapWorkspaceRoleToCoreRole(input.role);
  if (!workspaceId || !userId) {
    return { linked: false, reason: "missing_ids" };
  }

  const { rows: wsRows } = await db.query(
    `SELECT id, core_tenant_slug, slug
     FROM meta.workspaces
     WHERE id = $1::uuid
     LIMIT 1`,
    [workspaceId]
  );
  const ws = wsRows[0];
  const tenantSlug = String(ws?.core_tenant_slug || ws?.slug || "")
    .trim()
    .toLowerCase();
  if (!tenantSlug) {
    return { linked: false, reason: "no_core_tenant_slug" };
  }

  const { rows: tenantRows } = await db.query(
    `SELECT id, slug FROM core.tenants WHERE lower(slug) = $1 LIMIT 1`,
    [tenantSlug]
  );
  const tenant = tenantRows[0];
  if (!tenant?.id) {
    return { linked: false, reason: "core_tenant_missing", tenantSlug };
  }

  await db.query(
    `INSERT INTO core.tenant_memberships (user_id, tenant_id, role)
     VALUES ($1::uuid, $2::uuid, $3)
     ON CONFLICT (user_id, tenant_id) DO UPDATE SET
       role = CASE
         WHEN core.tenant_memberships.role = 'owner' THEN 'owner'
         WHEN EXCLUDED.role = 'owner' THEN 'owner'
         WHEN core.tenant_memberships.role = 'admin' AND EXCLUDED.role <> 'owner' THEN 'admin'
         ELSE EXCLUDED.role
       END`,
    [userId, tenant.id, coreRole]
  );

  // IdP tenant claim used by Core SSO / Hub product access fallbacks — fill if empty.
  await db.query(
    `UPDATE dakinis_auth.users
     SET tenant_id = coalesce(nullif(trim(tenant_id), ''), $2),
         updated_at = now()
     WHERE id = $1::uuid`,
    [userId, tenant.slug]
  );

  return {
    linked: true,
    tenantId: String(tenant.id),
    tenantSlug: String(tenant.slug),
    role: coreRole,
  };
}
