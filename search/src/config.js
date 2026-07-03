export const config = {
  port: Number(process.env.PORT) || 4082,
  service: "dakinis-search",
  redisUrl: process.env.REDIS_URL || "",
  indexQueue: process.env.SEARCH_INDEX_QUEUE || "dakinis:search:index",
};

/** Search scopes — align with Hub command palette. */
export const SEARCH_SCOPES = [
  "clients",
  "invoices",
  "messages",
  "events",
  "documentation",
  "chats",
  "ai",
  "all",
];
