# Dakinis Internal API

**Platform Internal API** — server-to-server surface for products (never browser-direct in prod).

| | |
|---|---|
| **Gateway prefix** | `/internal/` |
| **Local port** | `4083` |
| **Auth** | `Authorization: Bearer $DAKINIS_INTERNAL_SERVICE_KEY` |

## Routes (scaffold)

| Method | Path | Status |
|--------|------|--------|
| GET | `/health` | ✅ |
| POST | `/events` | ✅ Redis queue |
| GET | `/events` | ✅ recent |
| GET | `/users/:id` | ✅ stub |
| GET | `/profile/:userId` | ✅ stub |
| POST | `/notifications/send` | 501 → notifications service |
| POST | `/search` | 501 → search service |

## Local

```powershell
cd internal
npm install
npm run dev
curl http://localhost:4083/health
curl -X POST http://localhost:4083/events -H "Content-Type: application/json" -d "{\"event\":\"user.created\",\"payload\":{\"id\":\"1\"}}"
```

Via gateway: `http://localhost/internal/health`

Contrato: [`docs/contracts/internal-api.json`](../docs/contracts/internal-api.json)
