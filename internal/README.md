# Dakinis Internal API

**Platform Internal API** — server-to-server surface for products (never browser-direct in prod).

| | |
|---|---|
| **GitHub** | [dakinissystems/dakinis-internal-api](https://github.com/dakinissystems/dakinis-internal-api) |
| **Gateway prefix** | `/internal/` |
| **Local port** | `4083` |
| **Railway DNS** | `dakinis-internal-api.railway.internal:4083` |
| **Auth** | `Authorization: Bearer $DAKINIS_INTERNAL_SERVICE_KEY` |

## Routes

| Method | Path | Status |
|--------|------|--------|
| GET | `/health` | ✅ |
| GET | `/hub/dashboard/:userId` | ✅ Supabase `hub.v1_get_dashboard` |
| POST | `/events` | ✅ Redis queue |
| GET | `/events` | ✅ recent |
| POST | `/notifications/send` | ✅ proxy |
| POST | `/search` | ✅ proxy |
| GET | `/billing/plans` | ✅ proxy |

## Local

```powershell
cd internal
npm install
npm run dev
curl http://localhost:4083/health
```

Via gateway: `https://api.dakinissystems.com/internal/health`

Contrato (control repo): `docs/contracts/internal-api.json`

## Documentación del ecosistema

Canónica en [dakinis-systems/docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs):

| Doc | Contenido |
|-----|-----------|
| [Índice](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/README.md) | Source of truth |
| [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) | Mapa productos / plataforma |
| [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) | Estado / go-live |
| [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) | Deploy, health, monitorización |
| [SECURITY](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SECURITY.md) | Checklist seguridad P0–P1 |
| [ARCHITECTURE](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/ARCHITECTURE.md) | Arquitectura |
