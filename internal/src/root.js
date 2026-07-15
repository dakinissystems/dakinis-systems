import { config } from "./config.js";
import { renderStatusPage } from "./status-page.js";

export function getRootPage() {
  return renderStatusPage({
    service: config.service,
    title: "Dakinis Internal API",
    phase: "Scaffold · Fase 5",
    description:
      "Server-to-server platform API — event bus, profiles, proxies to notifications/search/storage.",
    endpoints: [
      "GET /health",
      "GET /platform/health",
      "GET /platform/metrics",
      "POST /events",
      "GET /events/bus/status",
      "GET /events/dlq",
      "POST /events/dlq/replay",
      "POST /events/dlq/discard",
      "GET /feature-flags/evaluate",
      "GET /hub/dashboard/:userId",
      "GET /hub/dashboard/aggregated/:userId",
      "GET /workspace/summary/:userId",
      "GET /workspaces/me/:userId",
      "GET /akoenet/assistant/modules",
      "POST /akoenet/servers/:serverId/assistant/events",
      "POST /notifications/send",
      "POST /search",
    ],
  });
}
