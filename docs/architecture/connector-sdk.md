# Connector SDK — contrato

> Diseño del SDK de conectores · ago 2026  
> Decisión → [ADR-013](../adr/ADR-013-connectors.md) · Delivery → [`../domains/hospitality/delivery.md`](../domains/hospitality/delivery.md)

Este documento describe el **contrato**. La implementación concreta de Glovo/Uber vive en adaptadores, no aquí.

---

## Visión

```
Connector SDK
  ├── Base Provider      import · updateStatus · cancel · health
  ├── Telemetry          latency · failures · retries · duplicates
  ├── Retry / Timeout    resilience declarativa
  ├── Circuit Breaker    failureThreshold · coolDown
  ├── Validation         draft → líneas / ids
  └── Registry           register · resolve · list · health
```

Pipeline del **core** (no del provider):

```
Channel → Import → Normalize → Validate → Create/Business → Events → Sync
```

---

## Superficie mínima del Provider

| Método | Rol |
|--------|-----|
| `importOrder(ctx, raw)` | Raw externo → draft de dominio |
| `updateStatus(ctx, order, status)` | Sync estado hacia el marketplace |
| `cancelOrder(ctx, order, reason?)` | Cancelación hacia el proveedor |
| `health(ctx)` | Conectividad / credenciales |

Helpers actuales (stubs homogéneos): `acceptOrder`, `rejectOrder`, `printFlags`, `mapStatusIn/Out`.

Cada provider declara `resilience`: `timeoutMs`, `retries`, `circuitBreaker`, `rateLimit`.

---

## Registry

```js
dakinisDeliveryRegistry.register(provider)
dakinisDeliveryRegistry.resolve("glovo")
dakinisDeliveryRegistry.list()
await dakinisDeliveryRegistry.health()
```

Instalar un conector nuevo = implementar adaptador + `register`. Sin tocar OrderService.

---

## Garantías exigidas

| Garantía | Norma |
|----------|--------|
| Idempotencia | `provider + external_order_id` |
| Retries | Exponenciales; DLQ tras agotar |
| Health | Agregado tenant: `GET …/delivery/providers` |
| Telemetría | Imports, duplicados, fallos, latencia media |
| QA | Manual + Failure / Stress / Replay disponibles |

---

## Evolución del SDK

Hoy el SDK está embebido en `api/src/modules/hospitality/delivery/` (primer vertical).  
Objetivo: extraer paquete `connectors-sdk` reutilizable por Payments, Commerce, Reservations, WhatsApp — **mismo contrato**.

Código de referencia (Core):

- `DeliveryProvider.js` · `DeliveryRegistry.js` · `DeliveryTelemetry.js` · `DeliveryQueue.js`
