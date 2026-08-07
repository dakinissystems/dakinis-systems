# CRM Core

> Bounded context independiente · ago 2026  
> Índice arquitectura → [`../../architecture/README.md`](../../architecture/README.md)

Hospitality puede **consumir** CRM. CRM **no** depende de Hospitality.

---

## Alcance

Contactos, empresas, actividades y timeline multi-tenant.

**Fuera de scope:** Delivery, Sala, Caja, Pulse hospitality.

---

## API v1

| Método | Ruta |
|--------|------|
| GET | `/api/v1/crm/meta` → `{ crmReady }` |
| GET/POST | `/api/v1/crm/contacts` |
| GET | `/api/v1/crm/contacts/:id` |
| GET | `/api/v1/crm/contacts/:id/timeline` |
| POST | `/api/v1/crm/contacts/:id/activities` |
| GET/POST | `/api/v1/crm/companies` |

- Handlers: `api/src/api/tenant-crm.js` (Core)
- Front: `web/src/services/crm.js` → `dakinisTenantJsonFetch`
- UI: `/app/crm` · `CrmPage.jsx`

Sin tablas → `crmReady: false` / listas vacías (**no** 404).

---

## Datos

| Tabla | Uso |
|-------|-----|
| `tenant_crm_companies` | Empresas |
| `tenant_crm_contacts` | Contactos |
| `tenant_crm_activities` | Actividades / timeline |

Migración: [`../../supabase/migrations/057_tenant_crm_core.sql`](../../supabase/migrations/057_tenant_crm_core.sql)  
(omite schemas sin `business`)

---

## Integración con Hospitality

Escuchar eventos de dominio (`OrderCreated`, `Delivered`, `Cancelled`) para timeline — **sin** acoplar CRM al Channel Bus de Delivery.

Incidentes históricos → [`../../architecture/changelog/hospitality-2026-08.md`](../../architecture/changelog/hospitality-2026-08.md).
