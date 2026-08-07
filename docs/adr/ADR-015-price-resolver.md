# ADR-015 — PriceResolver como strategy

## Contexto

Un único precio de carta no sirve para sala, takeaway y marketplaces (comisiones distintas). Meter reglas de campaña o franquicia dentro de Delivery acoplaría promociones al conector.

## Decisión

Resolver precios con una **strategy pipeline** (`PriceResolver`):

```
Base → Channel rules → Overrides → Campaign* → Coupon* → Taxes* → Final
```

- Implementación actual: `PriceListService` (listas + markup + overrides) detrás de `PriceResolver.js`.
- Delivery solo pide “precio del canal”; no conoce happy hour ni 2x1.
- Campaign / Coupon / Taxes son hooks documentados para fases posteriores.

## Consecuencias

- Añadir promoción o precio de franquicia no requiere tocar providers.
- Tarifas editables por tenant (`tenant_price_lists` / items).
- Métricas de margen / comisión de marketplace quedan en dominio comercial, no en el adaptador Glovo.
