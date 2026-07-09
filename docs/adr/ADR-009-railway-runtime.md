# ADR-009 — Railway como runtime

## Contexto

Múltiples servicios (Gateway, platform, productos, workers) deben desplegarse con bajo overhead operativo. El equipo es pequeño; Kubernetes sería coste disproportionado.

## Decisión

**Railway** es el runtime estándar para todos los servicios Dakinis en producción:

- Un servicio Railway por bounded context (repo o subcarpeta con `railway.toml` + `Dockerfile`).
- **Private networking** (`*.railway.internal`) para tráfico platform entre servicios.
- **Gateway** como único punto público para APIs platform (`api.dakinissystems.com`).
- Productos pueden tener dominio propio (Core, LifeFlow, AkoeNet) además del gateway.
- **Redis** como plugin Railway compartido (BullMQ, cache).
- **No** Railway Postgres para datos de negocio — ver ADR-002.

Excepción: LifeFlow API usa **SQLite en volume** `/data` hasta migración PostgreSQL.

## Consecuencias

- Deploy = push a `main` + variables en Railway UI.
- `docs/railway.env.example` es la plantilla de variables.
- Catálogo servicios → [`STATUS.md`](../STATUS.md) · deploy → [`OPERATIONS.md`](../OPERATIONS.md).
- Staging espejo pendiente (riesgo R1).
