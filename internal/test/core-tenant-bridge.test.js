import assert from "node:assert/strict";
import test from "node:test";
import {
  ensureCoreTenantMembership,
  mapWorkspaceRoleToCoreRole,
} from "../src/facades/core-tenant-bridge.js";

test("mapWorkspaceRoleToCoreRole", () => {
  assert.equal(mapWorkspaceRoleToCoreRole("owner"), "owner");
  assert.equal(mapWorkspaceRoleToCoreRole("admin"), "admin");
  assert.equal(mapWorkspaceRoleToCoreRole("viewer"), "viewer");
  assert.equal(mapWorkspaceRoleToCoreRole("member"), "member");
  assert.equal(mapWorkspaceRoleToCoreRole(""), "member");
  assert.equal(mapWorkspaceRoleToCoreRole("OWNER"), "owner");
});

test("ensureCoreTenantMembership upserts when workspace links to core tenant", async () => {
  const calls = [];
  const db = {
    async query(text, params) {
      calls.push({ text, params });
      if (text.includes("FROM meta.workspaces")) {
        return {
          rows: [{ id: params[0], core_tenant_slug: "heladeria-copernico", slug: "heladeria-copernico" }],
        };
      }
      if (text.includes("FROM core.tenants")) {
        return { rows: [{ id: "tenant-uuid", slug: "heladeria-copernico" }] };
      }
      return { rows: [] };
    },
  };

  const result = await ensureCoreTenantMembership(db, {
    workspaceId: "ws-uuid",
    userId: "user-uuid",
    role: "admin",
  });

  assert.equal(result.linked, true);
  assert.equal(result.tenantSlug, "heladeria-copernico");
  assert.equal(result.role, "admin");
  assert.ok(calls.some((c) => c.text.includes("INSERT INTO core.tenant_memberships")));
  assert.ok(calls.some((c) => c.text.includes("UPDATE dakinis_auth.users")));
});

test("ensureCoreTenantMembership no-ops without core tenant", async () => {
  const db = {
    async query(text) {
      if (text.includes("FROM meta.workspaces")) {
        return { rows: [{ id: "ws", core_tenant_slug: "missing-tenant", slug: "missing-tenant" }] };
      }
      if (text.includes("FROM core.tenants")) {
        return { rows: [] };
      }
      return { rows: [] };
    },
  };

  const result = await ensureCoreTenantMembership(db, {
    workspaceId: "ws",
    userId: "user",
    role: "member",
  });
  assert.equal(result.linked, false);
  assert.equal(result.reason, "core_tenant_missing");
});
