#!/usr/bin/env node
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  join(dirname(fileURLToPath(import.meta.url)), "..", "internal", "package.json"),
);
const { Pool } = require("pg");

const url = process.env.PLATFORM_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const { rows: addonRows } = await pool.query(
  "SELECT count(*)::int AS n FROM meta.workspace_addons",
);
const { rows: installRows } = await pool.query(
  `SELECT count(*)::int AS n FROM meta.workspace_addon_installs wai
   JOIN meta.workspaces w ON w.id = wai.workspace_id
   WHERE lower(w.slug) = 'dakinis-platform' AND wai.enabled`,
);
const { rows: assistantRows } = await pool.query(
  `SELECT count(*)::int AS n FROM akoenet.server_modules sm
   WHERE sm.enabled`,
);

console.log(
  JSON.stringify(
    {
      workspaceAddons: addonRows[0].n,
      enabledInstalls: installRows[0].n,
      assistantModulesEnabledTotal: assistantRows[0].n,
      note:
        assistantRows[0].n === 0
          ? "No server_modules for platform email — owner_id on akoenet.servers may not match dakinis_auth user yet."
          : undefined,
    },
    null,
    2,
  ),
);

await pool.end();
