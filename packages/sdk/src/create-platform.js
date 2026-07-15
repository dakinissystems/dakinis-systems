import {
  AuthClient,
  BillingClient,
  HubClient,
  WorkspaceClient,
  NotificationsClient,
  StorageClient,
  SearchClient,
  EventsClient,
  KnowledgeClient,
  FeatureFlagsClient,
  TelemetryClient,
} from "./modules/platform.js";
import { loadContractClient } from "./clients/contract-client.js";
import { CommandBus } from "@dakinis/shared-platform/command-bus";
import { QueryBus } from "@dakinis/shared-platform/query-bus";
import { CacheService } from "@dakinis/shared-platform/cache";
import { platformCapabilities } from "@dakinis/shared-platform/capabilities";

/**
 * Single entry point for products — HTTP clients + CQRS buses + cache + capabilities.
 * @param {{
 *   baseUrl?: string,
 *   apiKey?: string,
 *   fetch?: typeof fetch,
 *   cache?: ConstructorParameters<typeof CacheService>[0],
 * }} [opts]
 */
export function createDakinisPlatform(opts = {}) {
  const clientOpts = {
    baseUrl: opts.baseUrl,
    apiKey: opts.apiKey,
    fetch: opts.fetch,
  };

  return {
    auth: new AuthClient(clientOpts),
    billing: new BillingClient(clientOpts),
    hub: new HubClient(clientOpts),
    workspace: new WorkspaceClient(clientOpts),
    notifications: new NotificationsClient(clientOpts),
    storage: new StorageClient(clientOpts),
    search: new SearchClient(clientOpts),
    events: new EventsClient(clientOpts),
    knowledge: new KnowledgeClient(clientOpts),
    featureFlags: new FeatureFlagsClient(clientOpts),
    telemetry: new TelemetryClient(clientOpts),
    contract: loadContractClient("internal-api", clientOpts),
    commands: new CommandBus(),
    queries: new QueryBus(),
    cache: new CacheService(opts.cache),
    capabilities: platformCapabilities,
  };
}
