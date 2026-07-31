#!/usr/bin/env node
/**
 * Dakinis Platform MCP (stdio).
 * Logs go to stderr only — stdout is reserved for MCP JSON-RPC.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config.js";
import { registerHealthTools } from "./tools/health.js";
import { registerTenantTools } from "./tools/tenants.js";
import { registerDocsTools } from "./tools/docs.js";

const server = new McpServer({
  name: "dakinis",
  version: "0.1.0",
});

registerHealthTools(server);
registerTenantTools(server);
registerDocsTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `[dakinis-mcp] ready · internal=${config.internalUrl || "(unset)"} · docs=${config.docsRoot} · auth=${config.serviceToken ? "configured" : "missing"}`,
  );
}

main().catch((err) => {
  console.error("[dakinis-mcp] fatal:", err);
  process.exit(1);
});
