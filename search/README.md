# Dakinis Search

**Global search platform** for Hub and products — unified index, scopes and embeddings worker.

> **Status:** repo ✅ · scaffold en GitHub · **Railway:** not deployed yet.

| | |
|---|---|
| **GitHub** | [github.com/dakinissystems/dakinis-search](https://github.com/dakinissystems/dakinis-search) |
| **Railway** | API + Worker (indexer) |
| **Domain (target)** | `search.dakinissystems.com` |
| **Gateway prefix** | `/search/` |
| **Database** | Supabase `hub.search_index` + vector store (roadmap) |

## Scopes (Hub Ctrl+K)

Clients · Invoices · Messages · Events · Documentation · Chats · AI

Canonical UI scopes: `@dakinis/shared-ux/command-palette`.

## Local

```powershell
cd search
npm install
npm run dev
curl "http://localhost:4082/health"
curl "http://localhost:4082/v1/query?q=test&scope=clients"
```

## Deploy (Railway)

1. Connect to [dakinis-search](https://github.com/dakinissystems/dakinis-search).
2. API: `npm start` · Worker: `npm run worker`
3. `REDIS_URL`, `DATABASE_URL`, `OPENAI_API_KEY` (embeddings, later)

## Contracts

[`docs/contracts/search.json`](../docs/contracts/search.json)
