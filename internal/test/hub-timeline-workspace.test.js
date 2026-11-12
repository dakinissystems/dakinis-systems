import test from "node:test";
import assert from "node:assert/strict";
import { WORKSPACE_TIMELINE_MEMBERS_SQL } from "../src/services/hub-timeline.js";

test("la copia de la venta exige que quien opera sea miembro del workspace", () => {
  const sql = WORKSPACE_TIMELINE_MEMBERS_SQL.toLowerCase();
  assert.match(sql, /exists/);
  assert.match(sql, /actor\.user_id = \$2::uuid/);
  assert.match(sql, /owner', 'admin', 'member'/);
  assert.match(sql, /core_tenant_slug/);
});
