# ADR-013 — Connectors / Integration Platform (Channel Bus)

## Contexto

Delivery empezó como “módulo Glovo/Uber”. Añadir marketplaces con `if (channel)` en OrderService no escala. El mismo patrón hace falta para Payments, Commerce, Reservations, WhatsApp.

## Decisión

Tratar Delivery como el **primer Connector** de una Integration Platform:

```
Connector → Import → Normalize → Validate → Business → Events → Sync
```

- Providers solo implementan superficie mínima (`import` / `updateStatus` / `cancel` / `health`) + resilience declarada.
- Orquestación, precios, pedidos y eventos viven en el core.
- **DeliveryRegistry**: `register` / `resolve` / `list` / `health`.
- **Idempotencia obligatoria**: `provider + external_order_id`.
- Cola de jobs con estados claros y DLQ (`failed` tras retries).
- Contrato documentado en [`architecture/connector-sdk.md`](../architecture/connector-sdk.md).

## Consecuencias

- Nuevo marketplace = adaptador + registro; sin tocar OrderService.
- Stubs partner (Glovo/Uber/Just Eat) + Manual/QA providers para E2E sin violar ToS.
- Extracción futura a paquete `connectors-sdk` compartido entre verticales.
- Detalle operativo: [`domains/hospitality/delivery.md`](../domains/hospitality/delivery.md).
