# Core Platform (Dakinis One)

> Plataforma dentro del producto Core · ago 2026  
> Capas globales → [`../ARCHITECTURE.md`](../ARCHITECTURE.md) · Índice → [`../architecture/README.md`](../architecture/README.md)

---

## Qué es

```
Dakinis Platform (org)
  └── Core / Dakinis One (producto)
        ├── Core Platform     auth tenant · multi-tenant · permisos · telemetría · config · Ctrl+K
        ├── Hospitality       shell + módulos ops
        ├── CRM               bounded context
        ├── Connectors        Delivery hoy → Payments / Commerce…
        └── System Health     dependencias agregadas
```

Core Platform **no** es “el restaurante”: es la base sobre la que montan verticales.

---

## Piezas

| Pieza | Doc |
|-------|-----|
| Principios | [`../architecture/principles.md`](../architecture/principles.md) |
| Command Palette | [`../architecture/command-palette.md`](../architecture/command-palette.md) |
| System Health | [`../architecture/system-health.md`](../architecture/system-health.md) |
| Connector SDK | [`../architecture/connector-sdk.md`](../architecture/connector-sdk.md) |
| Hospitality | [`../domains/hospitality/ux.md`](../domains/hospitality/ux.md) |
| CRM | [`../domains/crm/overview.md`](../domains/crm/overview.md) |

---

## Relación con platform services

Auth IdP, Billing, Hub, Gateway, Redis/BullMQ siguen siendo **platform services** de la org ([`SYSTEMS.md`](../SYSTEMS.md)).  
Core Platform = capacidades embebidas en el producto Core que otros dominios del mismo producto reutilizan.
