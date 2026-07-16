import { createAuthModule } from "@dakinis/sdk-auth";
import { createWorkspaceModule } from "@dakinis/sdk-workspace";
import { createBillingModule } from "@dakinis/sdk-billing";
import { createEventsModule } from "@dakinis/sdk-events";
import { createMetricsModule } from "@dakinis/sdk-metrics";
import { loadContractClient } from "./clients/contract-client.js";
import {
  HubClient,
  NotificationsClient,
  StorageClient,
  SearchClient,
  KnowledgeClient,
  FeatureFlagsClient,
  TelemetryClient,
} from "./modules/platform.js";
import { CommandBus } from "@dakinis/shared-platform/command-bus";
import { QueryBus } from "@dakinis/shared-platform/query-bus";
import { CacheService } from "@dakinis/shared-platform/cache";
import { createPlatformContext } from "@dakinis/shared-platform/platform-context";
import { platformCapabilities } from "@dakinis/shared-platform/capabilities";

/**
 * Modular platform facade — lazy getters, no God Object.
 * Products import `@dakinis/sdk` and call createDakinisPlatform(config).
 *
 * @param {{
 *   baseUrl?: string;
 *   apiKey?: string;
 *   fetch?: typeof fetch;
 *   cache?: ConstructorParameters<typeof CacheService>[0];
 *   product?: string;
 *   user?: { id: string; email?: string };
 *   workspace?: { id: string; slug?: string };
 * }} [opts]
 */
export function createDakinisPlatform(opts = {}) {
  const clientOpts = {
    baseUrl: opts.baseUrl,
    apiKey: opts.apiKey,
    fetch: opts.fetch,
  };

  const ctx = createPlatformContext({
    user: opts.user ?? null,
    workspace: opts.workspace ?? null,
    product: opts.product ?? "sdk",
    cache: null,
  });

  /** @type {ReturnType<typeof createAuthModule> | null} */
  let auth = null;
  /** @type {ReturnType<typeof createWorkspaceModule> | null} */
  let workspace = null;
  /** @type {ReturnType<typeof createBillingModule> | null} */
  let billing = null;
  /** @type {ReturnType<typeof createEventsModule> | null} */
  let events = null;
  /** @type {ReturnType<typeof createMetricsModule> | null} */
  let metrics = null;
  /** @type {HubClient | null} */
  let hub = null;
  /** @type {NotificationsClient | null} */
  let notifications = null;
  /** @type {StorageClient | null} */
  let storage = null;
  /** @type {SearchClient | null} */
  let search = null;
  /** @type {KnowledgeClient | null} */
  let knowledge = null;
  /** @type {FeatureFlagsClient | null} */
  let featureFlags = null;
  /** @type {TelemetryClient | null} */
  let telemetry = null;
  /** @type {ReturnType<typeof loadContractClient> | null} */
  let contract = null;

  const commands = new CommandBus();
  const queries = new QueryBus();
  const cache = new CacheService(opts.cache);

  const platform = {
    /** Request-scoped context (identity, product, correlation). */
    get context() {
      return ctx;
    },

    get auth() {
      if (!auth) auth = createAuthModule(clientOpts);
      return auth;
    },

    get workspace() {
      if (!workspace) workspace = createWorkspaceModule(clientOpts);
      return workspace;
    },

    get billing() {
      if (!billing) billing = createBillingModule(clientOpts);
      return billing;
    },

    get events() {
      if (!events) events = createEventsModule(clientOpts);
      return events;
    },

    get metrics() {
      if (!metrics) metrics = createMetricsModule();
      return metrics;
    },

    get hub() {
      if (!hub) hub = new HubClient(clientOpts);
      return hub;
    },

    get notifications() {
      if (!notifications) notifications = new NotificationsClient(clientOpts);
      return notifications;
    },

    get storage() {
      if (!storage) storage = new StorageClient(clientOpts);
      return storage;
    },

    get search() {
      if (!search) search = new SearchClient(clientOpts);
      return search;
    },

    get knowledge() {
      if (!knowledge) knowledge = new KnowledgeClient(clientOpts);
      return knowledge;
    },

    get featureFlags() {
      if (!featureFlags) featureFlags = new FeatureFlagsClient(clientOpts);
      return featureFlags;
    },

    get telemetry() {
      if (!telemetry) telemetry = new TelemetryClient(clientOpts);
      return telemetry;
    },

    get contract() {
      if (!contract) contract = loadContractClient("internal-api", clientOpts);
      return contract;
    },

    /** @deprecated prefer `command` */
    get commands() {
      return commands;
    },

    get command() {
      return commands;
    },

    /** @deprecated prefer `query` */
    get queries() {
      return queries;
    },

    get query() {
      return queries;
    },

    get cache() {
      return cache;
    },

    capabilities: platformCapabilities,
  };

  return platform;
}
