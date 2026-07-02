import { config, CHANNELS } from "./config.js";

export const routes = {
  "GET /health": () => ({
    status: 200,
    body: {
      ok: true,
      service: config.service,
      version: "0.1.0-scaffold",
      redis: config.redisUrl ? "configured" : "not_configured",
      channels: CHANNELS,
    },
  }),

  "POST /v1/send": () => ({
    status: 501,
    body: {
      error: "not_implemented",
      message: "Enqueue notification — wire to BullMQ worker",
      queue: config.queueName,
    },
  }),

  "GET /v1/preferences/:userId": () => ({
    status: 501,
    body: { error: "not_implemented", message: "User channel preferences" },
  }),

  "GET /v1/inbox/:userId": () => ({
    status: 501,
    body: { error: "not_implemented", message: "In-app inbox for Hub + products" },
  }),
};
