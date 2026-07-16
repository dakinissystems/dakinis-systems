/**
 * Typed QueryMap — response inference for TypeScript consumers.
 * Extend PlatformQueryMap (or define your own) as BFF queries grow.
 */

export type QueryDef<P, R> = {
  params: P;
  response: R;
};

/** Placeholder shapes — refine when DTO generator covers these endpoints. */
export type HubDashboardAggregated = Record<string, unknown>;
export type WorkspaceSummary = Record<string, unknown>;
export type PlatformHealth = Record<string, unknown>;

export type PlatformQueryMap = {
  "hub.dashboard.aggregated": QueryDef<
    { userId: string; fresh?: string | boolean },
    HubDashboardAggregated
  >;
  "workspace.summary": QueryDef<
    { userId: string; fresh?: string | boolean },
    WorkspaceSummary
  >;
  "platform.health": QueryDef<{ fresh?: string | boolean }, PlatformHealth>;
};

export type QueryOf<M extends Record<string, QueryDef<unknown, unknown>>, T extends keyof M> = {
  type: T;
  params: M[T]["params"];
  metadata: Record<string, unknown>;
};

export type QueryParamSchema = { required?: string[]; optional?: string[] };
export type QueryDefinition = { params?: QueryParamSchema };
export type QueryMapDefinitions = Record<string, QueryDefinition>;

export declare const PLATFORM_QUERY_MAP: QueryMapDefinitions;

export declare function defineQueryMap(definitions: QueryMapDefinitions): {
  definitions: QueryMapDefinitions;
  types: readonly string[];
  create(type: string, params?: Record<string, unknown>, metadata?: Record<string, unknown>): {
    type: string;
    params: Record<string, unknown>;
    metadata: Record<string, unknown>;
  };
  assertRegistered(bus: { handlers: Map<string, unknown> }): void;
  has(type: string): boolean;
};

export declare const platformQueries: ReturnType<typeof defineQueryMap>;

export declare function createMappedQuery<T extends keyof PlatformQueryMap>(
  type: T,
  params: PlatformQueryMap[T]["params"],
  metadata?: Record<string, unknown>
): QueryOf<PlatformQueryMap, T>;

export declare function createMappedQuery(
  type: string,
  params?: Record<string, unknown>,
  metadata?: Record<string, unknown>
): {
  type: string;
  params: Record<string, unknown>;
  metadata: Record<string, unknown>;
};
