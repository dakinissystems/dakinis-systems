import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { jsonResult, textResult } from "../lib/http.js";

const DOC_EXTS = new Set([".md", ".mdx", ".txt"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);

/**
 * @param {string} root
 * @param {string} [rel]
 * @returns {AsyncGenerator<string>}
 */
async function* walkDocs(root, rel = "") {
  const dir = path.join(root, rel);
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    const childRel = rel ? `${rel}/${ent.name}` : ent.name;
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      yield* walkDocs(root, childRel);
    } else if (ent.isFile() && DOC_EXTS.has(path.extname(ent.name).toLowerCase())) {
      yield childRel.replace(/\\/g, "/");
    }
  }
}

function scoreMatch(text, query) {
  const lower = text.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (!terms.length) return 0;
  let score = 0;
  for (const t of terms) {
    if (!lower.includes(t)) return 0;
    score += 1;
    const idx = lower.indexOf(t);
    if (idx >= 0 && idx < 200) score += 0.5;
  }
  return score;
}

function snippetAround(text, query, radius = 120) {
  const lower = text.toLowerCase();
  const first = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)[0];
  const idx = first ? lower.indexOf(first) : 0;
  if (idx < 0) return text.slice(0, radius * 2).replace(/\s+/g, " ").trim();
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + first.length + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}

function resolveSafe(relPath) {
  const root = path.resolve(config.docsRoot);
  const resolved = path.resolve(root, relPath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return null;
  }
  return resolved;
}

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 */
export function registerDocsTools(server) {
  server.registerTool(
    "search_docs",
    {
      title: "Search docs",
      description:
        "Full-text search over local Dakinis markdown docs (DAKINIS_DOCS_ROOT, default monorepo docs/). " +
        "Returns ranked path + snippet matches. No network.",
      inputSchema: {
        query: z.string().min(1).describe("Search terms (AND)."),
        limit: z.number().int().positive().max(50).optional().describe("Max hits (default 10)."),
      },
    },
    async ({ query, limit = 10 }) => {
      const root = config.docsRoot;
      try {
        await fs.access(root);
      } catch {
        return jsonResult(
          { ok: false, error: "docs_root_missing", docsRoot: root },
          { isError: true },
        );
      }

      const hits = [];
      for await (const rel of walkDocs(root)) {
        const abs = path.join(root, rel);
        let text;
        try {
          text = await fs.readFile(abs, "utf8");
        } catch {
          continue;
        }
        const hay = `${rel}\n${text}`;
        const score = scoreMatch(hay, query);
        if (score <= 0) continue;
        hits.push({
          path: rel,
          score,
          snippet: snippetAround(text, query),
        });
      }

      hits.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
      return jsonResult({
        ok: true,
        docsRoot: root,
        query,
        total: hits.length,
        results: hits.slice(0, limit),
      });
    },
  );

  server.registerTool(
    "read_doc",
    {
      title: "Read doc",
      description: "Read a markdown/text file under DAKINIS_DOCS_ROOT by relative path.",
      inputSchema: {
        path: z
          .string()
          .min(1)
          .describe("Relative path under docs root, e.g. company/PRICING-STRATEGY.md"),
        maxChars: z
          .number()
          .int()
          .positive()
          .max(200_000)
          .optional()
          .describe("Truncate after N chars (default 40000)."),
      },
    },
    async ({ path: relPath, maxChars = 40_000 }) => {
      const abs = resolveSafe(relPath);
      if (!abs) {
        return jsonResult({ ok: false, error: "path_escape_denied", path: relPath }, { isError: true });
      }
      try {
        const text = await fs.readFile(abs, "utf8");
        const truncated = text.length > maxChars;
        const body = truncated ? text.slice(0, maxChars) + "\n\n…[truncated]" : text;
        return textResult(`# ${relPath}\n\n${body}`);
      } catch (err) {
        return jsonResult(
          { ok: false, error: err?.code || "read_failed", message: err?.message, path: relPath },
          { isError: true },
        );
      }
    },
  );
}
