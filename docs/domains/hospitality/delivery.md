# Hospitality — Delivery / Channel Bus

> Primer conector de la Integration Platform · ago 2026  
> ADR → [ADR-013](../../adr/ADR-013-connectors.md) · SDK → [`../../architecture/connector-sdk.md`](../../architecture/connector-sdk.md) · Eventos → [ADR-014](../../adr/ADR-014-hospitality-event-bus.md)

---

## Pipeline

```
Channel → Import → Normalize → Validate → Create Order → Events → Sync
```

Provider mínimo: `importOrder` · `updateStatus` · `cancelOrder` · `health`.  
**Nunca** `if (channel === "glovo")` en OrderService.

---

## Código (Core)

```
api/src/modules/hospitality/
  events/                 # Event Bus dominio (ADR-014)
  delivery/
    DeliveryProvider.js
    DeliveryRegistry.js
    DeliveryService.js
    DeliveryQueue.js
    DeliveryTelemetry.js
    providers/            # Manual · Glovo · Uber · JustEat · QA
  print/                  # PrintAdapter · KitchenPrinter (independiente)
  PriceResolver.js
```

---

## Resiliencia (obligatorio)

- Idempotencia `provider + external_order_id`
- Retries exponenciales · timeouts · circuit breaker declarado · rate limit
- Health checks · telemetría · DLQ (`tenant_delivery_jobs.status = failed`)

---

## API tenant

| Método | Ruta |
|--------|------|
| GET | `/api/tenant/restaurant/delivery/dashboard` |
| GET | `/api/tenant/restaurant/delivery/providers` |
| GET/PATCH | `/api/tenant/restaurant/delivery/integrations[/:provider]` |
| POST | `/api/tenant/restaurant/delivery/simulate` |
| GET | `/api/tenant/restaurant/delivery/jobs` → `{ jobs, counts }` |
| GET/PATCH | `/api/tenant/restaurant/price-lists[/:key]` |

Alias `/api/tenant/hospitality/...`.

Webhooks: `POST /api/integrations/{provider}/webhook?business={slug}`

Jobs: `pending` · `running` · `retry` · `failed` · `completed`

---

## PriceResolver

Ver [ADR-015](../../adr/ADR-015-price-resolver.md).

---

## UI Delivery

| Vista | Contenido |
|-------|-----------|
| **Operación** | Pedidos activos · health agregado · cola/incidencias · simular |
| **Configuración** | Enable integraciones · tarifas (PriceResolver) |

Componente: `RestaurantDeliveryPanel.jsx` · alias `HospitalityDeliveryModule.jsx`  
Deep-link: `?task=delivery`

---

## Legal

Glovo / Uber Eats / Just Eat: stubs hasta API partner. Manual + QA validan E2E sin incumplir ToS.

---

## Roadmap técnico

1. Enforcement runtime timeout / circuit breaker en llamadas partner  
2. BullMQ si `REDIS_URL`  
3. GlovoProvider real  
4. Packaging / comisión en margen  
5. Métricas por canal (no MVP)
