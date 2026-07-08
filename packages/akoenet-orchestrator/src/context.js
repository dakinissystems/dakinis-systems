/**
 * Context Engine — estado del servidor para IA y módulos.
 * Cache Redis (5 min) + lectura Supabase vía adaptadores inyectados.
 */

const DEFAULT_TTL_SEC = 300;

export class ContextEngine {
  /**
   * @param {{ redis?: { get: (k: string) => Promise<string|null>; setex: (k: string, ttl: number, v: string) => Promise<unknown> }; fetchServer?: (serverId: string) => Promise<Record<string, unknown>|null>; fetchMember?: (serverId: string, userId: string) => Promise<Record<string, unknown>|null>; fetchRecentMessages?: (serverId: string, channelId: string, limit?: number) => Promise<unknown[]>; searchKnowledge?: (serverId: string, query: string) => Promise<unknown[]> }} adapters
   */
  constructor(adapters = {}) {
    this.redis = adapters.redis ?? null;
    this.fetchServer = adapters.fetchServer ?? (async () => null);
    this.fetchMember = adapters.fetchMember ?? (async () => null);
    this.fetchRecentMessages = adapters.fetchRecentMessages ?? (async () => []);
    this.searchKnowledge = adapters.searchKnowledge ?? (async () => []);
  }

  cacheKey(serverId) {
    return `akoenet:context:server:${serverId}`;
  }

  /**
   * @param {string|number} serverId
   */
  async getServerContext(serverId) {
    const id = String(serverId);
    if (this.redis) {
      const cached = await this.redis.get(this.cacheKey(id));
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          /* rebuild */
        }
      }
    }

    const server = await this.fetchServer(id);
    const context = {
      serverId: id,
      server: server ?? { id, name: "Server" },
      fetchedAt: new Date().toISOString(),
    };

    if (this.redis) {
      await this.redis.setex(this.cacheKey(id), DEFAULT_TTL_SEC, JSON.stringify(context));
    }
    return context;
  }

  /**
   * @param {string|number} serverId
   * @param {string} userId
   * @param {string} [query]
   */
  async getRelevantContext(serverId, userId, query = "") {
    const [serverCtx, member, recentMessages, knowledge] = await Promise.all([
      this.getServerContext(serverId),
      this.fetchMember(String(serverId), userId),
      this.fetchRecentMessages(String(serverId), "", 50),
      query ? this.searchKnowledge(String(serverId), query) : Promise.resolve([]),
    ]);

    return {
      ...serverCtx,
      user: member ?? { userId },
      recentMessages,
      knowledge,
      summary: buildContextSummary({ server: serverCtx.server, user: member, recentMessages, knowledge }),
    };
  }
}

/**
 * @param {{ server?: Record<string, unknown>; user?: Record<string, unknown>|null; recentMessages?: unknown[]; knowledge?: unknown[] }} parts
 */
function buildContextSummary(parts) {
  const name = parts.server?.name ?? "servidor";
  const msgCount = parts.recentMessages?.length ?? 0;
  const docs = parts.knowledge?.length ?? 0;
  return `Contexto de ${name}: ${msgCount} mensajes recientes, ${docs} fragmentos de knowledge.`;
}
