import { config } from "./config.js";
import { renderStatusPage } from "./status-page.js";

export function getRootPage() {
  return renderStatusPage({
    service: config.service,
    title: "Dakinis Search",
    phase: "Scaffold · Roadmap",
    description:
      "Global search API for Hub Ctrl+K and cross-product index. Indexer worker scaffold — no public UI.",
    endpoints: ["GET /health", "GET /v1/query", "POST /v1/index", "DELETE /v1/index/:scope/:id"],
  });
}
