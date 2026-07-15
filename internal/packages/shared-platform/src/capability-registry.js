/**
 * Runtime capability registry for Workspace addons and platform services.
 */

export class CapabilityRegistry {
  constructor() {
    /** @type {Map<string, { id: string; version: string; resolve?: () => unknown }>} */
    this.items = new Map();
  }

  /**
   * @param {string} id
   * @param {{ version?: string; resolve?: () => unknown }} [meta]
   */
  register(id, meta = {}) {
    this.items.set(id, {
      id,
      version: meta.version || "1.0.0",
      resolve: meta.resolve,
    });
  }

  /**
   * @param {string} id
   */
  has(id) {
    return this.items.has(id);
  }

  /**
   * @param {string} id
   */
  version(id) {
    return this.items.get(id)?.version || null;
  }

  /**
   * @param {string} id
   */
  resolve(id) {
    const item = this.items.get(id);
    if (!item) return null;
    return item.resolve ? item.resolve() : { id: item.id, version: item.version };
  }

  /** @returns {string[]} */
  list() {
    return [...this.items.keys()];
  }
}

export const platformCapabilities = new CapabilityRegistry();

platformCapabilities.register("window-manager", { version: "1.0.0" });
platformCapabilities.register("addon-sdk", { version: "1.0.0" });
platformCapabilities.register("widget-framework", { version: "1.0.0" });
platformCapabilities.register("command-palette", { version: "1.0.0" });
platformCapabilities.register("marketplace", { version: "1.0.0" });
platformCapabilities.register("ai", { version: "1.0.0" });
platformCapabilities.register("billing", { version: "1.0.0" });
platformCapabilities.register("search", { version: "1.0.0" });
platformCapabilities.register("notifications", { version: "1.0.0" });
