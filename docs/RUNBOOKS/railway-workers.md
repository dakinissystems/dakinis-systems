# Runbook — Railway workers (AI / Knowledge / Search / Notifications)

## Internal Assistant (`dakinis.ai`)

Segundo servicio del repo **dakinis-internal-api** (BullMQ · `@AI` async).

| Campo | Valor |
|-------|-------|
| Servicio | `dakinis-internal-assistant-worker` |
| Arranque | `WORKER_ROLE=assistant` o `npm run worker:assistant` |
| Config alt. | `railway.worker.toml` |

**Variables:** `REDIS_URL`, `DAKINIS_EVENT_BUS=bullmq`, `DATABASE_URL`, `DATABASE_SSL=true`, `DAKINIS_AI_URL`, `DAKINIS_AI_SERVICE_KEY`, `AKOENET_API_URL`, `SCHEDULER_WEBHOOK_SECRET`, `DAKINIS_INTERNAL_SERVICE_KEY`.

Smoke: chat AkoeNet `@AI hola` → &lt;30s · log `[internal:worker:assistant] done`.

## Knowledge (API + worker)

Repo: [dakinis-knowledge](https://github.com/dakinissystems/dakinis-knowledge) · gateway `/knowledge/` → `:4084`.

### knowledge-api

`PORT=4084` · Start `npm run start:api` · vars: `REDIS_URL`, `DATABASE_URL`, `DATABASE_SSL=true`, `DAKINIS_SEARCH_URL`, `DAKINIS_INTERNAL_SERVICE_KEY`, `STORAGE_*`.

### knowledge-worker

Start `npm run worker` · `WORKER_TYPE=ingest` · `KNOWLEDGE_INGEST_QUEUE=dakinis:knowledge:ingest`.

```powershell
.\scripts\smoke-knowledge.ps1
curl.exe https://api.dakinissystems.com/knowledge/health
```

## Search (`dakinis-search` · 4082)

**API:** `PORT=4082` · `REDIS_URL` · `SEARCH_INDEX_QUEUE=dakinis:search:index`  
**Worker:** `dakinis-search-worker` · `npm run worker` · sin dominio.

Smoke: `.\scripts\smoke-search.ps1`

## Notifications (`dakinis-notifications` · 4081)

**API:** `PORT=4081` · `NOTIFICATIONS_QUEUE=dakinis:notifications`  
**Worker:** `dakinis-notifications-worker` · `npm run worker`.

Smoke: `.\scripts\smoke-notifications.ps1`
