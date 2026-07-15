export { DakinisAI, LifeFlowClient, CoreAdvisorClient, default } from "./modules/ai.js";
export {
  AuthClient,
  BillingClient,
  HubClient,
  WorkspaceClient,
  NotificationsClient,
  StorageClient,
  SearchClient,
  EventsClient,
  KnowledgeClient,
  PlatformClient,
  FeatureFlagsClient,
  TelemetryClient,
} from "./modules/platform.js";
export { createDakinisPlatform } from "./create-platform.js";
export { ContractClient, loadContractClient } from "./clients/contract-client.js";
export {
  BillingServiceClient,
  NotificationsServiceClient,
  SearchServiceClient,
  KnowledgeServiceClient,
  ServiceClient,
} from "./modules/platform-services.js";
