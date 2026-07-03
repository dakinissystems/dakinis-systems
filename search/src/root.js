import { config } from "./config.js";
import { renderStatusPage } from "./status-page.js";

export function getRootPage() {
  return renderStatusPage({
    service: config.service,
    title: "Dakinis Search",
    phase: "Scaffold · Roadmap",
    description:
      "Global search API for Hub Ctrl+K and cross-product index. Indexer worker scaffold — no public UI.",
    endpoints: ["GET /health", "GET /v1/query (501)", "POST /v1/index (501)"],
  });
}
