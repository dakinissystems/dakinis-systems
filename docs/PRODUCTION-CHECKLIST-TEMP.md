# Producción y visión Dakinis Systems (TEMP)

> **Actualizado:** 3 junio 2026  
> **Dos capas:** (1) checklist operativo deploy/prod · (2) posicionamiento y roadmap de producto.  
> Guías: [`supabase/SETUP.md`](./supabase/SETUP.md) · [`DAKINIS-HUB-VISION.md`](./DAKINIS-HUB-VISION.md) · [`LANDING-CORE-STRUCTURE.md`](./LANDING-CORE-STRUCTURE.md)

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
| **Operativa** | Inventario · Restaurante · WhatsApp (parcial) |
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

**Hoy:** Hub = colección de tiles.

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
| Secciones «Aplicaciones» vs «Marketplace» en UI | ⬜ |
| Activación/desactivación por plan | ⬜ |

### 2. CRM como núcleo

**Hoy:** módulos operativos (restaurante, stock, mensajes) sin eje «cliente».

**Objetivo:** todo gira alrededor del **Cliente**:

```
Cliente → Reserva → Pedido → Factura → WhatsApp → Seguimiento
```

**Modelo de datos objetivo:**

| Tabla | Rol |
|-------|-----|
| `contacts` | Personas |
| `companies` | Organizaciones |
| `deals` | Oportunidades / pipeline |
| `activities` | Llamadas, notas, tareas |

| Estado | Notas |
|--------|-------|
| CRM en roadmap Hub | 🟡 tile / módulo referenciado |
| Esquema CRM unificado en Core | ⬜ |
| Enlace reservas/pedidos/factura → contacto | ⬜ |

### 3. Centro de comunicación unificado — *Dakinis Communications*

**Hoy:** WhatsApp como módulo aislado.

**Objetivo:** producto **Communications** con canales:

WhatsApp · Email · Telegram · Discord · SMS · Push

**Una pantalla:** *Conversaciones* (inbox omnicanal por tenant).

| Estado | Notas |
|--------|-------|
| WhatsApp reglas + preview API | ✅ |
| WhatsApp Business API (envío real) | ⬜ |
| Inbox unificado | ⬜ |
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
| Handlers WhatsApp dry-run | 🟡 |
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

Ejemplos de preguntas:

- ¿Cuál es mi producto más rentable?  
- ¿Qué proveedor me falla más?  
- ¿Qué mesas generan más ingresos?  
- ¿Cuánto stock debo pedir?

| Estado | Notas |
|--------|-------|
| Tile IA en Hub | roadmap |
| RAG / queries sobre tenant DB | ⬜ |

### 7. Portal del cliente (B2B2C)

**Hoy:** sistema orientado a **empleados**.

**Objetivo:** `portal.{midominio}.com` (o subdominio por tenant) donde el **cliente final**:

- Ve pedidos y reservas  
- Descarga facturas  
- Firma documentos  
- Chatea por WhatsApp  

| Estado | Notas |
|--------|-------|
| Portal cliente | ⬜ |

### 8. Facturación SaaS (cobrar el software)

**Hoy:** preparado para **vender** software; no para **cobrar** automáticamente.

Cadena objetivo:

```
Tenant → Plan → Suscripción → Factura → Pago (Stripe)
```

| Estado | Notas |
|--------|-------|
| Planes en tenant / catálogo | 🟡 parcial |
| Stripe Billing | ⬜ |
| Facturación operativa del negocio (tenant) | ⬜ distinto de billing SaaS |

### 9. Observabilidad comercial (panel cliente)

Además de health checks y analytics de conversión:

**Panel Cliente** (admin del tenant o Dakinis ops):

- Usuarios activos  
- Mensajes WhatsApp  
- Reservas  
- Consumo API  
- Almacenamiento  

| Estado | Notas |
|--------|-------|
| `/api/health` + Sentry | ✅ |
| GA4 / dataLayer | 🟡 |
| Panel uso por tenant | ⬜ |

### 10. Marketplace real

**Hoy:** Hub muestra Dakinis One, AkoeNet, StreamAutomator.

**Objetivo:** marketplace donde **terceros** publiquen módulos (Calendario, Contabilidad, POS, IA, Firma digital, …).

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
| P0 | WhatsApp Business real (Meta API) | ⬜ |
| P1 | CRM núcleo (`contacts`, `companies`, `deals`, `activities`) | ⬜ |
| P1 | Stripe (plan → suscripción → pago) | ⬜ |
| P1 | Portal cliente (MVP) | ⬜ |
| Ops | Deploy prod estable (Landing, Core Back, auth) | 🟡 ver sección Railway |

### 2027 — Automatizar y escalar valor

- Automatizaciones (motor SI/ENTONCES)  
- IA empresarial (Dakinis AI)  
- Reservas (producto maduro, ligado a CRM)  
- Facturación operativa del tenant  

### 2028 — Sistema operativo para pymes

**Dakinis Hub** como SO donde la empresa entra **una vez** y gestiona:

Clientes · Ventas · Inventario · Restaurante · WhatsApp · Automatizaciones · Comunidad · Streaming · Analítica · Facturación

---

## Implementado en código (requiere deploy / push)

| Área | Estado | Detalle |
|------|--------|---------|
| **`@dakinis/shared-brand`** | ✅ | company, URLs, `products.json`, `hub-modules.json`, analytics, SSO, contacto |
| **Landing = ventas** | ✅ | `/`, `/productos/*`, `/servicios`, `/hub` → Core |
| **Landing deploy standalone** | 🟡 | `packages/shared-brand` vendoreado; push + redeploy pendiente |
| **Landing footer + contacto** | 🟡 | Legal + mailto + WhatsApp vía `VITE_CONTACT_WHATSAPP_*` |
| **Core = producto SaaS** | ✅ | `/login`, `/hub`, `/sistema/*`, `/app/*` |
| **Core Back `restaurant-floor` export** | 🟡 | Fix `shared/package.json`; push pendiente |
| **Dakinis Hub** | ✅ | Tiles + módulos (CRM, WhatsApp, inventario, reservas en catálogo) |
| **Auth + SSO base** | 🟡 | Exchange IdP; falta prod completo |
| **Catálogo dinámico** | ✅ | API + `/admin` + `platform_kv` |
| **Analytics base** | ✅ | eventos + GA4 opcional |

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
```

---

## Incidentes Railway recientes (jun 2026)

### dakinis-landing

| Síntoma | Fix en código |
|---------|----------------|
| `npm ci` + `file:../../packages/shared-brand` | Vendor `./packages/shared-brand` + lockfile |
| Footer incompleto | Enlaces legal + © + contacto |
| WhatsApp `wa.me/549…` | `dakinisContactWhatsappUrl` + env Railway |

**Acción:** push `dakinissystems/dakinis-landing` → redeploy.

### Core Back

| Síntoma | Fix en código |
|---------|----------------|
| `ERR_PACKAGE_PATH_NOT_EXPORTED` (`restaurant-floor.js`) | Export en `@dakinis/shared` |
| Healthcheck fallido | Deploy Logs; `JWT_SECRET`, Postgres, listen en `PORT` Railway |

**Acción:** push `dakinissystems/dakinis-core` → redeploy. No fijar `PORT` manual.

---

## Pendiente — operaciones

### Backups

| Acción | Estado |
|--------|--------|
| Workflow [`backup-postgres.yml`](../.github/workflows/backup-postgres.yml) | ✅ |
| Secret `BACKUP_DATABASE_URL` (5432 directo) | ⬜ |
| Primer backup verificado en Actions | ⬜ |
| Restore mensual [`restore-postgres-test.ps1`](../scripts/restore-postgres-test.ps1) | ⬜ |

### Deploy (push pendiente)

| Repo / servicio | Estado |
|-----------------|--------|
| `dakinissystems/dakinis-systems` | ⬜ docs + shared-brand |
| `dakinissystems/dakinis-core` | 🟡 ahead local |
| `dakinissystems/dakinis-landing` | 🟡 local sin push |
| `dakinis-auth`, AkoeNet, StreamAutomator | ⬜ / 🟡 verificar env |

### Base de datos Core (prod)

| Acción | Estado |
|--------|--------|
| [`02-dakinis-core-prod.sql`](./supabase/schemas/02-dakinis-core-prod.sql) + `platform_kv` | ⬜ |
| `POSTGRES_SCHEMA=dakinis_core_prod` en Core Back | ⬜ |

### Variables de entorno (prod)

| Variable | Servicio | Estado |
|----------|----------|--------|
| `JWT_SECRET` + issuer/audience | auth, Core Back, SA | ⬜ |
| `DATABASE_URL` + `DB_DRIVER=postgres` | Core Back | ⬜ |
| `VITE_DAKINIS_AUTH_URL` | Core Front, AkoeNet | ⬜ |
| `VITE_HUB_URL`, `VITE_GA_MEASUREMENT_ID` | Landing | ⬜ |
| `VITE_CONTACT_WHATSAPP_URL` o `_PHONE` | Landing | ⬜ |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` | Core Back | ⬜ |
| `WHATSAPP_DEFAULT_BUSINESS_ID`, `WHATSAPP_APP_SECRET` (webhook) | Core Back | ⬜ |
| `API_UPSTREAM` | Core Front | ⬜ |

Plantilla: [`railway.env.example`](./railway.env.example) · [`apps/landing/.env.example`](../apps/landing/.env.example)

**Landing — vendor `shared-brand`:** al cambiar `packages/shared-brand` en dakinis-systems, copiar a `apps/landing/packages/shared-brand` antes del push.

---

## Corto plazo técnico (alineado con 2026)

| Bloque | Estado | Enlace visión |
|--------|--------|----------------|
| SSO Hub → AkoeNet / SA | 🟡 | § Roadmap 2026 P0 |
| WhatsApp Business API (fases 1–4) | 🟡 | `docs/WHATSAPP-ROADMAP.md` · Hub `/app/whatsapp` · SQL `03-whatsapp-messages.sql` |
| WhatsApp ↔ CRM ↔ OpenAI (fase 5) | ⬜ | Evento `crm.whatsapp.inbound` (stub) |
| GA4 en Railway | 🟡 | § Observabilidad |
| Stripe billing SaaS | ⬜ | § Facturación SaaS |

---

## Estructura workspace

```
dakinis-systems/          control repo
├── packages/shared-brand/
├── gateway/
└── docs/

platform/core/            → dakinis-core
apps/landing/             → dakinis-landing (+ packages/shared-brand vendoreado)
apps/akoenet/ · streamautomator/ · platform/auth/
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
| Landing footer + `#contacto` | Legal, mailto, WhatsApp real (env) |
| Core `/hub` | Tiles productos + módulos One |
| SSO AkoeNet / SA | `/auth/hub-sso` sin re-login (con IdP) |
| Core Back logs | `listening on port` sin `ERR_PACKAGE_PATH_NOT_EXPORTED` |

---

## i18n (ES / EN)

| Capa | Estado |
|------|--------|
| Catálogo + marca (`@dakinis/shared-brand` `i18n` en JSON) | ✅ productos, hub-modules, tagline |
| Core `locales/es.js` ↔ `en.js` | ✅ paridad 538 claves |
| Landing `translations.js` | ✅ paridad 94 claves |
| StreamAutomator `es.json` ↔ `en.json` | ✅ paridad 1472 claves |
| Hub / Landing usan `locale` al renderizar catálogo | ✅ |
| Verificación | `node scripts/check-locale-parity.mjs` |

Detalle: [`I18N-ECOSYSTEM.md`](./I18N-ECOSYSTEM.md)

## Referencias

- [`I18N-ECOSYSTEM.md`](./I18N-ECOSYSTEM.md)  
- [`DAKINIS-HUB-VISION.md`](./DAKINIS-HUB-VISION.md)  
- [`packages/shared-brand/`](../packages/shared-brand/)  
- [`observability/SENTRY-SETUP.md`](./observability/SENTRY-SETUP.md)  
- [`railway.env.example`](./railway.env.example)  
