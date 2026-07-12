# Dakinis Studio API

Facade for Session Manager + File Sync. OpenAPI: [`openapi.yaml`](./openapi.yaml).

## Run

```powershell
cd projects/studio/api
npm run dev
```

## Smoke

```powershell
curl http://127.0.0.1:4090/v1/health
curl http://127.0.0.1:4090/v1/sessions
curl http://127.0.0.1:4090/v1/catalog/runtimes
curl "http://127.0.0.1:4090/v1/sessions/00000000-0000-4000-a000-000000000001/files/read?path=package.json"
```

MVP uses in-memory store with one demo session. Production → Postgres + Redis.
