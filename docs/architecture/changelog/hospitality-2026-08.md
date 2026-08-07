# Changelog técnico — Hospitality / CRM (ago 2026)

> Historial de incidentes y fixes · **no es un ADR**  
> Decisiones → [`../README.md`](../README.md) · `docs/adr/`

---

## 2026-08-07 — Tormenta 429 + alertas falsas

| Síntoma | Causa | Fix |
|---------|-------|-----|
| 429 masivos inventory/menu/floor | Bucle `reload` ↔ `locationId` en lotes + pulse agresivo | `InventoryLotsPanel` (locationId vía ref); pulse 2 calls / 90s + pausa 60s si 429 |
| CRITICAL email «Error al cargar lotes… Failed to fetch / API_UPSTREAM» | Tormenta 429 → Failed to fetch → `reportTenantLoadAlert` | Reporter ignora infra / 429 / `API_UPSTREAM`; eliminar alerta vieja en UI si queda |

## 2026-08-07 — CRM 404

| Síntoma | Causa | Fix |
|---------|-------|-----|
| `/api/v1/crm/meta` 404 | Rutas inexistentes + cliente con `VITE_API_*` Railway baked | `tenant-crm.js` + `crm.js` vía `dakinisTenantJsonFetch`; migración `057_tenant_crm_core.sql` |

## 2026-08-08 — Channel Bus / docs de dominio

Promoción de notas TEMP a arquitectura canónica (`docs/architecture`, `docs/domains`, ADR-012…015).  
Código Core: Registry, idempotencia, `GET …/providers`, cola con estados, eventos, PriceResolver, PrintAdapter stub, QA providers.

## 2026-08-08 — i18n + caja inicio de día

| Síntoma / pedido | Causa / alcance | Fix |
|------------------|-----------------|-----|
| Botones con texto `fermina.viewPedido` / `ns.key` | `t(key, "fallback")` trataba el 2º arg como vars; claves ausentes devolvían la key | `LocaleContext`: fallback string + humanize; locales Delivery/Caja; bloque `restaurant` duplicado en `en.js` eliminado |
| Falta dinero de apertura de caja | No había fondo de inicio | `RestaurantCajaTpvSummary` + cierre: inicio de día, efectivo esperado; `restaurantCashFloat.js` (localStorage por negocio/día) |

Pushed: Core `feat/restaurant-stock-ops-alerts` · Docs `chore/ops-alert-env-and-ai-usage`.
