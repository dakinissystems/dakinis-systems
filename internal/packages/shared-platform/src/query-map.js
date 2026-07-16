/**
 * Typed QueryMap — registry + factory with param validation.
 * TypeScript consumers: see query-map.d.ts for inference.
 */

import { createQuery as createRawQuery } from "./query-bus.js";

/**
 * @typedef {{ required?: string[]; optional?: string[] }} QueryParamSchema
 * @typedef {{ params?: QueryParamSchema }} QueryDefinition
 * @typedef {Record<string, QueryDefinition>} QueryMapDefinitions
 */

/**
 * Canonical platform BFF queries (extend as handlers grow).
 * @type {QueryMapDefinitions}
 */
export const PLATFORM_QUERY_MAP = {
  "hub.dashboard.aggregated": {
    params: { required: ["userId"], optional: ["fresh"] },
  },
  "workspace.summary": {
    params: { required: ["userId"], optional: ["fresh"] },
  },
  "platform.health": {
    params: { required: [], optional: ["fresh"] },
  },
};

/**
 * @param {QueryMapDefinitions} definitions
 */
export function defineQueryMap(definitions) {
  const types = Object.freeze(Object.keys(definitions));

  /**
   * @param {string} type
   * @param {Record<string, unknown>} [params]
   * @param {Record<string, unknown>} [metadata]
   */
  function create(type, params = {}, metadata = {}) {
    const def = definitions[type];
    if (!def) {
      throw new Error(`query_unknown:${type}`);
    }
    const required = def.params?.required || [];
    for (const key of required) {
      const value = params?.[key];
      if (value === undefined || value === null || value === "") {
        throw new Error(`query_param_required:${type}:${key}`);
      }
    }
    return createRawQuery(type, params, metadata);
  }

  /**
   * @param {import('./query-bus.js').QueryBus} bus
   */
  function assertRegistered(bus) {
    const missing = [];
    for (const type of types) {
      if (!bus.handlers.has(type)) missing.push(type);
    }
    if (missing.length) {
      throw new Error(`query_handlers_missing:${missing.join(",")}`);
    }
  }

  return {
    definitions,
    types,
    create,
    assertRegistered,
    has(type) {
      return Object.prototype.hasOwnProperty.call(definitions, type);
    },
  };
}

export const platformQueries = defineQueryMap(PLATFORM_QUERY_MAP);

/**
 * Typed createQuery bound to PLATFORM_QUERY_MAP.
 * @param {keyof typeof PLATFORM_QUERY_MAP | string} type
 * @param {Record<string, unknown>} [params]
 * @param {Record<string, unknown>} [metadata]
 */
export function createMappedQuery(type, params = {}, metadata = {}) {
  return platformQueries.create(type, params, metadata);
}
