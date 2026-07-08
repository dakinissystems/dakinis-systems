-- Verificar workspace y membresía para christiandvillar@gmail.com
-- Ejecutar en Supabase SQL Editor tras migración 031.

SELECT u.id AS user_id, u.email, u.role, u.is_super_admin, u.tenant_id
FROM dakinis_auth.users u
WHERE lower(u.email) = lower('christiandvillar@gmail.com');

SELECT w.id AS workspace_id, w.name, w.slug, w.plan, w.status, wm.role, wm.status AS member_status
FROM dakinis_auth.users u
LEFT JOIN meta.workspace_members wm ON wm.user_id = u.id
LEFT JOIN meta.workspaces w ON w.id = wm.workspace_id
WHERE lower(u.email) = lower('christiandvillar@gmail.com');

-- Si workspace_id es NULL, backfill manual desde core:
INSERT INTO meta.workspace_members (workspace_id, user_id, role, status, accepted_at)
SELECT w.id, u.id, 'owner', 'active', now()
FROM dakinis_auth.users u
JOIN core.tenant_memberships tm ON tm.user_id = u.id
JOIN core.tenants t ON t.id = tm.tenant_id
JOIN meta.workspaces w ON lower(w.core_tenant_slug) = lower(t.slug)
WHERE lower(u.email) = lower('christiandvillar@gmail.com')
ON CONFLICT (workspace_id, user_id) DO NOTHING;
