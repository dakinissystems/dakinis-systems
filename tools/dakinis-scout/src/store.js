import fs from "node:fs";
import path from "node:path";

/**
 * Simple JSON file store to avoid re-alerting the same opportunity.
 */
export function createSeenStore(filePath) {
  const dir = path.dirname(filePath);
  /** @type {Record<string, { at: string; profit?: number }>} */
  let map = {};

  if (fs.existsSync(filePath)) {
    try {
      map = JSON.parse(fs.readFileSync(filePath, "utf8")) || {};
    } catch {
      map = {};
    }
  }

  function persist() {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(map, null, 2), "utf8");
  }

  return {
    has(key) {
      return Boolean(map[key]);
    },
    mark(key, meta = {}) {
      map[key] = { at: new Date().toISOString(), ...meta };
      persist();
    },
    size() {
      return Object.keys(map).length;
    },
  };
}
