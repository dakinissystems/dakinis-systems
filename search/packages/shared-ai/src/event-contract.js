/**
 * Versioned domain event envelope for platform bus + outbox.
 */

import { randomUUID } from "node:crypto";

/** @typedef {{
 *   event: string,
 *   schemaVersion: number,
 *   timestamp: string,
 *   payload: object,
 *   metadata: {
 *     correlationId: string,
 *     causationId?: string,
 *     workspaceId?: string,
 *     tenantId?: string,
 *     actorId?: string,
 *     source: string,
 *   },
 * }} DomainEventEnvelope
 */

/**
 * @param {string} event
 * @param {object} payload
 * @param {{
 *   source: string,
 *   schemaVersion?: number,
 *   correlationId?: string,
 *   causationId?: string,
 *   workspaceId?: string,
 *   tenantId?: string,
 *   actorId?: string,
 *   userId?: string,
 * }} meta
 * @returns {DomainEventEnvelope}
 */
export function createDomainEvent(event, payload, meta) {
  return {
    event,
    schemaVersion: meta.schemaVersion ?? 1,
    timestamp: new Date().toISOString(),
    payload: payload || {},
    metadata: {
      correlationId: meta.correlationId || randomUUID(),
      causationId: meta.causationId,
      workspaceId: meta.workspaceId,
      tenantId: meta.tenantId || meta.userId,
      actorId: meta.actorId || meta.userId,
      source: meta.source,
    },
  };
}

/** @deprecated use createDomainEvent */
export function createPlatformEvent(type, payload, meta = {}) {
  return createDomainEvent(type, payload, {
    source: meta.source || "unknown",
    tenantId: meta.tenantId,
    actorId: meta.userId,
    userId: meta.userId,
  });
}
