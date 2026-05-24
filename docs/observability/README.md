# Observabilidad — Dakinis Systems

Guía mínima para pasar de logs en consola a stack observable.

## Ya implementado

| Servicio | Qué |
|----------|-----|
| **Core API** | JSON línea en cada request (`structured-logger.js`) |
| **Auth** | JSON en login/errores (`platform/auth/src/utils/structured-logger.js`) |

Formato típico:

```json
{"ts":"2026-05-19T12:00:00.000Z","level":"info","msg":"http_request","method":"GET","path":"/api/health","status":200,"ms":3}
```

## Prioridad alta (recomendado)

### 1. Error tracking — Sentry

```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
```

Integrar en `server.js` / `app.js` de cada producto con `@sentry/node` (solo si `SENTRY_DSN` está definido).

### 2. Logs centralizados

| Opción | Cuándo |
|--------|--------|
| **Railway log drains** | Si todo está en Railway — cero infra |
| **Grafana Loki** | Self-hosted o Grafana Cloud |
| **Better Stack (Logtail)** | SaaS simple, alertas |

### 3. Uptime

- [Better Stack Uptime](https://betterstack.com/uptime) o self-hosted [Uptime Kuma](https://github.com/louislam/uptime-kuma)
- Monitorear: `/auth/health`, `/core/api/health`, `/health` gateway

### 4. Backups Postgres

Script: [`scripts/backup-postgres.ps1`](../scripts/backup-postgres.ps1)

Programar en cron / Task Scheduler diario.

## Métricas (fase 2)

Prometheus scrape en cada API:

```
GET /metrics  →  prometheus-client (Node)
```

Dashboards Grafana: latencia p95, errores 5xx, conexiones Redis, cola workers SA.

## Health checks unificados

| Servicio | Endpoint |
|----------|----------|
| Gateway | `GET /health` |
| Auth | `GET /auth/health` |
| Core | `GET /api/health` |
| StreamAutomator | `GET /api/health/live` |
| AkoeNet | `GET /health` |
| Fitness | `GET /api/health/live` |
