# ADR-010 — BullMQ como bus de eventos

## Contexto

Servicios deben reaccionar a eventos (pago Stripe, mensaje AkoeNet, ingest Knowledge) sin acoplamiento síncrono HTTP. Necesitamos colas fiables con reintentos.

## Decisión

En producción, **`DAKINIS_EVENT_BUS=bullmq`** sobre **Redis** (Railway plugin):

- Productores publican jobs (Billing webhook, akoenet-backend event bridge, AI worker).
- Consumidores son workers Railway (`npm run worker` o `railway.worker.toml`).
- No usar Redis pub/sub directo para lógica crítica de negocio.

Desarrollo local puede usar el mismo patrón vía `REDIS_URL` en Docker.

## Consecuencias

- Cada servicio con worker documenta colas en [`STATUS.md`](../STATUS.md).
- Fallo de worker = síntoma silencioso (ej. `@AI` sin respuesta) → [`OPERATIONS.md`](../OPERATIONS.md) § Runbook.
- Observabilidad de colas es prioridad post-piloto.
- Alternativas (SQS, NATS) no se adoptan sin ADR nuevo.
