# Dakinis Internal API

API **server-to-server** de plataforma para productos (Hub dashboard, eventos, proxies a Search/Billing/Notifications).

> **No** consumir desde el navegador en producción. El Hub u otros frontends deben usar su propio BFF/proxy.

| | |
|---|---|
| **GitHub** | [dakinis-internal-api](https://github.com/dakinissystems/dakinis-internal-api) |
| **Gateway** | `https://api.dakinissystems.com/internal/` |
| **Health** | `GET /internal/health` · local `:4083` |
| **Auth** | `Authorization: Bearer $DAKINIS_INTERNAL_SERVICE_KEY` |
| **Contrato** | [internal-api.json](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/contracts/internal-api.json) |

## Rutas (resumen)

| Método | Path | Notas |
|--------|------|-------|
| GET | `/health` | Liveness |
| GET | `/hub/dashboard/:userId` | Dashboard Hub |
| POST/GET | `/events` | Cola / recientes |
| POST | `/notifications/send` | Proxy |
| POST | `/search` | Proxy |
| GET | `/billing/plans` | Proxy |

## Local

```powershell
npm install
cp .env.example .env
npm run dev
```

```powershell
curl http://localhost:4083/health
```

## Seguridad

- Service key compartida solo entre backends de confianza.
- Validar permisos por recurso en cada handler (el Bearer no implica acceso total a todos los `userId`).
- No documentar valores reales de claves. DNS internos Railway solo para ops.

## Docs canónicas

Estado → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) ·
Mapa → [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) ·
Ops → [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) ·
Índice → [docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs)
