# B10 — Import CSV carta

**Fecha:** 2026-11-26  
**Resultado:** **PASS** — Core [#16](https://github.com/dakinissystems/dakinis-core/pull/16) @ `ba7d6fc`

## Criterio

| Pieza | Estado |
|-------|--------|
| Parser CSV (`,` / `;`, ES/EN, precios `3,50`) | ✅ |
| `GET /api/tenant/restaurant/menu/csv-template` | ✅ |
| `POST /api/tenant/restaurant/menu/csv-import` → `create[]` | ✅ |
| UI Config → Carta: plantilla + file picker | ✅ |
| Checklist en dashboard | ✅ |

## Tests

`node --test api/test/menu-csv.test.js` — 4/4  
