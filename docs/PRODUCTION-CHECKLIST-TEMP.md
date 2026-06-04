# Producción y visión Dakinis Systems (TEMP)

> **Actualizado:** 4 junio 2026  
> **Dos capas:** (1) checklist operativo deploy/prod · (2) posicionamiento y roadmap de producto.  
> Guías: [`supabase/SETUP.md`](./supabase/SETUP.md) · [`DAKINIS-HUB-VISION.md`](./DAKINIS-HUB-VISION.md) · [`LANDING-CORE-STRUCTURE.md`](./LANDING-CORE-STRUCTURE.md) · [`WHATSAPP-ROADMAP.md`](./WHATSAPP-ROADMAP.md) · [`WHATSAPP-INTEGRATION.md`](./WHATSAPP-INTEGRATION.md)

---

## Posicionamiento: ya no es un ERP

El mayor cambio pendiente **no es solo técnico**, sino de **posicionamiento**.

### Inventario actual (lo que ya existe)

| Capa | Componentes |
|------|-------------|
| **Marca y ventas** | Landing corporativa |
| **Entrada ecosistema** | Dakinis Hub |
| **Producto core** | Dakinis One (multi-tenant) |
| **Identidad** | SSO · Auth centralizado |
| **Operativa** | Inventario · Restaurante · **WhatsApp** (API + webhook en código) |
| **Productos externos** | AkoeNet · StreamAutomator |
| **Plataforma** | Analytics base · Catálogo dinámico (`platform_kv`, Hub tiles) |

**Conclusión:** no se está construyendo un ERP monolítico. Se está construyendo una **plataforma empresarial modular**.

### Cimientos ya construidos (ventaja competitiva)

- Hub como punto de entrada  
- Auth centralizado + SSO entre productos  
- Catálogo dinámico (admin + `GET /api/public/catalog`)  
- Módulos por vertical y multiempresa (tenant)  
- Ecosistema AkoeNet + StreamAutomator enlazado  

El **siguiente salto de valor** no está en añadir más pantallas sueltas, sino en **unificar** alrededor de:

**CRM + Comunicaciones + Automatizaciones + Facturación**

Eso convierte Dakinis en una plataforma completa y no en un conjunto de aplicaciones separadas.

---

## Lo que falta para parecer un producto «serio»

Referencia de mercado: Microsoft 365 · Zoho One · Odoo Apps.

### 1. Centro de aplicaciones (evolución del Hub)

**Hoy:** Hub con secciones **Aplicaciones** y **Marketplace** + dashboard de bienvenida.

**Objetivo — Dakinis Hub:**

```
Aplicaciones (Dakinis One)
────────────────────────
✓ CRM          ✓ Inventario    ✓ Restaurante
✓ WhatsApp     ✓ Reservas      ✓ Analytics
○ Facturación  (roadmap)

Marketplace
────────────────────────
✓ AkoeNet      ✓ StreamAutomator
○ Futuras apps (terceros)
```

| Estado | Notas |
|--------|-------|
| Tiles + catálogo JSON | ✅ |
| Secciones «Aplicaciones» vs «Marketplace» en UI | ✅ |
| Tile Hub **WhatsApp** → `/app/whatsapp` | ✅ |
| Activación/desactivación por plan | 🟡 `plan-modules` |
| i18n tiles ES/EN | ✅ |

### 2. CRM como núcleo

**Hoy (P1 en código):** tablas `tenant_crm_contacts`, `tenant_crm_companies`, `tenant_crm_activities`, `tenant_whatsapp_conversations`; API `/api/v1/crm/*`; UI `/app/crm` con lista + ficha + timeline; WhatsApp inbound enlaza **Contacto → Conversación → Mensaje**.

**Objetivo:** todo gira alrededor del **Cliente**:

```
Cliente → Reserva → Pedido → Factura → WhatsApp → Seguimiento
```

**Modelo de datos:**

| Tabla | Rol |
|-------|-----|
| `tenant_crm_contacts` | Personas |
| `tenant_crm_companies` | Organizaciones |
| `tenant_crm_activities` | Llamadas, notas, WhatsApp, reservas… |
| `tenant_whatsapp_conversations` | Hilo WA por contacto |
| `deals` | Oportunidades / pipeline (P3, pendiente) |

| Estado | Notas |
|--------|-------|
| CRM en Hub + `/app/crm` | ✅ |
| SQL Supabase [`04-crm-core.sql`](./supabase/schemas/04-crm-core.sql) | 🟡 ejecutar en prod |
| Migración SQLite local (`schema-crm-migrate.sql`) | ✅ al arrancar API |
| API contacts / companies / activities / timeline | ✅ |
| WhatsApp → contacto + `contact_id` en mensajes | ✅ |
| Evento `crm.whatsapp.inbound` con `contactId` | ✅ |
| Enlace reservas/pedidos/factura → contacto | ⬜ |
| Deals / pipeline | ⬜ P3 |

### 3. Centro de comunicación — *Dakinis Communications / WhatsApp*

**Hoy:** módulo **WhatsApp** en Hub (`/app/whatsapp/*`), no solo un tile suelto.

```
Hub → WhatsApp
  ├── Conversaciones   (hilos + envío API)
  ├── Contactos
  ├── Plantillas       (preview)
  ├── Automatizaciones (reglas)
  └── IA               (roadmap fase 5)
```

Canales futuros: Email · Telegram · Discord · SMS · Push.

| Estado | Notas |
|--------|-------|
| Reglas + preview API | ✅ |
| Envío Cloud API `POST /api/v1/whatsapp/send` | ✅ código |
| Webhook `GET/POST /webhooks/whatsapp` | ✅ código |
| Tablas Postgres WhatsApp | 🟡 SQL [`03-whatsapp-messages.sql`](./supabase/schemas/03-whatsapp-messages.sql) — ejecutar en Supabase |
| Legales Meta (Core §§10–12) | ✅ |
| Inbox omnicanal | ⬜ |
| Otros canales | ⬜ |

### 4. Motor de automatización (estilo Zapier)

Ejemplos de reglas:

| SI | ENTONCES |
|----|----------|
| Reserva creada | Enviar WhatsApp |
| Stock bajo | Crear orden de compra |
| Cliente cumple años | Enviar promoción |

| Estado | Notas |
|--------|-------|
| Event bus in-process (Core) | ✅ base |
| Handlers WhatsApp (`DAKINIS_WHATSAPP_AUTO_SEND`) | 🟡 dry-run por defecto |
| UI reglas + motor genérico SI/ENTONCES | ⬜ |

### 5. Constructor visual de procesos

Diferenciador frente a SaaS pequeños:

```
[Reserva] → [WhatsApp] → [Factura] → [Encuesta]
```

| Estado | Notas |
|--------|-------|
| Diseño / POC | ⬜ |

### 6. Dakinis AI (contextual al tenant)

No un chatbot genérico. IA con acceso a datos del negocio.

| Estado | Notas |
|--------|-------|
| Pestaña IA en `/app/whatsapp/ai` (roadmap copy) | ✅ UI |
| RAG / OpenAI + CRM | ⬜ fase 5 |

### 7. Portal del cliente (B2B2C)

| Estado | Notas |
|--------|-------|
| Portal cliente | ⬜ |

### 8. Facturación SaaS (cobrar el software)

| Estado | Notas |
|--------|-------|
| Planes en tenant / catálogo | 🟡 parcial |
| Stripe Billing | ⬜ |

### 9. Observabilidad comercial (panel cliente)

| Estado | Notas |
|--------|-------|
| `/api/health` + `whatsappConfigured` | ✅ |
| Sentry | 🟡 |
| GA4 / dataLayer | 🟡 |
| Panel uso por tenant | ⬜ |

### 10. Marketplace real

| Estado | Notas |
|--------|-------|
| Enlaces productos propios | ✅ |
| API catálogo + admin JSON | ✅ |
| SDK / onboarding terceros | ⬜ |

---

## Roadmap CTO (visión 2026–2028)

### 2026 — Consolidar plataforma

| Prioridad | Entregable | Estado |
|-----------|------------|--------|
| P0 | SSO completo (Hub → AkoeNet, SA, Core) | 🟡 |
| P0 | WhatsApp Business API en prod | 🟡 código listo; env + SQL + deploy |
| P1 | CRM núcleo (`contacts`, `companies`, `activities`) | 🟡 código; SQL Supabase + deploy |
| P3 | Deals / pipeline | ⬜ |
| P1 | Stripe (plan → suscripción → pago) | ⬜ |
| P1 | Portal cliente (MVP) | ⬜ |
| Ops | Deploy prod estable (Landing, Core Back, Core Front) | 🟡 ver Railway |

### 2027–2028

Sin cambio de visión: automatizaciones, IA, reservas maduras, facturación operativa, Hub como «SO pymes».

---

## Implementado en código (requiere deploy / push)

| Área | Estado | Detalle |
|------|--------|---------|
| **`@dakinis/shared-brand`** | ✅ | company, URLs, `products.json`, `hub-modules.json`, i18n, analytics, SSO |
| **Core `packages/shared-brand` vendoreado** | 🟡 | Para Railway; sync con [`platform/core/scripts/sync-shared-brand.mjs`](../platform/core/scripts/sync-shared-brand.mjs) |
| **Landing = ventas** | ✅ | `/`, `/productos/*`, `/servicios`, `/hub` → Core |
| **Landing deploy standalone** | 🟡 | `apps/landing/packages/shared-brand`; push pendiente |
| **Core = producto SaaS** | ✅ | `/login`, `/hub`, `/sistema/*`, `/app/*` |
| **Hub UI** | ✅ | Aplicaciones / Marketplace, dashboard, i18n tiles |
| **WhatsApp módulo** | ✅ | `/app/whatsapp/*`, API, webhook, legales |
| **CRM persistido (P1)** | 🟡 | `/app/crm`, `/api/v1/crm/*`, `04-crm-core.sql`, enlace WA |
| **Core Back `restaurant-floor` export** | ✅ | Export en `@dakinis/shared` |
| **Auth + SSO base** | 🟡 | Exchange IdP; prod env pendiente |
| **Catálogo dinámico** | ✅ | API + `/admin` + `platform_kv` |
| **i18n ES/EN** | ✅ | Core, Landing, shared-brand JSON |

### Dominios

| URL | Rol |
|-----|-----|
| `https://dakinissystems.com` | Landing corporativa |
| `https://core.dakinissystems.com` | Dakinis One + Hub |
| `https://api.dakinissystems.com` | Gateway (`/auth/`, `/core/`, …) |

### Flujo usuario actual

```
Landing → Login (Core) o Hub
       → Hub (sesión Core)
       → Dakinis One / AkoeNet / StreamAutomator
       → WhatsApp (/app/whatsapp/conversations)
```

---

## Railway — configuración obligatoria

Aplica a **Core Back** y **Core Front**:

| Campo | Valor |
|--------|--------|
| **Repositorio** | `dakinissystems/dakinis-core` |
| **Root Directory** | *(vacío — raíz del monorepo)* |
| **NO usar** | `dakinis-systems` ni root `platform/core` (carpeta ignorada en control repo) |
| **NO usar** | Root `web` o `api` (rompe workspaces y lockfile) |

Build: **Railpack** (`railpack.json` / `railpack.web.json`). Install: **`npm install`** (no depender de `npm ci` en el layer de Railpack).

Verificación local antes de push:

```powershell
cd D:\dakinis-systems\platform\core
npm ci
npm run build -w @dakinis/web
npm run start -w @dakinis/api   # Back, otro terminal
```

---

## Incidentes Railway (jun 2026)

### dakinis-landing

| Síntoma | Fix |
|---------|-----|
| `npm ci` + `file:../../packages/shared-brand` | Vendor `./packages/shared-brand` + `package-lock.json` |
| Footer incompleto | Legal + mailto + contacto |
| WhatsApp placeholder `wa.me/549…` | `VITE_CONTACT_WHATSAPP_*` |

**Acción:** push `dakinissystems/dakinis-landing` → redeploy.

### Core Back / Core Front

| Síntoma | Causa | Fix |
|---------|--------|-----|
| `npm ci` — no `package-lock.json` | Railpack copia archivos pero `npm ci` no ve el lock en el layer | **`npm install`** en `railpack.json` / `railpack.web.json` |
| Mismo error tras COPY explícito del lock | Limitación Railpack + workspaces | Igual: `npm install` |
| `file:../../../packages/shared-brand` | Path fuera del repo `dakinis-core` en Railway | Vendor **`platform/core/packages/shared-brand`** |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` | `restaurant-floor.js` | Export en `shared/package.json` ✅ |
| Healthcheck fallido | Env / DB / puerto | `JWT_SECRET`, `DATABASE_URL`, no fijar `PORT` manual |

**Commits recientes en `dakinis-core` (referencia):**

- `413b82c` — WhatsApp Cloud API + Hub UI  
- `54db578` — Railpack COPY lock (insuficiente solo)  
- `c07eb95` — sync `packages/shared-brand` vendoreado  

**Pendiente push local (si `git status` muestra cambios):**

- `railpack.json` / `railpack.web.json` → `npm install`  
- `web/package.json` + `vite.config.js` → `file:../packages/shared-brand`  
- `package-lock.json` regenerado  
- `scripts/sync-shared-brand.mjs`  

```powershell
cd D:\dakinis-systems\platform\core
git add railpack.json railpack.web.json web/package.json web/vite.config.js package-lock.json scripts/
git commit -m "fix(railway): npm install in Railpack and vendored shared-brand paths"
git push origin main
```

Redeploy **Core Back** y **Core Front**.

---

## Pendiente — operaciones

### Backups

| Acción | Estado |
|--------|--------|
| Workflow [`backup-postgres.yml`](../.github/workflows/backup-postgres.yml) | ✅ |
| Secret `BACKUP_DATABASE_URL` (5432 directo) | ⬜ |
| Primer backup verificado en Actions | ⬜ |
| Restore mensual [`restore-postgres-test.ps1`](../scripts/restore-postgres-test.ps1) | ⬜ |

### Deploy (repos)

| Repo / servicio | Estado | Notas |
|-----------------|--------|-------|
| `dakinissystems/dakinis-core` | 🟡 | Push fix Railpack + lock; redeploy Back/Front |
| `dakinissystems/dakinis-landing` | 🟡 | Footer, vendor shared-brand |
| `dakinissystems/dakinis-systems` | ⬜ | Docs, SQL WhatsApp, shared-brand fuente |
| `dakinis-auth`, AkoeNet, StreamAutomator | ⬜ / 🟡 | Verificar env |

### Base de datos Core (prod)

| Acción | Estado |
|--------|--------|
| [`02-dakinis-core-prod.sql`](./supabase/schemas/02-dakinis-core-prod.sql) | ⬜ verificar ejecutado |
| [`03-whatsapp-messages.sql`](./supabase/schemas/03-whatsapp-messages.sql) | ⬜ **ejecutar en Supabase** antes de mensajes WhatsApp en prod |
| `POSTGRES_SCHEMA=dakinis_core_prod` en Core Back | ⬜ |

### Variables de entorno (prod)

| Variable | Servicio | Estado |
|----------|----------|--------|
| `JWT_SECRET` + issuer/audience | auth, Core Back | ⬜ |
| `DATABASE_URL` + `DB_DRIVER=postgres` | Core Back | ⬜ |
| `VITE_DAKINIS_AUTH_URL` | Core Front, AkoeNet | ⬜ |
| `VITE_HUB_URL`, `VITE_GA_MEASUREMENT_ID` | Landing | ⬜ |
| `VITE_CONTACT_WHATSAPP_URL` o `_PHONE` | Landing | ⬜ |
| `API_UPSTREAM` | Core Front | ⬜ |
| `WHATSAPP_ACCESS_TOKEN` | Core Back | ⬜ **rotar si se filtró en chat** |
| `WHATSAPP_PHONE_NUMBER_ID` | Core Back | ⬜ |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Core Back | ⬜ |
| `WHATSAPP_VERIFY_TOKEN` | Core Back | ⬜ token aleatorio largo; mismo valor en Meta webhook |
| `WHATSAPP_APP_SECRET` | Core Back | ⬜ App Secret de Meta (firma webhook) |
| `WHATSAPP_DEFAULT_BUSINESS_ID` | Core Back | ⬜ `business.id` o slug del tenant |
| `WHATSAPP_GRAPH_API_VERSION` | Core Back | opcional (`v22.0`) |
| `DAKINIS_WHATSAPP_AUTO_SEND` | Core Back | opcional `false` |

**Webhook Meta (producción):**

```
https://api.dakinissystems.com/core/webhooks/whatsapp
```

(Ajustar host si el API gateway usa otra ruta; alias en Core: `/webhooks/whatsapp`, `/api/webhooks/whatsapp`.)

Plantillas: [`railway.env.example`](./railway.env.example) · [`platform/core/api/.env.example`](../platform/core/api/.env.example) · [`apps/landing/.env.example`](../apps/landing/.env.example)

### Sync `shared-brand` (dos copias vendoreadas)

| Destino | Cuándo |
|---------|--------|
| `apps/landing/packages/shared-brand` | Cambios catálogo / contacto landing |
| `platform/core/packages/shared-brand` | Cambios Hub tiles / productos Core + deploy Railway |

```powershell
# Desde dakinis-systems (fuente)
robocopy packages\shared-brand apps\landing\packages\shared-brand /E /XD node_modules

# Desde platform/core
node scripts/sync-shared-brand.mjs
```

---

## Corto plazo técnico (jun 2026)

| Bloque | Estado | Referencia |
|--------|--------|------------|
| Railway Core Back + Front verdes | 🟡 | § Railway |
| SSO Hub → AkoeNet / SA | 🟡 | § Roadmap 2026 |
| WhatsApp fases 1–4 | 🟡 | [`WHATSAPP-ROADMAP.md`](./WHATSAPP-ROADMAP.md) |
| WhatsApp fase 5 (CRM + OpenAI) | ⬜ | `crm.whatsapp.inbound` |
| CRM persistido (contacts, deals) | ⬜ | § CRM |
| GA4 en Railway | 🟡 | Landing env |
| Stripe billing SaaS | ⬜ | § Facturación |

---

## Estructura workspace

```
dakinis-systems/              control repo (NO despliega platform/ en git)
├── packages/shared-brand/    fuente de verdad catálogo/marca
├── gateway/
└── docs/

platform/core/                → repo dakinis-core (Railway Core Back/Front)
├── packages/shared-brand/    copia vendoreada para deploy
├── railpack.json             Core Back
├── railpack.web.json         Core Front
└── scripts/sync-shared-brand.mjs

apps/landing/                   → repo dakinis-landing
```

---

## Smoke rápido

```bash
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://api.dakinissystems.com/core/api/public/catalog | head -c 200
curl -sS -o /dev/null -w "landing:%{http_code}\n" https://dakinissystems.com/
curl -sS -o /dev/null -w "core:%{http_code}\n" https://core.dakinissystems.com/hub
```

| Prueba manual | Esperado |
|---------------|----------|
| `/api/health` | `whatsappConfigured: true` si env WhatsApp en Back |
| Landing footer + `#contacto` | Legal, mailto, WhatsApp (env) |
| Core `/hub` | Tile **WhatsApp** → `/app/whatsapp` |
| Core `/app/whatsapp/conversations` | Hilos / envío (con sesión + plan Pro) |
| Webhook Meta | Verify token + POST mensajes |
| Core Back logs | `listening on port` sin errores de módulo |

---

## i18n (ES / EN)

| Capa | Estado |
|------|--------|
| `@dakinis/shared-brand` JSON `i18n` | ✅ productos, hub-modules, tagline |
| Core `locales/es.js` ↔ `en.js` | ✅ paridad (incl. `app.whatsapp.*`) |
| Landing `translations.js` + legal | ✅ |
| StreamAutomator `es.json` ↔ `en.json` | ✅ |
| Verificación | `node scripts/check-locale-parity.mjs` |

Detalle: [`I18N-ECOSYSTEM.md`](./I18N-ECOSYSTEM.md)

---

## Referencias

- [`WHATSAPP-ROADMAP.md`](./WHATSAPP-ROADMAP.md)  
- [`WHATSAPP-INTEGRATION.md`](./WHATSAPP-INTEGRATION.md)  
- [`legal/whatsapp-meta-business-tools-base.md`](./legal/whatsapp-meta-business-tools-base.md)  
- [`I18N-ECOSYSTEM.md`](./I18N-ECOSYSTEM.md)  
- [`DAKINIS-HUB-VISION.md`](./DAKINIS-HUB-VISION.md)  
- [`supabase/schemas/03-whatsapp-messages.sql`](./supabase/schemas/03-whatsapp-messages.sql)  
- [`packages/shared-brand/`](../packages/shared-brand/)  
- [`observability/SENTRY-SETUP.md`](./observability/SENTRY-SETUP.md)  
- [`railway.env.example`](./railway.env.example)
