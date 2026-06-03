import esCore from "../platform/core/web/src/locales/es.js";
import enCore from "../platform/core/web/src/locales/en.js";
import { translations as landingT } from "../apps/landing/src/i18n/translations.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function flatKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) keys.push(...flatKeys(v, p));
    else keys.push(p);
  }
  return keys;
}

function report(name, esObj, enObj) {
  const kes = new Set(flatKeys(esObj));
  const ken = new Set(flatKeys(enObj));
  const onlyEs = [...kes].filter((k) => !ken.has(k));
  const onlyEn = [...ken].filter((k) => !kes.has(k));
  console.log(`\n=== ${name} ===`);
  console.log(`  keys ES: ${kes.size}  EN: ${ken.size}`);
  console.log(`  only ES: ${onlyEs.length}`, onlyEs.slice(0, 8).join(", ") || "—");
  console.log(`  only EN: ${onlyEn.length}`, onlyEn.slice(0, 8).join(", ") || "—");
  return onlyEs.length === 0 && onlyEn.length === 0;
}

let ok = true;
ok = report("Core (@dakinis/web)", esCore, enCore) && ok;
ok = report("Landing", landingT.es, landingT.en) && ok;

const saEsPath = path.join(repoRoot, "apps/streamautomator/apps/web/src/locales/es.json");
const saEnPath = path.join(repoRoot, "apps/streamautomator/apps/web/src/locales/en.json");
if (fs.existsSync(saEsPath) && fs.existsSync(saEnPath)) {
  const saEs = JSON.parse(fs.readFileSync(saEsPath, "utf8"));
  const saEn = JSON.parse(fs.readFileSync(saEnPath, "utf8"));
  ok = report("StreamAutomator Web", saEs, saEn) && ok;
}

console.log(ok ? "\nAll checked locale pairs are in sync." : "\nSome locale pairs have mismatches.");
process.exit(ok ? 0 : 1);
