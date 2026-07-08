# Marketplace — producto de plataforma (diseño)

> **Julio 2026** · 🔵 Post-ingresos recurrentes. No es roadmap inmediato.  
> Hub futuro · Capacidades → [`PLATFORM-CAPABILITIES.md`](./PLATFORM-CAPABILITIES.md) · Estrategia → [`company/STRATEGY.md`](./company/STRATEGY.md)

El Marketplace no es un “plugin store” de Dakinis One. Es la **capa de extensibilidad del ecosistema** — comparable en concepto al Atlassian Marketplace o Zoho Marketplace, no a una tienda de temas WordPress.

---

## Por qué existe (visión)

| Problema | Marketplace resuelve |
|----------|---------------------|
| Cada cliente pide integraciones custom | Conectores y templates reutilizables |
| Nuevos verticales sin nuevos productos | Apps de terceros o Dakinis |
| Recurrencia más allá de suscripción base | Revenue share · listings premium |

**No construir antes del piloto.** Documentar ahora evita improvisar después.

---

## Qué se publica

| Tipo | Ejemplos | Consumidor |
|------|----------|------------|
| **Apps** | Extensión Dakinis One (vertical peluquería) | Workspace con producto activo |
| **Templates** | Onboarding restaurante, flujo CRM | Hub Admin al crear workspace |
| **AI Agents** | Agente soporte, agente inventario | AI Platform + Knowledge |
| **Automations** | Cuando factura → Slack + email | Events + Notifications |
| **Themes** | Branding Hub / Core | Workspace settings |
| **Widgets** | Widget Hub Mi día (LifeFlow score) | Hub dashboard |
| **Connectors** | Zapier-like, webhooks predefinidos | [`PLATFORM-INTEGRATIONS.md`](./PLATFORM-INTEGRATIONS.md) |

---

## Arquitectura conceptual

```
Marketplace (catálogo global)
      ↓
Workspace install (workspace_apps)
      ↓
Feature flags + Billing add-on
      ↓
Producto / Hub consume vía Platform APIs
```

| Componente | Responsable |
|------------|-------------|
| Catálogo + versiones | Platform (schema `meta` o `marketplace`) |
| Instalación por workspace | Hub Admin |
| Permisos | Identity + workspace roles |
| Facturación add-on | Billing |
| Runtime | Internal API + Events |

---

## Modelo de negocio

| Modelo | Descripción |
|--------|-------------|
| Gratis | Templates Dakinis, widgets core |
| Pago único | Template vertical premium |
| Suscripción add-on | App de tercero |
| Revenue share | 70/30 o similar con partners |

Detalle pricing platform → [`company/PRICING-STRATEGY.md`](./company/PRICING-STRATEGY.md)

---

## Fases

| Fase | Entregable | Cuándo |
|------|------------|--------|
| 0 | Este doc + placeholder Hub UI | Jul 2026 ✅ doc |
| 1 | Templates internos (restaurante demo) | Tras piloto |
| 2 | Widget registry público en Hub | 5+ clientes |
| 3 | Partner onboarding + revenue share | Con MRR estable |
| 4 | Store externo `marketplace.dakinissystems.com` | Escala |

---

## Comparativa

| Plataforma | Marketplace | Dakinis (objetivo) |
|------------|-------------|-------------------|
| Atlassian | Apps Jira/Confluence | Apps + automations + IA agents |
| Zoho | Zoho Marketplace | Conectores + verticales PYME |
| Shopify | App store | N/A — no somos e-commerce platform |
| Odoo | Apps ERP | Un producto entre varios, no ERP monolítico |

---

## Pregunta guía

*¿El Marketplace mejora el recorrido del primer cliente piloto?*

→ **No.** Posponer hasta Billing E2E + cliente pagando.

---

*Actualizar al definir schema SQL o UI Hub MVP.*
