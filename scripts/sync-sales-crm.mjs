#!/usr/bin/env node
/**
 * Sync Google Sheets CSV exports → sales markdown (local, gitignored).
 *
 * Export from Sheets → docs/company/sales/data/*.csv
 * Run: node scripts/sync-sales-crm.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "docs", "company", "sales", "data");
const SALES_DIR = path.join(ROOT, "docs", "company", "sales");

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? "").trim();
    });
    return obj;
  });
  return { headers, rows };
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || c === ";") {
      out.push(cur);
      cur = "";
      if (c === ";") continue;
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function countBy(rows, key) {
  const m = new Map();
  for (const r of rows) {
    const v = (r[key] || "").trim() || "(vacío)";
    m.set(v, (m.get(v) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function normalizeInteres(v) {
  const s = String(v || "").toLowerCase();
  if (s.includes("alto") || s.includes("🟢") || s === "verde") return "Alto";
  if (s.includes("medio") || s.includes("🟡") || s === "amarillo") return "Medio";
  if (s.includes("bajo") || s.includes("🔴") || s === "rojo") return "Bajo";
  return v || "(sin clasificar)";
}

function inferHipotesisFromLeads(leads) {
  const defs = [
    {
      hipotesis: "Usan Excel",
      test: (r) => /excel/i.test(r.herramientas || r.notas || ""),
    },
    {
      hipotesis: "WhatsApp operativo",
      test: (r) => /whatsapp/i.test(r.herramientas || r.notas || r.dolor_texto || ""),
    },
    {
      hipotesis: "Tienen CRM",
      test: (r) => /crm|holded|hubspot|zoho|odoo/i.test(r.herramientas || r.competidor || ""),
    },
    {
      hipotesis: "Dolor inventario",
      test: (r) => /inventario|stock/i.test(r.dolor_categoria || r.dolor_texto || ""),
    },
    {
      hipotesis: "Dolor clientes/seguimiento",
      test: (r) => /cliente|seguimiento|crm/i.test(r.dolor_categoria || r.dolor_texto || ""),
    },
  ];
  return defs.map((d) => {
    let si = 0;
    for (const r of leads) {
      if (d.test(r)) si++;
    }
    return { hipotesis: d.hipotesis, si, no: Math.max(0, leads.length - si), comentarios: "" };
  });
}

function buildAnalysis({ leads, hipotesis, objeciones, frases, eventos }) {
  const now = new Date().toISOString().slice(0, 10);
  const lines = [
    "# Análisis CRM — generado automáticamente",
    "",
    `> **Generado:** ${now} · Script: \`node scripts/sync-sales-crm.mjs\``,
    "> Fuente: CSV en `docs/company/sales/data/`. No editar a mano — vuelve a ejecutar el script.",
    "",
  ];

  if (!leads?.rows?.length) {
    lines.push("⚠️ No hay `leads.csv` o está vacío. Exporta la pestaña **Leads** desde Google Sheets.", "");
    return lines.join("\n");
  }

  const L = leads.rows;
  lines.push(`## Resumen`, "", `- **Conversaciones registradas:** ${L.length}`, "");

  const interes = countBy(
    L.map((r) => ({ ...r, interes: normalizeInteres(r.interes) })),
    "interes"
  );
  lines.push("### Interés", "", "| Nivel | Count |", "|-------|-------|");
  for (const [k, n] of interes) lines.push(`| ${k} | ${n} |`);
  lines.push("");

  lines.push("### Dolor (categoría)", "", "| Categoría | Count |", "|-----------|-------|");
  for (const [k, n] of countBy(L, "dolor_categoria")) lines.push(`| ${k} | ${n} |`);
  lines.push("");

  lines.push("### Sector", "", "| Sector | Count |", "|--------|-------|");
  for (const [k, n] of countBy(L, "sector")) lines.push(`| ${k} | ${n} |`);
  lines.push("");

  lines.push("### Tier ICP", "", "| Tier | Count |", "|------|-------|");
  for (const [k, n] of countBy(L, "tier_icp")) lines.push(`| ${k} | ${n} |`);
  lines.push("");

  lines.push("### Estado pipeline", "", "| Estado | Count |", "|--------|-------|");
  for (const [k, n] of countBy(L, "estado")) lines.push(`| ${k} | ${n} |`);
  lines.push("");

  const tools = countBy(L, "herramientas");
  if (tools.length) {
    lines.push("### Herramientas (texto libre — revisar manual)", "", "| Herramientas | Count |", "|--------------|-------|");
    for (const [k, n] of tools.slice(0, 15)) lines.push(`| ${k} | ${n} |`);
    lines.push("");
  }

  const hipRows = hipotesis?.rows?.length ? hipotesis.rows : inferHipotesisFromLeads(L);
  lines.push("## Hipótesis (desde datos)", "", "| Hipótesis | Sí | No | Comentarios |", "|-----------|----|----|-------------|");
  for (const h of hipRows) {
    lines.push(`| ${h.hipotesis || ""} | ${h.si ?? ""} | ${h.no ?? ""} | ${h.comentarios || ""} |`);
  }
  lines.push("");

  if (objeciones?.rows?.length) {
    const objCount = countBy(objeciones.rows, "objecion");
    lines.push("## Objeciones (frecuencia)", "", "| Objeción | Veces |", "|----------|-------|");
    for (const [k, n] of objCount) lines.push(`| ${k} | ${n} |`);
    lines.push("");
  }

  if (frases?.rows?.length) {
    lines.push("## Frases que funcionaron", "", "| Frase | Resultado | Evento |", "|-------|-----------|--------|");
    for (const f of frases.rows.slice(-20)) {
      lines.push(`| ${f.frase || ""} | ${f.resultado || ""} | ${f.evento || ""} |`);
    }
    lines.push("");
  }

  if (eventos?.rows?.length) {
    lines.push("## Eventos", "", "| Evento | Conversaciones | Demos agend. | Notas |", "|--------|----------------|--------------|-------|");
    for (const e of eventos.rows) {
      lines.push(
        `| ${e.evento || ""} | ${e.conversaciones || ""} | ${e.demos_agendadas || ""} | ${e.notas || ""} |`
      );
    }
    lines.push("");
  }

  lines.push(
    "## Acciones sugeridas",
    "",
    "1. Objeción ≥3 veces → [`OBJECTIONS.md`](./OBJECTIONS.md) respuestas base",
    "2. Dolor #1 → ajustar mensaje en [`PLAYBOOK-NETWORKING.md`](../../PLAYBOOK-NETWORKING.md)",
    "3. Tier con más Alto → [`ICP.md`](./ICP.md)",
    "4. Actualizar conclusiones en [`STRATEGY.md`](./STRATEGY.md) § Hipótesis",
    ""
  );

  return lines.join("\n");
}

function mergeGeneratedSection(filePath, sectionTitle, tableMd) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  const start = `<!-- SYNC:${sectionTitle}:START -->`;
  const end = `<!-- SYNC:${sectionTitle}:END -->`;
  const block = `${start}\n${tableMd}\n${end}`;
  if (content.includes(start)) {
    content = content.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
  } else {
    content = `${content.trimEnd()}\n\n${block}\n`;
  }
  fs.writeFileSync(filePath, content, "utf8");
}

const SHEET_TABS = [
  { sheet: "Leads", file: "leads.csv" },
  { sheet: "Hipotesis", file: "hipotesis.csv" },
  { sheet: "Objeciones", file: "objeciones.csv" },
  { sheet: "Frases", file: "frases.csv" },
  { sheet: "Eventos", file: "eventos.csv" },
];

function loadSheetConfig() {
  const configPath = path.join(DATA_DIR, "sheet.config.json");
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  const fromEnv = process.env.SALES_SHEET_ID?.trim();
  if (fromEnv) return { spreadsheetId: fromEnv };
  return null;
}

async function fetchSheetTab(spreadsheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al descargar "${sheetName}"`);
  }
  const text = await res.text();
  if (text.includes("<!DOCTYPE html") || text.includes("accounts.google.com")) {
    throw new Error(
      `Sheet no accesible para "${sheetName}". Comparte el libro: Cualquier persona con el enlace → Lector.`
    );
  }
  return text.replace(/^\uFEFF/, "");
}

async function fetchAllTabs(spreadsheetId) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const { sheet, file } of SHEET_TABS) {
    const csv = await fetchSheetTab(spreadsheetId, sheet);
    fs.writeFileSync(path.join(DATA_DIR, file), csv, "utf8");
    console.log(`Fetched ${sheet} → data/${file}`);
  }
}

function syncObjeciones(objeciones) {
  if (!objeciones?.rows?.length) return;
  const rows = objeciones.rows
    .map(
      (o) =>
        `| ${o.fecha || ""} | ${o.objecion || ""} | ${o.contexto || ""} | ${o.respuesta || ""} |`
    )
    .join("\n");
  const table = `## Registro desde Sheet (auto)\n\n| Fecha | Objeción | Contexto | Respuesta |\n|-------|----------|----------|----------|\n${rows}`;
  mergeGeneratedSection(path.join(SALES_DIR, "OBJECTIONS.md"), "OBJECTIONS", table);
}

function syncFrases(frases) {
  if (!frases?.rows?.length) return;
  const rows = frases.rows
    .map((f) => `| ${f.frase || ""} | ${f.resultado || ""} | ${f.evento || ""} | ${f.fecha || ""} |`)
    .join("\n");
  const table = `## Desde Sheet (auto)\n\n| Pregunta / frase | Resultado | Evento | Fecha |\n|------------------|-----------|--------|-------|\n${rows}`;
  mergeGeneratedSection(path.join(SALES_DIR, "DISCOVERY.md"), "FRASES", table);
}

async function main() {
  const args = process.argv.slice(2);
  const doFetch = args.includes("--fetch") || args.includes("-f");

  if (doFetch) {
    const cfg = loadSheetConfig();
    const id = cfg?.spreadsheetId?.trim();
    if (!id) {
      console.error("Falta spreadsheetId en docs/company/sales/data/sheet.config.json o SALES_SHEET_ID");
      process.exit(1);
    }
    await fetchAllTabs(id);
  }

  const leads = readCsv(path.join(DATA_DIR, "leads.csv"));
  const hipotesis = readCsv(path.join(DATA_DIR, "hipotesis.csv"));
  const objeciones = readCsv(path.join(DATA_DIR, "objeciones.csv"));
  const frases = readCsv(path.join(DATA_DIR, "frases.csv"));
  const eventos = readCsv(path.join(DATA_DIR, "eventos.csv"));

  const analysis = buildAnalysis({ leads, hipotesis, objeciones, frases, eventos });
  fs.writeFileSync(path.join(SALES_DIR, "ANALYSIS.md"), analysis, "utf8");
  console.log("Wrote docs/company/sales/ANALYSIS.md");

  syncObjeciones(objeciones);
  syncFrases(frases);

  if (leads?.rows?.length) {
    console.log(`Leads: ${leads.rows.length} filas con datos`);
  } else if (!doFetch) {
    console.log("Sin filas en leads.csv — usa --fetch o exporta CSV manual.");
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
