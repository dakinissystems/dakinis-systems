-- Provisioning completo workspace Hub — christiandvillar@gmail.com
-- Ejecutar en Supabase SQL Editor DESPUÉS de migración 031.
-- Idempotente: se puede re-ejecutar sin duplicar filas.

-- 1. Super admin IdP
UPDATE dakinis_auth.users
SET
  is_super_admin = true,
  role = 'platform_admin',
  tenant_id = coalesce(nullif(trim(tenant_id), ''), 'dakinis-platform')
WHERE lower(email) = lower('christiandvillar@gmail.com');

-- 2. Tenant Core (requerido para backfill y ERP)
INSERT INTO core.tenants (slug, name, plan)
VALUES ('dakinis-platform', 'Dakinis Plataforma', 'platform')
ON CONFLICT (slug) DO NOTHING;

-- 3. Membresía Core (031 solo backfill desde aquí — sin fila = sin workspace)
INSERT INTO core.tenant_memberships (user_id, tenant_id, role)
SELECT u.id, t.id, 'owner'
FROM dakinis_auth.users u
CROSS JOIN core.tenants t
WHERE lower(u.email) = lower('christiandvillar@gmail.com')
  AND lower(t.slug) = 'dakinis-platform'
ON CONFLICT (user_id, tenant_id) DO UPDATE SET role = 'owner';

-- 4. Workspace Hub
INSERT INTO meta.workspaces (name, slug, core_tenant_slug, owner_id, plan, status)
SELECT 'Dakinis Plataforma', 'dakinis-platform', 'dakinis-platform', u.id, 'enterprise', 'active'
FROM dakinis_auth.users u
WHERE lower(u.email) = lower('christiandvillar@gmail.com')
ON CONFLICT (slug) DO UPDATE SET
  owner_id = EXCLUDED.owner_id,
  plan = 'enterprise',
  status = 'active',
  updated_at = now();

-- 5. Miembro owner del workspace
INSERT INTO meta.workspace_members (workspace_id, user_id, role, status, accepted_at)
SELECT w.id, u.id, 'owner', 'active', now()
FROM dakinis_auth.users u
JOIN meta.workspaces w ON lower(w.slug) = 'dakinis-platform'
WHERE lower(u.email) = lower('christiandvillar@gmail.com')
ON CONFLICT (workspace_id, user_id) DO UPDATE SET
  role = 'owner',
  status = 'active',
  accepted_at = coalesce(meta.workspace_members.accepted_at, now()),
  updated_at = now();

-- 6. Productos del ecosistema
INSERT INTO meta.workspace_products (workspace_id, product_slug, enabled)
SELECT w.id, p.slug, true
FROM meta.workspaces w
CROSS JOIN (
  VALUES ('core'), ('lifeflow'), ('streamautomator'), ('akoenet'), ('tabletop')
) AS p(slug)
WHERE lower(w.slug) = 'dakinis-platform'
ON CONFLICT (workspace_id, product_slug) DO UPDATE SET
  enabled = true,
  deactivated_at = NULL;

-- 7. Feature flags Hub Admin
UPDATE meta.feature_flags
SET enabled = true, updated_at = now()
WHERE flag_key IN ('hub.workspace_admin', 'hub.super_admin');

-- Verificación
SELECT u.id AS user_id, u.email, u.role, u.is_super_admin, u.tenant_id
FROM dakinis_auth.users u
WHERE lower(u.email) = lower('christiandvillar@gmail.com');

SELECT w.id AS workspace_id, w.name, w.slug, w.plan, wm.role, wm.status
FROM dakinis_auth.users u
JOIN meta.workspace_members wm ON wm.user_id = u.id AND wm.status = 'active'
JOIN meta.workspaces w ON w.id = wm.workspace_id
WHERE lower(u.email) = lower('christiandvillar@gmail.com');

SELECT product_slug, enabled
FROM meta.workspace_products wp
JOIN meta.workspaces w ON w.id = wp.workspace_id
WHERE lower(w.slug) = 'dakinis-platform'
ORDER BY product_slug;
