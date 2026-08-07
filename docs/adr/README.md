# Architecture Decision Records (ADR)

Registro de decisiones arquitectónicas Dakinis. Formato: **contexto → decisión → consecuencias**.

| ADR | Título |
|-----|--------|
| [ADR-001](./ADR-001-platform-vs-products.md) | Platform vs Products (4 capas) |
| [ADR-002](./ADR-002-supabase-multi-schema.md) | Supabase multi-schema PostgreSQL |
| [ADR-003](./ADR-003-gateway-routing.md) | Gateway routing y JWT |
| [ADR-004](./ADR-004-knowledge-service.md) | Knowledge service separado de AI |
| [ADR-005](./ADR-005-billing-platform.md) | Billing como plataforma |
| [ADR-006](./ADR-006-lifeflow-engine.md) | LifeFlow Engine |
| [ADR-007](./ADR-007-tabletop-mvp.md) | Tabletop MVP |
| [ADR-008](./ADR-008-hub-entry-point.md) | Hub como punto de entrada |
| [ADR-009](./ADR-009-railway-runtime.md) | Railway como runtime |
| [ADR-010](./ADR-010-bullmq-event-bus.md) | BullMQ como bus de eventos |
| [ADR-011](./ADR-011-internal-api-orchestration.md) | Internal API orquestador |
| [ADR-012](./ADR-012-hospitality-shell.md) | Hospitality Shell vs dominio |
| [ADR-013](./ADR-013-connectors.md) | Connectors / Channel Bus |
| [ADR-014](./ADR-014-hospitality-event-bus.md) | Event Bus hospitality |
| [ADR-015](./ADR-015-price-resolver.md) | PriceResolver strategy |

Índice por dominios → [`../architecture/README.md`](../architecture/README.md)

Plantilla para nuevos ADR:

```markdown
# ADR-NNN — Título

## Contexto
…

## Decisión
…

## Consecuencias
…
```
