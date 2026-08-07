# ADR-014 — Event Bus de dominio Hospitality

## Contexto

Los módulos (Delivery sync, CRM timeline, WhatsApp, Analytics, KDS) necesitan reaccionar al ciclo de vida de pedidos y caja sin acoplarse entre sí. Hoy el bus hospitality es **in-process** (complementa BullMQ de plataforma, ADR-010).

## Decisión

Existencia de un catálogo de eventos de dominio propio (`modules/hospitality/events/`), independiente de Delivery:

### Ciclo canónico

```
OrderImported → OrderValidated | OrderRejected
OrderCreated → KitchenStarted → KitchenReady
DriverAssigned* → Delivered | Cancelled
RefundRequested* → RefundCompleted*
OrderStatusChanged · OrderPaid
InvoiceCreated → CashClosed
```

\* cuando el flujo de negocio los active.

### Garantías (hoy → objetivo)

| Garantía | Hoy | Objetivo |
|----------|-----|----------|
| **Orden** | Best-effort in-process | Documentar causalidad por agregado (`orderId`) |
| **Idempotencia** | En imports/webhooks (connector) | Consumers idempotentes por `eventId` / clave negocio |
| **Persistencia** | No (in-memory listeners) | Outbox → BullMQ (ADR-010) cuando haya multi-proceso |
| **Reintentos** | En cola Delivery jobs | En consumers del bus persistido |
| **Compatibilidad** | Nombres estables en `DAKINIS_HOSPITALITY_EVENTS` | Versionado solo con ADR nuevo |

Cualquier módulo **escucha eventos**; no pregunta al provider.

## Consecuencias

- CRM puede enriquecer timeline con `OrderCreated` / `Delivered` sin depender del Channel Bus.
- Delivery solo encola sync al reaccionar a `OrderStatusChanged` / `KitchenReady`.
- No mezclar el catálogo de eventos con código de un marketplace concreto.
