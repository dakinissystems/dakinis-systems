import { config } from "./config.js";
import { renderStatusPage } from "./status-page.js";

export function getRootPage() {
  return renderStatusPage({
    service: config.service,
    title: "Dakinis Notifications",
    phase: "Scaffold · Fase 5–6",
    description:
      "Cross-product notifications (email, push, in-app inbox). Worker + API scaffold — no public UI.",
    endpoints: ["GET /health", "POST /v1/send (501)", "GET /v1/inbox/:userId (501)"],
  });
}
