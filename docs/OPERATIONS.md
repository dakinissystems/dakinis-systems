# OPERATIONS — control interno Dakinis Systems

> **Audiencia:** operador (tú). **No** es documentación para clientes.  
> **Actualizado:** 19 mayo 2026 · BOS · telemetría · precios híbridos · RLS Supabase  
> **Repo producto:** `platform/core` → `dakinissystems/dakinis-core` (suele estar en `.gitignore` del control repo).

---

## Índice

1. [Principios de operación](#1-principios-de-operación)
2. [BOS — posicionamiento](#2-bos--posicionamiento)
3. [Modelo comercial híbrido](#3-modelo-comercial-híbrido)
4. [Estado del producto](#4-estado-del-producto)
5. [Checklist producción](#5-checklist-producción)
6. [Core multi-tenant](#6-core-multi-tenant)
7. [Tenants y altas](#7-tenants-y-altas)
8. [Hub, rutas y planes](#8-hub-rutas-y-planes)
9. [Telemetría y facturación](#9-telemetría-y-facturación)
10. [API (resumen)](#10-api-resumen)
11. [Pilotos](#11-pilotos)
12. [Comandos, URLs y archivos clave](#12-comandos-urls-y-archivos-clave)
13. [Referencias](#13-referencias)

---

## 1. Principios de operación

| Regla | Acción |
|-------|--------|
| **Control repo vs producto** | `dakinis-systems` versiona docs, SQL, gateway. Código en repos `dakinis-core`, `dakinis-landing`, etc. Ver [`WORKSPACE-STRATEGY.md`](./WORKSPACE-STRATEGY.md). |
| **Secretos** | Nunca en docs ni commits. Plantillas: [`railway.env.example`](./railway.env.example). Rotar `WHATSAPP_*` si se filtraron. |
| **Master API key** | En prod `DAKINIS_MASTER_API_KEY` obligatoria (≠ `dakinis-dev-key`, ≥24 chars). El API no arranca si falla. |
| **Plan gating BOS** | Rutas `/api/v1/tenant/copilot`, `intelligence/ask`, etc. — `route-plan-access.js` (alineado con UI). |
| **Auth IdP** | Rate limit 5 intentos / 15 min en login/register/refresh. |
| **Docker prod** | `compose.full.yml` + `compose.prod.yml` — solo gateway `80`/`443`; backends solo red interna. |
| **shared-brand** | `node scripts/sync-shared-brand.mjs` o `npm run sync-brand` en `packages/shared-brand`. |
| **SQL** | Orden fijo `00`→`09`, luego RLS `004` + `006` o `006b`. Una migración por entorno; no saltar números. |
| **RLS Supabase** | Advisor sin «RLS Enabled No Policy». Core usa pooler **6543** + `?pgbouncer=true`; RLS es defensa en profundidad. |
| **Deploy Railway** | Repo `dakinissystems/dakinis-core`, root **vacío**, `npm install` en Railpack (no `npm ci` roto). Vendor `packages/shared-brand` en core. |
| **Plan en JWT** | Tras cambiar `business.plan` en `/admin` → **logout + login**. |
| **Nuevas features** | Solo si un piloto lo pide o aumenta ingreso. Medir 30 días con telemetría antes de ampliar scope. |
| **i18n** | Paridad ES/EN: `node scripts/check-locale-parity.mjs`. Ver [`I18N-ECOSYSTEM.md`](./I18N-ECOSYSTEM.md). |
| **Gateway** | Cambios de rutas públicas: obligatorio [`rules.md`](./rules.md). |
| **Contratos HTTP** | Fuente de verdad prefijos: [`contracts/`](./contracts/). |

---

## 2. BOS — posicionamiento

| Referente | Qué vende |
|-----------|-----------|
| Odoo | ERP + Apps |
| Zoho One | Suite empresarial |
| **Dakinis** | **Business Operating System** para PYMEs |

**Mensajes comerciales (no «ERP» ni «CRM» sueltos):**

| Mensaje | Incluye |
|---------|---------|
| **Organiza** | CRM + Inventario + Operaciones (12 industrias) |
| **Comunica** | WhatsApp + Portal cliente |
| **Decide** | IA + Copilot + Benchmark + Recomendaciones |

**Núcleo técnico:** `Tenant + Knowledge Base + Intelligence + Acciones` → `POST /api/v1/tenant/intelligence/ask`, Copilot.

**Riesgo actual:** sobredesarrollo, no falta de features. Prioridad = **5–10 pilotos reales** → Stripe → RAG → Calendario → Network comercial.

**No invertir más** (hasta validar): más industrias, dashboards genéricos, módulos básicos, variantes de chat.

---

## 3. Modelo comercial híbrido

> El cliente compra **resultados**, no módulos sueltos.  
> **Código:** `platform/core/shared/catalog/bos-pricing.js` · **API:** `GET /api/v1/tenant/billing/summary` · **UI:** `PricingHybridSection` en `/#precios`, Ajustes, Hub.

### ❌ Descartado como modelo principal

Venta por módulo (19–49–99 €/módulo). Solo referencia histórica o addons Marketplace futuros.

### ✅ Suscripción BOS (recurrente — Stripe 🔜)

| Plan | €/mes | Incluye (venta) | Módulos API |
|------|-------|-----------------|-------------|
| **Starter** | 29 | CRM básico, agenda, reservas, portal | agenda, booking, dashboard |
| **Growth** | 79 | Inventario, CRM completo, analytics, benchmark · **250 WA/mes** | + crm, leads |
| **Pro** | 149 | WA, IA, Copilot, automatizaciones, Network · **2k IA** · **2k WA/mes** | + whatsapp |
| `platform` | = Pro | operador | — |

**Exceso:** IA **5 €** / 1.000 consultas extra (Pro) · WA **5 €** / 500 mensajes extra (Growth/Pro).  
Cálculo: `dakinisComputeCommercialMonthlyInvoice()`.

### ✅ Implantación y proyectos (pago único)

| Implantación | Rango |
|--------------|-------|
| Ligera → estándar → avanzada → a medida | 500 – 3.000 €+ |

| Pack proyecto | Rango | Plazo |
|---------------|-------|-------|
| MVP | 300 – 600 € | 5 – 10 días |
| Profesional | 800 – 1.500 € | 2 – 4 semanas |
| Avanzado | 1.500 – 3.000 €+ | según alcance |

### ✅ Servicios profesionales

| Tipo | Precio |
|------|--------|
| Hora | 40 €/h |
| Proyectos cerrados | 300 / 500 / 1.000 € |
| Mantenimiento básico / + mejoras | 20 / 50 €/mes |

**Ejemplo año 1 clínica:** implantación 1.200 € + Growth 948 € + WA 300 € + mantenimiento 600 € ≈ **3.048 €**.

**Coste interno (margen, no facturado):** IA 0,002 €/1k tokens · WA ~0,05 €/msg.

---

## 4. Estado del producto

| Área | Estado | Notas |
|------|--------|-------|
| Hub (Aplicaciones + Marketplace) | ✅ | `/hub`, tiles i18n, dashboard |
| CRM + deals + WA→contacto | ✅ | SQL `04`+`06` verificar en prod |
| WhatsApp módulo `/app/whatsapp` | ✅ | Webhook Meta 🟡 env prod |
| Intelligence + Copilot + agentes | ✅ | `OPENAI_API_KEY` opcional |
| BOS platform (`07`) | ✅ | subscriptions, portal, IA log |
| Telemetría (`08`–`09`) + scores | ✅ | Settings + `/admin` |
| Precios híbridos UI + API billing | ✅ | `/#precios`, Ajustes |
| Monetización Stripe | 🟡 | Tablas listas, sin SDK cobro |
| RAG PDF/embeddings | 🔜 | Tras 30d adopción |
| Calendario global | 🔜 | Post-Stripe |
| Dakinis Network comercial | 🔜 | API base ✅ |
| SSO Hub → AkoeNet / SA | 🟡 | |
| SQL Supabase `02`–`09` + RLS | 🟡 | Ejecutar en prod |
| Deploy Railway Core | 🟡 | Push + redeploy |
| Sentry / GA4 | 🟡 | |

**Roadmap 2026:** 1) Pilotos · 2) Stripe · 3) RAG · 4) Calendario · 5) Network comercial.

---

## 5. Checklist producción

### 5.1 Base de datos (Supabase SQL Editor)

| # | Script | Estado |
|---|--------|--------|
| 1 | `schemas/00` → `01` → `02` … `09` | 🟡 |
| 2 | `004-rls-lockdown-all.sql` | 🟡 |
| 3 | `006-rls-policies-deny-api.sql` (1ª vez) **o** `006b-rls-policies-missing-tables.sql` | 🟡 |

Guía detallada: [`supabase/SETUP.md`](./supabase/SETUP.md).

| Variable Core Back | Valor |
|--------------------|-------|
| `POSTGRES_SCHEMA` | `dakinis_core_prod` |
| `DATABASE_URL` | Pooler **6543** + `?pgbouncer=true` |
| `DB_DRIVER` | `postgres` |

### 5.2 Railway — Core Back y Core Front

| Campo | Valor |
|-------|-------|
| Repositorio | `dakinissystems/dakinis-core` |
| Root Directory | *(vacío)* |
| Build | Railpack · **`npm install`** |
| **NO** usar | Root `web`/`api` sueltos ni repo `dakinis-systems` |

Verificación local:

```powershell
cd D:\dakinis-systems\platform\core
npm ci
npm run build -w @dakinis/web
npm run start -w @dakinis/api
```

**Incidentes conocidos (jun 2026):** `npm ci` sin lock en layer → usar `npm install`; `shared-brand` vendoreado en `platform/core/packages/shared-brand`; sync con `scripts/sync-shared-brand.mjs`.

### 5.3 Variables de entorno (prod)

| Variable | Servicio | Estado |
|----------|----------|--------|
| `JWT_SECRET` | auth, Core Back | ⬜ |
| `DATABASE_URL`, `DB_DRIVER` | Core Back | ⬜ |
| `WHATSAPP_ACCESS_TOKEN`, `PHONE_NUMBER_ID`, `VERIFY_TOKEN`, `APP_SECRET` | Core Back | ⬜ |
| `WHATSAPP_DEFAULT_BUSINESS_ID` | Core Back | ⬜ |
| `OPENAI_API_KEY` | Core Back | 🟡 opcional |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Core Back | 🔜 |
| `VITE_DAKINIS_AUTH_URL`, `API_UPSTREAM` | Core Front | ⬜ |
| `VITE_HUB_URL`, `VITE_CONTACT_WHATSAPP_*` | Landing | ⬜ |

Webhook Meta: `https://api.dakinissystems.com/core/webhooks/whatsapp`

### 5.4 Backups y deploy

| Acción | Estado |
|--------|--------|
| Workflow `backup-postgres.yml` + secret `BACKUP_DATABASE_URL` | ⬜ |
| Push `dakinis-core` (Railpack fix) + redeploy | 🟡 |
| Push `dakinis-landing` | 🟡 |
| Sync `shared-brand` → landing + core vendor | 🟡 |

```powershell
# Fuente → landing
robocopy packages\shared-brand apps\landing\packages\shared-brand /E /XD node_modules
# Fuente → core (desde platform/core)
node scripts/sync-shared-brand.mjs
```

### 5.5 Smoke rápido

```bash
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://api.dakinissystems.com/core/api/public/catalog | head -c 200
curl -sS -o /dev/null -w "core:%{http_code}\n" https://core.dakinissystems.com/hub
```

| Prueba manual | Esperado |
|---------------|----------|
| Core `/#precios` | Planes 29/79/149 + implantación |
| `/app/settings` | Facturación híbrida + adopción |
| `/admin` (platform_admin) | Telemetría pilotos |
| `GET /api/v1/tenant/billing/summary` | Plan + excesos estimados |
| Supabase advisor | 0 «RLS Enabled No Policy» tras `006b` |

---

## 6. Core multi-tenant

```
platform/core/
├── api/          # Core Back (8787) — app.js, db, services
├── web/          # Core Front (Vite + React)
└── shared/       # @dakinis/shared — catalog, adapters, core/modules
```

| Concepto | Tabla / mecanismo |
|----------|-------------------|
| Tenant | `business` (`id`, `slug`, `type`, `plan`, `config_json`) |
| Usuario | `users` (`business_id`, `email`, `role`) |
| Datos | `tenant_*` por `business_id` |
| Resolución API | Header `x-business-id` (id o slug) + JWT / API key |
| Schema prod | `dakinis_core_prod` |

### Migraciones SQL

| Script | Tablas principales |
|--------|-------------------|
| `02` | `business`, `users`, stock, restaurant profile, audit |
| `03` | WhatsApp contacts/messages |
| `04` | CRM companies/contacts/activities/conversations |
| `05` | branches, module_overrides, webhooks |
| `06` | deals, goals, finance, knowledge, network links |
| `07` | subscriptions, invoices, usage, portal, automation |
| `08` | `tenant_feature_usage` |
| `09` | `tenant_feature_events` |

### Industrias (`business.type`)

12 plantillas: `clinica`, `peluqueria`, `restaurante`, `inmobiliaria`, `gimnasio`, `academia`, `taller`, `veterinaria`, `hotel`, `retail`, `distribuidor`, `ecommerce`.  
Cuatro primeras con mockup `/vista/:vertical` y adaptador específico; resto adaptador genérico.

### Capas de módulos

| Capa | Fuente |
|------|--------|
| Plan (`starter`/`growth`/`pro`) | `plan-modules.js` |
| Industria | `business-templates.js` |
| Override tenant | `tenant_module_overrides` |
| Marketplace | `tenant-modules.js` |

Gate API: `plan-access.js` → `PLAN_MODULE_DENIED` / `MODULE_DISABLED`.

---

## 7. Tenants y altas

**Seed mínimo** (`seed-minimal.js`, contraseña demo **`demo123`**):

| Slug | Tipo | Plan | Admin |
|------|------|------|-------|
| `dakinis-platform` | platform | platform | `admin@dakinis-platform.local` |
| `clinica-demo` | clinica | starter | `admin@clinica-demo.local` |
| `peluqueria-demo` | peluqueria | starter | `admin@peluqueria-demo.local` |
| `inmobiliaria-demo` | inmobiliaria | starter | `admin@inmobiliaria-demo.local` |
| `restaurante-demo` | restaurante | starter | `admin@restaurante-demo.local` |

**Extendidos (scripts/SQL):** `dumpling-house`, `fermina-food` → ver `docs/supabase/seeds/`.

**Alta nueva:** `/admin` → crear negocio (slug, tipo, plan) → opcional admin → no SQL por tenant si migraciones globales aplicadas.

**Platform admin prod:** `api/scripts/upsert-platform-admin.mjs` con vars de entorno (no documentar contraseñas).

---

## 8. Hub, rutas y planes

**Hub implementado** en `/hub`: secciones Aplicaciones (Dakinis One) y Marketplace (AkoeNet, StreamAutomator, servicios).  
Módulos bloqueados por plan muestran badge; enlace upgrade → `/#precios`.

| Ruta | Plan mínimo |
|------|-------------|
| `/app/dashboard` | starter |
| `/app/crm` | growth |
| `/app/whatsapp/*` | pro |
| `/app/settings` | sesión |
| `/sistema/:vertical` | vertical del tenant |

| URL prod | Rol |
|----------|-----|
| `https://dakinissystems.com` | Landing corporativa (proyectos) |
| `https://core.dakinissystems.com` | Dakinis One + Hub + `/#precios` |
| `https://api.dakinissystems.com` | Gateway |

Flujo: Landing → Login/Core → Hub → módulos o productos ecosistema.

---

## 9. Telemetría y facturación

| Capa | Tabla / API |
|------|-------------|
| Tiempo en pantalla | `tenant_feature_usage` · `POST …/telemetry/feature` |
| Eventos de valor | `tenant_feature_events` · `POST …/telemetry/event` |
| Scores | Adoption + Business Value · `GET …/telemetry/adoption` |
| Panel operador | `GET /api/platform/telemetry/summary` · `/admin` |

Hook front: navegación en `AppRouter.jsx`. KPIs en Ajustes.

Facturación: `bos-store.js` + `dakinisComputeCommercialMonthlyInvoice()` → líneas base + exceso IA/WA.

---

## 10. API (resumen)

Dispatcher: `api/src/app.js`. Contratos OpenAPI: [`contracts/core-api.json`](./contracts/core-api.json).

| Grupo | Prefijo | Auth |
|-------|---------|------|
| Salud / login | `/api/health`, `/api/auth/*` | público / credenciales |
| Plataforma | `/api/platform/*` | `platform_admin` |
| Tenant v1 | `/api/v1/tenant/*` | JWT + `x-business-id` |
| CRM v1 | `/api/v1/crm/*` | growth+ |
| WhatsApp v1 | `/api/v1/whatsapp/*` | pro |
| Legacy módulos | `/api/agenda`, `/api/crm`, `/api/whatsapp`… | gate plan |
| Restaurante | `/api/tenant/restaurant/*` | tenant restaurante |
| Webhook | `/webhooks/whatsapp` | Meta verify + firma |

Endpoints BOS clave: `intelligence/ask`, `copilot`, `billing/summary`, `ai/usage`, `benchmark/real`, `portal/settings`, `telemetry/*`.

---

## 11. Pilotos

Objetivo: **6 negocios** (2 restaurantes, 2 peluquerías, 1 clínica, 1 inmobiliaria).

| Medir | Fuente |
|-------|--------|
| Módulos usados / tiempo | `tenant_feature_usage` |
| Acciones de valor | `tenant_feature_events` |
| Preguntas Copilot | `tenant_ai_usage_log` |
| Disposición a pagar | entrevista antes de Stripe |

No añadir features hasta petición explícita de piloto o requisito comercial (Stripe/RAG/Network).

---

## 12. Comandos, URLs y archivos clave

```powershell
# Admin plataforma (Postgres)
cd platform/core/api
$env:DB_DRIVER="postgres"
$env:POSTGRES_SCHEMA="dakinis_core_prod"
$env:DATABASE_URL="postgresql://..."
node scripts/upsert-platform-admin.mjs

# Seed restaurante extendido
node scripts/seed-dumpling-house.mjs
```

| Tema | Ruta |
|------|------|
| Precios comerciales | `shared/catalog/bos-pricing.js` |
| UI precios | `web/src/components/PricingHybridSection.jsx` |
| Billing API | `api/src/services/bos-store.js` |
| Telemetría | `api/src/services/telemetry-store.js` |
| Planes ↔ módulos | `shared/catalog/plan-modules.js` |
| Seed mínimo | `api/src/db/seed-minimal.js` |
| SQL schemas | `docs/supabase/schemas/` |
| RLS | `docs/supabase/004-*`, `006b-*` |

| Servicio | URL |
|----------|-----|
| Core Front | https://core.dakinissystems.com |
| Core Back | https://dakinis-core-production.up.railway.app |
| Login | https://core.dakinissystems.com/login |
| Admin | https://core.dakinissystems.com/admin |

---

## 13. Referencias

| Documento | Uso |
|-----------|-----|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Mapa carpetas y productos |
| [`WORKSPACE-STRATEGY.md`](./WORKSPACE-STRATEGY.md) | Multi-repo y clones |
| [`supabase/SETUP.md`](./supabase/SETUP.md) | SQL, pooler, RLS |
| [`LANDING-CORE-STRUCTURE.md`](./LANDING-CORE-STRUCTURE.md) | Landing vs Core (interno) |
| [`WHATSAPP-INTEGRATION.md`](./WHATSAPP-INTEGRATION.md) | WhatsApp Cloud API |
| [`WHATSAPP-ROADMAP.md`](./WHATSAPP-ROADMAP.md) | Roadmap WA |
| [`I18N-ECOSYSTEM.md`](./I18N-ECOSYSTEM.md) | i18n |
| [`rules.md`](./rules.md) | Gateway |
| [`contracts/`](./contracts/) | APIs públicas |
| [`legal/`](./legal/) | Textos legales **cliente** (no mezclar con este doc) |
| [`observability/`](./observability/) | Sentry, uptime |
| [`adr/`](./adr/) | Decisiones formales |

---

*Documento único de control interno. Sustituye `CORE-TENANTS-TEMP.md`, `PRODUCTION-CHECKLIST-TEMP.md` y `DAKINIS-HUB-VISION.md`.*
