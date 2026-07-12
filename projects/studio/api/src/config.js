import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 4090,
  service: "dakinis-studio-api",
  version: "0.1.0",
  catalogRoot: join(__dirname, "../../catalog"),
};

/** @param {string} name */
export function loadCatalogJson(name) {
  const path = join(config.catalogRoot, name);
  return JSON.parse(readFileSync(path, "utf8"));
}
