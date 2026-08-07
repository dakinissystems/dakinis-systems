/**
 * Ephemeral restore test: pg_dump(DATABASE_URL) → gzip → docker postgres → psql.
 * Usage (from repo root):
 *   railway run --service dakinis-internal-api -- node scripts/restore-postgres-test.mjs
 * Or with env already set:
 *   node scripts/restore-postgres-test.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, statSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { dumpCompatibleUrl, summarizeDatabaseUrl } from "./lib/pg-dump-url.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "backups", "postgres");
const container = "dakinis-postgres-restore-test";
const image = "pgvector/pgvector:pg17";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: opts.stdio ?? "inherit", shell: opts.shell ?? false, env: opts.env ?? process.env });
  if ((r.status ?? 1) !== 0 && !opts.allowFail) {
    throw new Error(`${cmd} ${args.join(" ")} failed (${r.status})`);
  }
  return r;
}

function dockerReady() {
  const r = spawnSync("docker", ["info"], { stdio: "ignore" });
  return r.status === 0;
}

function sleep(ms) {
  if (process.platform === "win32") {
    spawnSync("powershell", ["-Command", `Start-Sleep -Milliseconds ${ms}`], { stdio: "ignore" });
  } else {
    spawnSync("sleep", [String(Math.ceil(ms / 1000))], { stdio: "ignore" });
  }
}

const rawUrl = String(process.env.BACKUP_DATABASE_URL || process.env.DATABASE_URL || "").trim();
if (!rawUrl) {
  console.error(
    "Set BACKUP_DATABASE_URL or DATABASE_URL (use: railway run --service dakinis-internal-api -- node scripts/restore-postgres-test.mjs)"
  );
  process.exit(1);
}
const databaseUrl = dumpCompatibleUrl(rawUrl);
{
  const s = summarizeDatabaseUrl(databaseUrl);
  console.log(`[restore-test] dump target host=${s.host} port=${s.port} user=${s.user} ref=${s.ref}`);
}
if (!dockerReady()) {
  console.error("Docker engine not running. Start Docker Desktop and retry.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const backupName = `dakinis-restore-test-${stamp}.sql.gz`;
const outDirDocker = outDir.replace(/\\/g, "/");
const envFile = join(outDir, `.restore-env-${stamp}`);
writeFileSync(envFile, `DATABASE_URL=${databaseUrl}\n`, { mode: 0o600 });

try {
  console.log("=== 1/3 pg_dump →", backupName);
  // Skip Supabase-proprietary schemas that vanilla/pgvector images cannot host.
  const excludeSchemas = [
    "vault",
    "pgsodium",
    "graphql",
    "graphql_public",
    "realtime",
    "_realtime",
    "supabase_functions",
    "net",
    "pgbouncer",
  ];
  const excludeArgs = excludeSchemas.map((s) => `--exclude-schema=${s}`).join(" ");
  run("docker", [
    "run",
    "--rm",
    "--env-file",
    envFile,
    "-v",
    `${outDirDocker}:/out`,
    image,
    "bash",
    "-c",
    `set -euo pipefail; pg_dump "$DATABASE_URL" --no-owner --no-acl ${excludeArgs} | gzip -c > /out/${backupName}; ls -lh /out/${backupName}`,
  ]);

  if (!existsSync(join(outDir, backupName))) {
    throw new Error(`Backup missing: ${join(outDir, backupName)}`);
  }
  const sizeMb = (statSync(join(outDir, backupName)).size / (1024 * 1024)).toFixed(2);
  console.log(`Backup OK (${sizeMb} MB)`);

  console.log("=== 2/3 ephemeral Postgres + restore ===");
  run("docker", ["rm", "-f", container], { allowFail: true, stdio: "ignore" });
  run("docker", [
    "run",
    "-d",
    "--name",
    container,
    "-e",
    "POSTGRES_PASSWORD=test",
    "-e",
    "POSTGRES_USER=test",
    "-e",
    "POSTGRES_DB=restore_test",
    image,
  ]);

  let readyOk = false;
  for (let i = 0; i < 30; i++) {
    const ready = spawnSync("docker", ["exec", container, "pg_isready", "-U", "test", "-d", "restore_test"], {
      stdio: "ignore",
    });
    if (ready.status === 0) {
      readyOk = true;
      break;
    }
    sleep(2000);
  }
  if (!readyOk) {
    throw new Error("Ephemeral Postgres did not become ready in time");
  }

  // Stub Supabase roles referenced by GRANT/RLS in dumps.
  run("docker", [
    "exec",
    container,
    "psql",
    "-U",
    "test",
    "-d",
    "restore_test",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `DO $$ BEGIN
      CREATE ROLE anon NOLOGIN;
      EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE ROLE authenticated NOLOGIN;
      EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE ROLE service_role NOLOGIN;
      EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE ROLE authenticator NOLOGIN;
      EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE ROLE supabase_admin NOLOGIN;
      EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
  ]);

  run("docker", [
    "run",
    "--rm",
    "--link",
    `${container}:pg`,
    "-v",
    `${outDirDocker}:/backup:ro`,
    "-e",
    "PGPASSWORD=test",
    image,
    "bash",
    "-c",
    // Vanilla postgres:17 lacks Supabase-only extensions; skip those DDL lines so app schemas still restore.
    `set -euo pipefail; gunzip -c /backup/${backupName} | grep -vE 'EXTENSION.*(supabase_vault|pg_graphql|pg_net|wrappers|pgsodium|pgjwt|pg_stat_statements)' | psql -h pg -U test -d restore_test -v ON_ERROR_STOP=1`,
  ]);

  console.log("=== 3/3 verify ===");
  run("docker", ["exec", container, "psql", "-U", "test", "-d", "restore_test", "-c", "\\dn"]);
  const count = spawnSync(
    "docker",
    [
      "exec",
      container,
      "psql",
      "-U",
      "test",
      "-d",
      "restore_test",
      "-tAc",
      "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';",
    ],
    { encoding: "utf8" }
  );
  const tableCount = Number.parseInt(String(count.stdout || "").trim(), 10);
  console.log("public tables:", tableCount);
  if (!Number.isFinite(tableCount) || tableCount < 1) {
    throw new Error("Restore verification failed: no public tables restored");
  }

  run("docker", ["rm", "-f", container], { allowFail: true, stdio: "ignore" });

  for (const f of readdirSync(outDir)) {
    if (f.startsWith("dakinis-restore-test-") && f.endsWith(".sql.gz") && f !== backupName) {
      try {
        unlinkSync(join(outDir, f));
      } catch {
        /* ignore */
      }
    }
  }

  console.log("RESTORE_TEST_PASSED");
  console.log("Backup kept at:", join(outDir, backupName));
} finally {
  try {
    unlinkSync(envFile);
  } catch {
    /* ignore */
  }
}
