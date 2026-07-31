# Dakinis MCP

Thin [Model Context Protocol](https://modelcontextprotocol.io) server for Cursor: probes platform health, lists workspaces via Internal admin APIs, and searches local docs. **No raw SQL** — only HTTP to configured services + filesystem docs.

## Tools

| Tool | Auth | Description |
|------|------|-------------|
| `platform_health` | optional | Probe `/health` on configured service URLs; optional Internal `/platform/health` |
| `list_workspaces` | service token | `GET /admin/v1/workspaces` |
| `get_workspace` | service token | `GET /admin/v1/workspaces/:id` |
| `search_docs` | none | Local full-text search under `DAKINIS_DOCS_ROOT` |
| `read_doc` | none | Read a markdown file by relative path |

## Setup

```bash
cd tools/dakinis-mcp
npm install
cp .env.example .env   # optional; Cursor usually injects env via mcp.json
```

## Cursor

Add to `.cursor/mcp.json` (project) or Cursor Settings → MCP:

```json
{
  "mcpServers": {
    "dakinis": {
      "command": "node",
      "args": ["D:/dakinis-systems/tools/dakinis-mcp/src/index.js"],
      "env": {
        "DAKINIS_INTERNAL_URL": "https://internal.example.com",
        "DAKINIS_SERVICE_TOKEN": "your-service-key",
        "DAKINIS_DOCS_ROOT": "D:/dakinis-systems/docs",
        "DAKINIS_HUB_URL": "https://hub.example.com",
        "DAKINIS_BILLING_URL": "https://billing.example.com"
      }
    }
  }
}
```

Use absolute paths. Never commit real tokens.

See also [`mcp.cursor.example.json`](./mcp.cursor.example.json).

## Env

| Variable | Required | Default |
|----------|----------|---------|
| `DAKINIS_INTERNAL_URL` | for tenants / aggregate health | `http://127.0.0.1:3100` |
| `DAKINIS_SERVICE_TOKEN` | for admin APIs | — (also accepts `INTERNAL_SERVICE_KEY`) |
| `DAKINIS_DOCS_ROOT` | no | `<repo>/docs` |
| `DAKINIS_HUB_URL`, `DAKINIS_CORE_URL`, `DAKINIS_BILLING_URL`, … | no | empty = skip probe |
| `DAKINIS_MCP_TIMEOUT_MS` | no | `8000` |

## Dev

```bash
npm start
npx @modelcontextprotocol/inspector node src/index.js
```

Log only on **stderr**; stdout is MCP JSON-RPC.

## Scope (v0.1)

In: health probes, workspace list/get, docs search/read.  
Out: suspend/activate, billing mutations, SQL, production write tools.
