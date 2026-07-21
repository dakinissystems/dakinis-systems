/**
 * Module Orchestrator — cerebro del AkoeNet Assistant.
 */

import { AKOENET_MODULE_CATALOG } from "./catalog.js";
import { ContextEngine } from "./context.js";
import { PermissionsEngine } from "./permissions.js";

/** @typedef {{ id: string; name: string; version: string; capabilities: string[]; permissions?: string[] }} ModuleManifest */

/** @typedef {'slash'|'message'|'event'|'webhook'} CommandType */

/**
 * @typedef {Object} AssistantCommand
 * @property {string} action
 * @property {CommandType} [type]
 * @property {string|number} serverId
 * @property {string} [userId]
 * @property {string|number} [channelId]
 * @property {Record<string, unknown>} [payload]
 * @property {Record<string, unknown>} [context]
 */

export class ModuleOrchestrator {
  /** @type {Map<string, ModuleManifest>} */
  #modules = new Map();
  /** @type {Map<string, string[]>} */
  #capabilityIndex = new Map();
  /** @type {Set<string>} */
  #activeModules = new Set();

  /**
   * @param {{ contextEngine?: ContextEngine; permissionsEngine?: PermissionsEngine }} [deps]
   */
  constructor(deps = {}) {
    this.contextEngine = deps.contextEngine ?? new ContextEngine();
    this.permissionsEngine = deps.permissionsEngine ?? new PermissionsEngine();
  }

  /**
   * @param {ModuleManifest} manifest
   */
  register(manifest) {
    this.#modules.set(manifest.id, manifest);
    for (const cap of manifest.capabilities) {
      const list = this.#capabilityIndex.get(cap) || [];
      list.push(manifest.id);
      this.#capabilityIndex.set(cap, list);
    }
  }

  /**
   * @param {string[]} moduleIds — módulos activos en el servidor
   */
  setActiveModules(moduleIds) {
    this.#activeModules = new Set(moduleIds);
  }

  /**
   * @param {string} action
   */
  resolveModuleId(action) {
    const exact = this.#capabilityIndex.get(action);
    if (exact?.length) {
      const active = exact.find((id) => this.#activeModules.has(id));
      return active ?? exact[0];
    }
    const prefix = action.split(".")[0];
    for (const [cap, ids] of this.#capabilityIndex) {
      if (cap.startsWith(`${prefix}.`)) {
        const active = ids.find((id) => this.#activeModules.has(id));
        return active ?? ids[0];
      }
    }
    return null;
  }

  /**
   * @param {AssistantCommand} command
   */
  async enrichCommand(command) {
    const enriched = { ...command, context: { ...(command.context || {}) } };
    // ai.ask builds its own lean context in processAssistantAiAsk — skip heavy
    // ContextEngine work on the hot path (esp. before BullMQ enqueue).
    if (command.action === "ai.ask" || command.skipContextEnrich) {
      return enriched;
    }
    if (command.serverId && command.userId) {
      const query =
        typeof command.payload?.message === "string" ? command.payload.message : "";
      enriched.context = {
        ...enriched.context,
        ...(await this.contextEngine.getRelevantContext(
          command.serverId,
          command.userId,
          query,
          command.channelId
        )),
      };
    } else if (command.serverId) {
      enriched.context = {
        ...enriched.context,
        ...(await this.contextEngine.getServerContext(command.serverId)),
      };
    }
    return enriched;
  }

  /**
   * @param {AssistantCommand} command
   * @param {(moduleId: string, command: AssistantCommand) => Promise<unknown>} invoke
   */
  async route(command, invoke) {
    const moduleId = this.resolveModuleId(command.action);
    if (!moduleId) {
      return { ok: false, error: "no_module", action: command.action };
    }

    if (this.#activeModules.size && !this.#activeModules.has(moduleId)) {
      return { ok: false, error: "module_disabled", moduleId, action: command.action };
    }

    if (command.userId) {
      const allowed = await this.permissionsEngine.canExecute(
        command.userId,
        command.serverId,
        command.action
      );
      if (!allowed) {
        return { ok: false, error: "forbidden", moduleId, action: command.action };
      }
    }

    const enriched = await this.enrichCommand(command);
    const result = await invoke(moduleId, enriched);
    return { ok: true, moduleId, result };
  }

  listModules() {
    return [...this.#modules.values()];
  }
}

export function createDefaultOrchestrator(deps) {
  const orchestrator = new ModuleOrchestrator(deps);
  for (const mod of AKOENET_MODULE_CATALOG) {
    orchestrator.register({
      id: mod.id,
      name: mod.name,
      version: "1.0.0",
      capabilities: mod.capabilities,
      permissions: mod.permissions,
    });
  }
  return orchestrator;
}

// Re-export catalog for convenience
export { AKOENET_MODULE_CATALOG, getModuleById, getCapabilityMap } from "./catalog.js";
export { ContextEngine } from "./context.js";
export { PermissionsEngine, permissionForAction } from "./permissions.js";
export { AKOENET_EVENT_TYPES, createAkoeNetEvent, resolveModulesForEvent } from "./events.js";

// Legacy export name
export const AKOENET_ASSISTANT_MODULES = AKOENET_MODULE_CATALOG;
