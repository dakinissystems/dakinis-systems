#!/usr/bin/env node
/**
 * Audit Railway DATABASE_URL / *DATABASE_URL* across all projects & services.
 *
 * Never prints passwords — only host + Supabase project ref + status.
 *
 * Auth (first match):
 *   RAILWAY_TOKEN | RAILWAY_API_TOKEN | ~/.railway/config.json user.token
 *
 * Usage:
 *   node scripts/check-railway-database-urls.mjs
 *   $env:EXPECTED_SUPABASE_REF="omdosutakaefpowscagp"
 *   $env:BAD_SUPABASE_REF="eyiuplmpfjclwrlkbmbe"
 *
 * Docs: https://docs.railway.com/integrations/api
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ENDPOINT = "https://backboard.railway.com/graphql/v2";
const EXPECTED_REF = process.env.EXPECTED_SUPABASE_REF || "omdosutakaefpowscagp";
const BAD_REF = process.env.BAD_SUPABASE_REF || "eyiuplmpfjclwrlkbmbe";

const DB_VAR_RE = /^(DATABASE_URL|PLATFORM_DATABASE_URL|BACKUP_DATABASE_URL|.*_DATABASE_URL)$/i;

function loadAuth() {
  const account =
    process.env.RAILWAY_TOKEN ||
    process.env.RAILWAY_API_TOKEN ||
    process.env.RAILWAY_ACCOUNT_TOKEN ||
    "";
  if (account.trim()) {
    return { kind: "account", token: account.trim() };
  }

  const project = process.env.RAILWAY_PROJECT_TOKEN || "";
  if (project.trim()) {
    return { kind: "project", token: project.trim() };
  }

  // CLI session often cannot call public GraphQL — prefer explicit account token.
  const cfgPath = path.join(os.homedir(), ".railway", "config.json");
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      const t = String(cfg?.user?.token || cfg?.user?.accessToken || "").trim();
      if (t) return { kind: "cli", token: t };
    } catch {
      /* ignore */
    }
  }
  return { kind: "none", token: "" };
}

async function graphql(auth, query, variables = {}) {
  /** @type {Record<string, string>} */
  const headers = { "Content-Type": "application/json" };
  if (auth.kind === "project") {
    headers["Project-Access-Token"] = auth.token;
  } else {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(body).slice(0, 400)}`);
  }
  if (body.errors?.length) {
    const msg = body.errors.map((e) => e.message).join("; ");
    const err = new Error(msg);
    err.graphql = body.errors;
    throw err;
  }
  return body.data;
}

function extractRef(url) {
  if (!url || typeof url !== "string") return null;
  let m = url.match(/postgres(?:ql)?\.([a-z0-9]{20})/i);
  if (m) return m[1];
  m = url.match(/db\.([a-z0-9]{20})\.supabase\.co/i);
  if (m) return m[1];
  m = url.match(/([a-z0-9]{20})\.supabase\.co/i);
  if (m) return m[1];
  return null;
}

function extractHost(url) {
  try {
    // postgres:// URLs parse as URL with hostname
    return new URL(url).hostname || "(no-host)";
  } catch {
    const m = String(url).match(/@([^:/?]+)/);
    return m?.[1] || "(unparseable)";
  }
}

function statusFor(ref, host) {
  if (ref === EXPECTED_REF) return "OK";
  if (ref === BAD_REF) return "BAD_LEGACY";
  if (host.includes("supabase") && ref) return "OTHER_REF";
  if (host.includes("supabase")) return "SUPABASE_NO_REF";
  if (host.includes("railway") || host.includes("rlwy")) return "RAILWAY_PG";
  if (host.includes("localhost") || host === "postgres") return "LOCAL";
  return "OTHER";
}

function mark(status) {
  if (status === "OK") return "✔";
  if (status === "BAD_LEGACY") return "✖";
  if (status === "MISSING") return "·";
  return "?";
}

async function listProjects(auth) {
  if (auth.kind === "project") {
    const q = `
      query {
        projectToken {
          projectId
          environmentId
        }
      }
    `;
    const meta = await graphql(auth, q);
    const projectId = meta?.projectToken?.projectId;
    const environmentId = meta?.projectToken?.environmentId;
    if (!projectId) throw new Error("Project token did not return projectId");

    const qProj = `
      query($id: String!) {
        project(id: $id) {
          id
          name
          environments { edges { node { id name } } }
          services { edges { node { id name } } }
        }
      }
    `;
    const data = await graphql(auth, qProj, { id: projectId });
    const project = data?.project;
    if (!project) throw new Error("Could not load project for project token");
    // Restrict to token environment when present
    if (environmentId && project.environments?.edges) {
      project.environments.edges = project.environments.edges.filter(
        (e) => e.node.id === environmentId,
      );
    }
    return [project];
  }

  const qMe = `
    query {
      me {
        name
        projects {
          edges {
            node {
              id
              name
              environments { edges { node { id name } } }
              services { edges { node { id name } } }
            }
          }
        }
      }
    }
  `;
  try {
    const data = await graphql(auth, qMe);
    const edges = data?.me?.projects?.edges;
    if (edges?.length) return edges.map((e) => e.node);
  } catch (err) {
    console.error(`[warn] me.projects failed: ${err.message}`);
  }

  const qProjects = `
    query {
      projects {
        edges {
          node {
            id
            name
            environments { edges { node { id name } } }
            services { edges { node { id name } } }
          }
        }
      }
    }
  `;
  const data = await graphql(auth, qProjects);
  return (data?.projects?.edges || []).map((e) => e.node);
}

/**
 * Current API returns a flat map: { DATABASE_URL: "...", ... }
 * projectId is required (String!). Omit serviceId for shared env vars.
 */
async function fetchVariables(auth, { projectId, environmentId, serviceId }) {
  if (!projectId) throw new Error("projectId required");
  if (!environmentId) throw new Error("environmentId required");

  if (serviceId) {
    const q = `
      query($projectId: String!, $environmentId: String!, $serviceId: String!) {
        variables(
          projectId: $projectId
          environmentId: $environmentId
          serviceId: $serviceId
        )
      }
    `;
    const data = await graphql(auth, q, { projectId, environmentId, serviceId });
    return normalizeVariables(data?.variables);
  }

  // Shared variables for the environment (no serviceId argument)
  const qShared = `
    query($projectId: String!, $environmentId: String!) {
      variables(projectId: $projectId, environmentId: $environmentId)
    }
  `;
  const data = await graphql(auth, qShared, { projectId, environmentId });
  return normalizeVariables(data?.variables);
}

function normalizeVariables(raw) {
  if (!raw) return {};
  if (Array.isArray(raw?.edges)) {
    /** @type {Record<string, string>} */
    const out = {};
    for (const e of raw.edges) {
      if (e?.node?.name) out[e.node.name] = e.node.value;
    }
    return out;
  }
  if (typeof raw === "object") return raw;
  return {};
}

function pickDbVars(vars) {
  return Object.entries(vars || {})
    .filter(([name]) => DB_VAR_RE.test(name))
    .map(([name, value]) => ({ name, value: String(value || "") }));
}

async function main() {
  const auth = loadAuth();
  if (!auth.token) {
    console.error("Missing Railway token.");
    console.error("Create an Account token: https://railway.com/account/tokens");
    console.error('Then:  $env:RAILWAY_TOKEN="..."');
    process.exit(1);
  }

  console.log(`Expected ref: ${EXPECTED_REF}`);
  console.log(`Legacy bad:   ${BAD_REF}`);
  console.log(`Auth source:  ${auth.kind}`);
  console.log("(passwords never printed)\n");

  let projects;
  try {
    projects = await listProjects(auth);
  } catch (err) {
    console.error(`Auth failed (${auth.kind}): ${err.message}`);
    if (auth.kind === "cli") {
      console.error("");
      console.error("The Railway CLI session token cannot use the public GraphQL API.");
      console.error("Create an Account token at https://railway.com/account/tokens");
      console.error('PowerShell:  $env:RAILWAY_TOKEN="<account-token>"');
      console.error("Then re-run:  node scripts/check-railway-database-urls.mjs");
    }
    process.exit(1);
  }

  if (!projects.length) {
    console.error("No projects returned. Token may lack scope.");
    process.exit(1);
  }

  /** @type {Array<{ project: string; env: string; service: string; varName: string; host: string; ref: string|null; status: string }>} */
  const rows = [];
  /** @type {Record<string, Array<{ project: string; env: string; service: string; varName: string; status: string; ref: string|null }>>} */
  const byHost = {};

  for (const project of projects) {
    console.log("==================================================");
    console.log(`PROJECT: ${project.name}`);

    const envs = (project.environments?.edges || []).map((e) => e.node);
    const services = (project.services?.edges || []).map((e) => e.node);

    for (const env of envs) {
      console.log(`\n  ENV: ${env.name}`);

      // Shared env vars (no service)
      try {
        const shared = await fetchVariables(auth, {
          projectId: project.id,
          environmentId: env.id,
          serviceId: null,
        });
        for (const v of pickDbVars(shared)) {
          const host = extractHost(v.value);
          const ref = extractRef(v.value);
          const status = statusFor(ref, host);
          const line = {
            project: project.name,
            env: env.name,
            service: "(shared)",
            varName: v.name,
            host,
            ref,
            status,
          };
          rows.push(line);
          (byHost[host] ||= []).push(line);
          console.log(
            `    ${mark(status)} (shared)  ${v.name} -> ${host}` +
              (ref ? `  ref=${ref}` : "") +
              (status !== "OK" && status !== "MISSING" ? `  [${status}]` : ""),
          );
        }
      } catch (err) {
        console.log(`    · (shared) ERROR: ${err.message.slice(0, 120)}`);
      }

      for (const service of services) {
        try {
          const vars = await fetchVariables(auth, {
            projectId: project.id,
            environmentId: env.id,
            serviceId: service.id,
          });
          const dbVars = pickDbVars(vars);
          if (!dbVars.length) {
            console.log(`    · ${service.name}  (no DATABASE_URL*)`);
            continue;
          }
          for (const v of dbVars) {
            const host = extractHost(v.value);
            const ref = extractRef(v.value);
            const status = statusFor(ref, host);
            const line = {
              project: project.name,
              env: env.name,
              service: service.name,
              varName: v.name,
              host,
              ref,
              status,
            };
            rows.push(line);
            (byHost[host] ||= []).push(line);
            console.log(
              `    ${mark(status)} ${service.name}  ${v.name} -> ${host}` +
                (ref ? `  ref=${ref}` : "") +
                (status !== "OK" ? `  [${status}]` : ""),
            );
          }
        } catch (err) {
          console.log(`    ? ${service.name} ERROR: ${err.message.slice(0, 120)}`);
        }
      }
    }
    console.log("");
  }

  console.log("\n================ HOST SUMMARY ================\n");
  for (const host of Object.keys(byHost).sort()) {
    console.log(host);
    for (const item of byHost[host]) {
      console.log(
        `   ${mark(item.status)} ${item.project} / ${item.env} / ${item.service}  (${item.varName}` +
          (item.ref ? ` ref=${item.ref}` : "") +
          `) [${item.status}]`,
      );
    }
    console.log("");
  }

  const bad = rows.filter((r) => r.status === "BAD_LEGACY");
  const other = rows.filter((r) => r.status === "OTHER_REF" || r.status === "SUPABASE_NO_REF");
  const ok = rows.filter((r) => r.status === "OK");

  console.log("================ RESULT ================\n");
  console.log(`OK (expected ref): ${ok.length}`);
  console.log(`BAD legacy (${BAD_REF}): ${bad.length}`);
  console.log(`Other Supabase: ${other.length}`);
  console.log(`Total DB URL vars: ${rows.length}`);

  if (bad.length) {
    console.log("\n✖ Services still on legacy project:");
    for (const b of bad) {
      console.log(`   ${b.project} / ${b.env} / ${b.service}  ${b.varName}`);
    }
    process.exitCode = 2;
  } else {
    console.log("\n✔ No DATABASE_URL* found pointing at legacy ref.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message || err);
  process.exit(1);
});
