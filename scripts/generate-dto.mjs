#!/usr/bin/env node
/**
 * DTO Generator v1 — contracts/*.json → TypeScript types + OpenAPI stub paths.
 *
 * Usage:
 *   node scripts/generate-dto.mjs
 *   node scripts/generate-dto.mjs --contract internal-api
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contractsDir = path.join(root, "docs", "contracts");
const outDir = path.join(root, "packages", "sdk", "generated");

function parseArgs(argv) {
  const args = { contract: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--contract" && argv[i + 1]) {
      args.contract = argv[++i];
    }
  }
  return args;
}

/**
 * @param {string} routeKey e.g. "GET /internal/hub/dashboard/:userId"
 */
function parseRoute(routeKey) {
  const space = routeKey.indexOf(" ");
  const method = routeKey.slice(0, space).toUpperCase();
  const routePath = routeKey.slice(space + 1);
  const params = [...routePath.matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  return { method, path: routePath, params };
}

/**
 * @param {string} name
 */
function toTypeName(name) {
  return name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/**
 * @param {object} contract
 * @param {string} basename
 */
function generateTs(contract, basename) {
  const typeBase = toTypeName(basename);
  const lines = [
    `/** Auto-generated from docs/contracts/${basename}.json — do not edit by hand. */`,
    `export const ${typeBase}Service = ${JSON.stringify(contract.service || basename)} as const;`,
    `export const ${typeBase}BaseUrl = ${JSON.stringify(contract.baseUrl || "")} as const;`,
    "",
    `export type ${typeBase}Route =`,
  ];

  const routes = contract.routes || contract.workspaceAdmin || {};
  const entries = Object.entries(routes);
  if (!entries.length) {
    lines.push(`  never;`, "");
    return lines.join("\n");
  }

  for (let i = 0; i < entries.length; i++) {
    const [routeKey, description] = entries[i];
    const sep = i === entries.length - 1 ? ";" : " |";
    lines.push(`  | { key: ${JSON.stringify(routeKey)}; description: ${JSON.stringify(description)} }${sep}`);
  }
  lines.push("");

  lines.push(`export interface ${typeBase}Paths {`);
  for (const [routeKey] of entries) {
    const { method, path: routePath, params } = parseRoute(routeKey);
    const methodName = `${method.toLowerCase()}_${routePath
      .replace(/^\//, "")
      .replace(/[:/.-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")}`;
    const paramType =
      params.length === 0
        ? "Record<string, never>"
        : `{ ${params.map((p) => `${p}: string`).join("; ")} }`;
    lines.push(`  /** ${method} ${routePath} */`);
    lines.push(`  ${methodName}: (params: ${paramType}) => string;`);
  }
  lines.push(`}`, "");

  lines.push(`export const ${typeBase}PathBuilders: ${typeBase}Paths = {`);
  for (const [routeKey] of entries) {
    const { method, path: routePath, params } = parseRoute(routeKey);
    const methodName = `${method.toLowerCase()}_${routePath
      .replace(/^\//, "")
      .replace(/[:/.-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")}`;
    if (params.length === 0) {
      lines.push(`  ${methodName}: () => ${JSON.stringify(routePath)},`);
    } else {
      lines.push(
        `  ${methodName}: (params) => ${JSON.stringify(routePath)}.replace(/:([A-Za-z0-9_]+)/g, (_, k) => encodeURIComponent(String((params as Record<string, string>)[k]))),`
      );
    }
  }
  lines.push(`};`, "");

  return lines.join("\n");
}

/**
 * @param {object} contract
 * @param {string} basename
 */
function generateOpenApiStub(contract, basename) {
  const routes = contract.routes || contract.workspaceAdmin || {};
  const paths = {};
  for (const [routeKey, description] of Object.entries(routes)) {
    const { method, path: routePath, params } = parseRoute(routeKey);
    const cleanPath = routePath.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
    if (!paths[cleanPath]) paths[cleanPath] = {};
    paths[cleanPath][method.toLowerCase()] = {
      summary: description,
      parameters: params.map((name) => ({
        name,
        in: "path",
        required: true,
        schema: { type: "string" },
      })),
      responses: {
        200: { description: "OK" },
      },
    };
  }

  return {
    openapi: "3.0.3",
    info: {
      title: contract.service || basename,
      version: "0.1.0",
      description: contract.description || `Generated from ${basename}.json`,
    },
    servers: contract.baseUrl ? [{ url: contract.baseUrl }] : [],
    paths,
  };
}

function main() {
  const args = parseArgs(process.argv);
  mkdirSync(outDir, { recursive: true });

  const files = readdirSync(contractsDir)
    .filter((f) => f.endsWith(".json"))
    .filter((f) => !args.contract || f === `${args.contract}.json`);

  if (!files.length) {
    console.error("No contracts found");
    process.exit(1);
  }

  const indexExports = [];

  for (const file of files) {
    const basename = file.replace(/\.json$/, "");
    const contract = JSON.parse(readFileSync(path.join(contractsDir, file), "utf8"));
    const ts = generateTs(contract, basename);
    const oapi = generateOpenApiStub(contract, basename);

    const tsPath = path.join(outDir, `${basename}.ts`);
    const oapiPath = path.join(outDir, `${basename}.openapi.json`);
    writeFileSync(tsPath, ts, "utf8");
    writeFileSync(oapiPath, JSON.stringify(oapi, null, 2), "utf8");
    indexExports.push(`export * from "./${basename}.js";`);
    console.log(`generated ${path.relative(root, tsPath)}`);
    console.log(`generated ${path.relative(root, oapiPath)}`);
  }

  writeFileSync(path.join(outDir, "index.ts"), indexExports.join("\n") + "\n", "utf8");
  console.log(`done — ${files.length} contract(s)`);
}

main();
