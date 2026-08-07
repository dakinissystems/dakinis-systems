# Hospitality — UX operativa

> Dominio UX · Shell · TPV · ago 2026  
> ADR Shell → [ADR-012](../../adr/ADR-012-hospitality-shell.md) · Índice → [`../../architecture/README.md`](../../architecture/README.md)

---

## Shell vs módulos

```
HospitalityShell
  → Task Dock · Header · Pulse · Deep Links · Command Palette
  → Modules: Sala · Cocina · Inventario · Delivery · Caja · Config
```

Navegación por **tareas** (Alt+1…6). Un módulo activo.

| Componente hoy | Alias / destino |
|----------------|-----------------|
| `RestaurantDeliveryPanel` | `HospitalityDeliveryModule` |
| `RestaurantTaskDock` | `HospitalityTaskDock` |
| `RestaurantInventoryModule` | `HospitalityInventoryModule` |
| `RestaurantCajaTpvSummary` | `HospitalityCashModule` |

Modo comercial: `?mode=comercial`. Operación: sesión autenticada.

---

## Deep-links

| URL | Destino |
|-----|---------|
| `?task=sala\|floor` | Sala |
| `?task=cocina\|kitchen` | Cocina |
| `?task=inventario\|stock` (+ `sub=…`) | Inventario |
| `?task=delivery` | Delivery |
| `?task=caja` | Caja |
| `?task=config&sub=…` | Config |

---

## Delivery UI

| Vista | Contenido |
|-------|-----------|
| **Operación** | Pedidos activos, health canales, cola/incidencias |
| **Configuración** | Integraciones / tarifas (sin OAuth en cara del encargado) |

## Caja

- Resumen TPV: cobros, total, **dinero inicio de día**, efectivo esperado (inicio + cobros efectivo).
- Persistencia local por negocio + fecha (`restaurantCashFloat.js`).
- Cierre del día muestra las mismas cifras de fondo / esperado.

## i18n (regla UX)

- `t(key, fallback)` admite string de respaldo.
- La UI **no** debe mostrar claves crudas tipo `fermina.viewPedido`.
- Locales ES/EN alineados (`check-locales.mjs`).

---

## Pulse → realtime

```
Hoy       polling ~90s (pausa si 429)
Mañana    SSE
Después   WebSocket
```

---

## Política de estabilidad (ops UX)

- Sin polling redundante ni bucles de render que disparen fetch.
- Idempotencia y backoff en connectors (ver principios).
- Telemetría UX objetivo: abrir mesa &lt;2s · cobrar &lt;15s · escaneo &lt;1s · cerrar caja &lt;30s.

Historial de fixes (429, reporter) → [`../../architecture/changelog/hospitality-2026-08.md`](../../architecture/changelog/hospitality-2026-08.md).

---

## Pendiente

| Ítem | Prioridad |
|------|-----------|
| Hits Ctrl+K con API real | Alta |
| System Health real en header | Media |
| Acciones contextuales mesa | Media |
| Abrir/cerrar caja según turno servidor (hoy float local) | Media |
| Rename Hospitality* completo | Media |
| KDS / escandallo / partner Glovo | Producto |
| SSE/WS | Plataforma |

Command Palette → [`../../architecture/command-palette.md`](../../architecture/command-palette.md)  
Delivery / connectors → [`delivery.md`](./delivery.md)  
CRM → [`../crm/overview.md`](../crm/overview.md)
