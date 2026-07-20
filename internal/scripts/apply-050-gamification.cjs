const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const sqlPath = path.resolve(__dirname, "../../docs/supabase/migrations/050_akoenet_gamification.sql");
const sql = fs.readFileSync(sqlPath, "utf8");
const p = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

p.query(sql)
  .then(async () => {
    const r = await p.query("select to_regclass('akoenet.member_xp') as t");
    console.log("ok", r.rows[0]);
    await p.end();
  })
  .catch(async (e) => {
    console.error(e.message);
    try {
      await p.end();
    } catch {
      /* ignore */
    }
    process.exit(1);
  });
