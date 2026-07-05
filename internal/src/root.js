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
      "POST /events",
      "GET /events/bus/status",
      "GET /events/dlq",
      "POST /events/dlq/replay",
      "POST /events/dlq/discard",
      "GET /hub/dashboard/:userId",
      "POST /notifications/send",
      "POST /search",
    ],
  });
}
