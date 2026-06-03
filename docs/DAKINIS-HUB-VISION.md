# Dakinis Hub — visión de plataforma

> **Documento estratégico** (mayo 2026). No es un plan de implementación comprometido; complementa [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`platform/core/DAKINIS_ARCHITECTURE.md`](../platform/core/DAKINIS_ARCHITECTURE.md) y [`PRODUCTION-CHECKLIST-TEMP.md`](./PRODUCTION-CHECKLIST-TEMP.md).

---

## De productos sueltos a plataforma

Tras leer la documentación y el código actual, Dakinis Systems no es solo una web corporativa ni un ERP aislado. Es el **embrión de un ecosistema SaaS multi-producto**: Core, Auth, AkoeNet, StreamAutomator, Landing, Gateway centralizado, Supabase, Railway y **multi-tenant** por `business_id`.

La pregunta estratégica deja de ser solo «qué funcionalidad añadir» y pasa a ser **cómo convertir Dakinis en una plataforma difícil de copiar**.

Hoy el usuario percibe **productos separados**. El objetivo es unificar la experiencia sin romper los repos ni los despliegues actuales.

---

## Dakinis Hub (prioridad estratégica)

### Concepto

Un **dashboard central** — el «inicio» tras el login — desde el que se activan y abren módulos, en lugar de vender «otra app más».

```
Mi Empresa
├ CRM
├ Inventario
├ Restaurante
├ StreamAutomator
├ AkoeNet
├ Facturación
├ Usuarios
└ Configuración
```

Referencias de mercado: Microsoft 365, Google Workspace, Zoho One — **marketplace de módulos**, no catálogo de URLs dispares.

### Modelo comercial propuesto

Vender **módulos activables**, no un monolito:

| Módulo (ejemplo) | Precio orientativo |
|------------------|-------------------|
| Inventario | 19 €/mes |
| Restaurante | 49 €/mes |
| CRM | 49 €/mes |
| WhatsApp | 49 €/mes |
| Reservas | 49 €/mes |
| IA empresarial | 99 €/mes |
| StreamAutomator | (producto SA) |
| Comunidad (AkoeNet) | (producto AkoeNet) |

Encaja con la arquitectura actual: tabla `business`, campo `plan`, catálogo [`plan-modules.js`](../platform/core/shared/catalog/plan-modules.js) (`starter` / `growth` / `pro`) y gateo API en [`plan-access.js`](../platform/core/api/src/api/plan-access.js).

---

## Constructor de negocio (onboarding)

Flujo «Crear negocio» con preguntas guiadas:

- ¿Qué negocio tienes? → Restaurante · Clínica · Tienda · Gimnasio · Academia · Otro

El sistema **genera automáticamente** (objetivo):

- Menús y plantillas de panel  
- Roles operativos  
- Dashboard y KPIs de ejemplo  
- Módulos habilitados según vertical  
- CRM integrado (mínimo viable)

Hoy existe: registro `business` + `type` (vertical), [`system-registry`](../platform/core/shared/catalog/), seeds por tenant, `POST /api/platform/businesses`, rutas `/sistema/:vertical` y mockups `/vista/:vertical`. **Falta** el asistente unificado post-login y la generación automática end-to-end.

---

## CRM unificado (alto retorno)

Paneles operativos (restaurante: mesas, stock, pedidos) avanzan; el **CRM transversal** está menos visible para el tenant.

Campos objetivo por contacto:

- Cliente / Empresa  
- Teléfono · Email · Estado (lead, activo, perdido, VIP)

Conexiones deseables:

- WhatsApp · Correo · Reservas · WhatsApp Business API  

Automatizaciones de alto valor (ejemplos):

| Evento | Acción |
|--------|--------|
| Reserva realizada | WhatsApp automático |
| Pedido listo | WhatsApp automático |
| Stock bajo | WhatsApp automático |

En código: módulos `crm`, `leads`, `whatsapp` en [`shared/core/factory.js`](../platform/core/shared/core/factory.js), rutas `/api/crm/*`, `/api/leads/*`, `/api/whatsapp/*` y página [`CrmPage.jsx`](../platform/core/web/src/app/crm/CrmPage.jsx) (hoy **demo** con cliente ficticio). Falta persistencia tenant de contactos y UI de pipeline en Hub.

---

## IA empresarial

No un chatbot genérico, sino **asistente del negocio** con respuestas ancladas al tenant:

- «¿Cuáles son mis productos más vendidos?»  
- «¿Qué mesas generan más ingresos?»  
- «¿Qué proveedor me vende más caro?»

La IA debe consultar **solo** datos del tenant (SQL / API internas, RLS o filtros `business_id`). No implementado en producto; requiere capa de consultas seguras + LLM + auditoría.

---

## Dakinis Analytics

Evolución de los dashboards actuales (KPIs en `/sistema/*` y mockups) hacia un **centro único**:

- Ventas · Clientes · Stock · Rentabilidad  
- Horarios · Ocupación · Proveedores  

Una sola vista filtrable por periodo y vertical. Hoy: KPIs estáticos / contenido i18n; datos reales parciales (restaurante, supply). No existe producto «Analytics» separado.

---

## Integración QR ampliada

En producción: cartel público [`/alergenos/:slug`](../platform/core/web/) (API pública `/core/api/public/`).

Ampliación propuesta — **QR Cliente** por vertical:

| Vertical | QR permite |
|----------|------------|
| Restaurante | Ver menú · Pedir · Pagar |
| Taller | Ver estado reparación |
| Clínica | Ver cita |
| Tienda | Ver producto |
| Servicios | Reservar slot |

Muy relevante para restaurantes, clínicas, peluquerías, gimnasios.

---

## Calendario, reservas y facturación (España)

- Calendario · Reservas · Recordatorios · Confirmación  
- **Facturación electrónica** (España): presupuesto, factura, abono, PDF automático  

Módulos `agenda` y `booking` ya están en el modelo de planes; facturación legal ES **no** está en Core (Stripe hoy solo en StreamAutomator según [`ARCHITECTURE.md`](./ARCHITECTURE.md)).

---

## SSO real entre productos

Auth central (`dakinis-auth`) + JWT Core + gateway `/auth/` y `/core/api/auth/exchange`.

Objetivo: **login único** → acceso sin re-autenticar a Core, AkoeNet, StreamAutomator, CRM, Analytics.

Estado: piezas de IdP y exchange en gateway; integración **completa** en AkoeNet client y deep-links desde Hub **pendiente**.

---

## Observabilidad comercial (panel del cliente)

Además de health checks y Sentry (equipo técnico), un **panel para el tenant**:

- Estado del servicio  
- Backups (cuando existan)  
- Uso mensual · Consumo API  
- Usuarios activos  

No implementado como producto; backups aún en checklist [`PRODUCTION-CHECKLIST-TEMP.md`](./PRODUCTION-CHECKLIST-TEMP.md).

---

## Roadmap sugerido (6 meses)

### Prioridad 1

| Iniciativa |
|------------|
| Hub central (shell + navegación + módulos activos) |
| CRM persistido + pipeline mínimo |
| Facturación (MVP PDF / presupuesto; e-factura ES en fase posterior) |
| WhatsApp (reglas + plantillas; integración API real) |

### Prioridad 2

| Iniciativa |
|------------|
| Reservas end-to-end |
| QR avanzado (menú / pedido / reserva) |
| Dakinis Analytics (v1 agregaciones) |

### Prioridad 3

| Iniciativa |
|------------|
| IA empresarial (consultas tenant-safe) |
| Marketplace de módulos (autoservicio + billing) |

---

## Por qué el proyecto ya es diferente

La mayoría de equipos entregan **un ERP** o **un CRM**. Dakinis apunta a **Dakinis Platform**: Core, Auth, AkoeNet y StreamAutomator pueden compartir usuarios, empresas, facturación y datos bajo el mismo `business_id` y el mismo IdP.

Si todo converge en un **Hub único con módulos activables**, el modelo pasa de «vender una aplicación» a **vender una plataforma para pymes** — donde está el valor a largo plazo.

---

## Qué se puede implementar (mapa frente al repo actual)

Leyenda: **✅** base usable · **🟡** parcial / diseñado · **🔴** no existe o depende de terceros / normativa

| Iniciativa | Estado | Notas técnicas |
|------------|--------|----------------|
| **Multi-tenant + planes + módulos API** | ✅ 🟡 | Postgres `business_id`, `plan`, `plan-modules.js`, 403 `PLAN_MODULE_DENIED`. Falta UI Hub, Stripe/billing y activación self-service. |
| **Hub central (dashboard único)** | 🔴 🟡 | Topbar con `/app/*`, «Mi negocio», mockup; no hay `/hub` ni launcher de módulos. **Implementable** como nueva shell en Core web + enlaces a SA/AkoeNet. |
| **Marketplace / precios 19–99 €** | 🔴 🟡 | Modelo documentado en `DAKINIS_ARCHITECTURE.md`; sin pasarela en Core. **Implementable** con Stripe Billing + tabla `business_modules` o ampliar `plan`. |
| **Constructor de negocio** | 🟡 | `POST /api/platform/businesses`, vertical `type`, seeds SQL. **Implementable**: wizard en front + plantillas por adapter en `shared/adapters/`. |
| **CRM (contactos, estados)** | 🟡 | Lógica segmentación en `shared/core/modules/crm.js`; API routes; **sin** tabla contactos ni CRM real en restaurante. **Prioridad 1 implementable** en Core API + Hub. |
| **Leads + pipeline** | 🟡 | Módulo `leads` en shared; API gateado por plan. UI comercial limitada. |
| **WhatsApp automatizaciones** | 🟡 | Módulo `whatsapp`, reglas demo en dashboard; **sin** WhatsApp Business API en prod documentada. Requiere proveedor (Meta) + colas. |
| **Restaurante operativo** | ✅ | Mesas, comandas, stock, escáner, alérgenos públicos, roles UI. Base fuerte para Hub «módulo Restaurante». |
| **Inventario / supply** | ✅ 🟡 | Supply deliveries/alerts API + UI en verticales no-restaurante. |
| **Reservas / agenda** | 🟡 | Módulos `booking`/`agenda`, appointments en `/app/dashboard` (demo API). **Implementable** persistiendo citas por tenant. |
| **Dakinis Analytics** | 🔴 🟡 | KPIs mock en `SystemPage`; datos restaurante/supply parciales. **Implementable** v1 con agregaciones SQL + una página Hub. |
| **IA empresarial (RAG/SQL tenant)** | 🔴 | **Implementable** en fase 3; necesita capa de permisos, no enviar PII a modelos sin política, coste por tenant. |
| **QR alérgenos** | ✅ | `/alergenos/:slug` + API public. |
| **QR menú / pedido / pago** | 🔴 🟡 | **Implementable** ampliando rutas públicas + menú tenant (menú API ya existe en restaurante). Pago = pasarela externa. |
| **Facturación PDF (presupuesto/factura)** | 🔴 | **Implementable** MVP (generación PDF + numeración); no sustituye e-factura legal sin integración Verifactu/SII. |
| **Facturación electrónica España** | 🔴 | Dependencia normativa y proveedor certificado; proyecto aparte. |
| **SSO entre Core / AkoeNet / SA** | 🟡 | Auth + `exchange` en gateway; AkoeNet necesita `VITE_DAKINIS_AUTH_URL` y flujo estable. **Implementable** unificando redirect y tokens. |
| **StreamAutomator / AkoeNet en Hub** | 🟡 | Enlaces y gateway `/streamautomator/`, `/akoenet/`. **Implementable** como tiles en Hub (iframe o deep link). |
| **Panel cliente (estado, backups, uso)** | 🔴 | Backups aún pendientes; sin API de «usage» por tenant. **Implementable** tras backups + métricas básicas en API. |
| **Usuarios del negocio** | ✅ 🟡 | `TenantTeamSection`, `/api/tenant/users` para admin. Encaja en Hub «Usuarios». |

### Resumen ejecutivo de implementación

| Plazo | Realista con el código actual |
|-------|--------------------------------|
| **0–3 meses** | Hub shell en Core (launcher + módulos según `plan`), CRM persistido mínimo, mejoras WhatsApp (plantillas + hooks desde eventos restaurante/reservas), wizard «Crear negocio» v1. |
| **3–6 meses** | Reservas persistidas, Analytics v1, QR menú/pedido público, SSO estable Core↔AkoeNet, facturación PDF MVP. |
| **6+ meses** | IA tenant-safe, marketplace self-service + Stripe, e-factura ES, panel cliente completo. |

### Qué no conviene prometer aún

- Plataforma «completa tipo Zoho» en 6 meses sin equipo dedicado.  
- E-factura española sin partner legal/técnico.  
- IA con acceso libre a BD sin capa de gobernanza.  
- Un solo deploy que fusione AkoeNet y Core (mantener multi-repo + Hub como **capa de experiencia** es coherente con [`WORKSPACE-STRATEGY.md`](./WORKSPACE-STRATEGY.md)).

---

## Referencias en el monorepo

| Tema | Dónde |
|------|--------|
| Planes y módulos | `platform/core/shared/catalog/plan-modules.js` |
| Gateo API por plan | `platform/core/api/src/api/plan-access.js` |
| Visión SaaS / onboarding | `platform/core/DAKINIS_ARCHITECTURE.md` |
| Producción actual | `docs/PRODUCTION-CHECKLIST-TEMP.md` |
| Auth / gateway | `docs/supabase/SETUP.md`, `gateway/routes/default.conf` |
