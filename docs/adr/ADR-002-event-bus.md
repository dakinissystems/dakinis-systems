# ADR-002: Event bus in-process + Redis Streams

**Estado:** Aceptado (fase 1)  
**Fecha:** 2026-05

## Contexto

Productos (Core, SA, AkoeNet) se acoplaban con llamadas directas.

## Decisión

- `dakinisPublishEvent()` in-process por defecto.
- `DAKINIS_EVENT_BUS=redis` publica a Redis Streams.
- Consumidores in-process: audit, analytics (logs), notifications (futuro).

## Eventos Core (implementados)

`tenant.created`, `tenant.updated`, `user.login`, `booking.created`, `crm.lead.created`, `message.sent`

## No hacer aún

Event sourcing, CQRS, RabbitMQ dedicado.
