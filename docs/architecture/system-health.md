# System Health — bounded context (diseño)

> **Estado:** ⬜ no es un servicio tenant unificado todavía → [`STATUS.md`](../STATUS.md)  
> Hoy: health parcial de Delivery (`GET …/delivery/providers`) + dots de header. Índice → [`README.md`](./README.md)

Todos los verticales necesitan saber si la impresora, WhatsApp, pagos o delivery están vivos. No se consulta ad-hoc desde cada módulo.

---

## Modelo

```
System Health
  ├── API
  ├── Database
  ├── Redis
  ├── Printer
  ├── WhatsApp
  ├── Email
  ├── Payments
  └── Delivery (providers)
```

Cualquier módulo pregunta a **System Health**; no implementa su propio ping.

---

## Estado actual

| Componente | Hoy |
|------------|-----|
| Delivery providers | `GET /api/tenant/…/delivery/providers` (+ dashboard) |
| Header ops | Status dots (impresora / WhatsApp / Glovo) — parcialmente sintéticos |
| API / DB / Redis | Health de plataforma (Gateway / Railway) — fuera del panel tenant |

---

## Objetivo

Un servicio/API tenant:

```
GET /api/tenant/system/health
→ { api, db, redis, printer, whatsapp, email, payments, delivery: [...] }
```

Consumidores: Hospitality Shell header, CRM, Ctrl+K, alertas ops.

---

## Principios

- Un solo lugar de verdad por dependencia.
- Timeouts cortos; degradación graceful (`degraded` ≠ tumbar UI).
- Sin acoplar health de Glovo al OrderService.
