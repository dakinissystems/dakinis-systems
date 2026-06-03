# Producción Dakinis Systems (TEMP)

> **Actualizado:** 19 mayo 2026 (revisión post Hub SSO + catálogo admin)  
> Estado del ecosistema (Hub, shared-brand, Landing, Core) y pendientes operativos.  
> Guías: [`supabase/SETUP.md`](./supabase/SETUP.md) · [`DAKINIS-HUB-VISION.md`](./DAKINIS-HUB-VISION.md) · [`LANDING-CORE-STRUCTURE.md`](./LANDING-CORE-STRUCTURE.md)

---

## Implementado en código (requiere deploy)

| Área | Estado | Detalle |
|------|--------|---------|
| **`@dakinis/shared-brand`** | ✅ | `packages/shared-brand/` — company, URLs, `products.json`, `hub-modules.json`, analytics, SSO helpers |
| **Landing = ventas** | ✅ | `dakinissystems.com` — `/`, `/productos/*`, `/servicios`, `/hub` → redirect Core Hub |
| **Core = producto SaaS** | ✅ | `/` home corta, `/login`, `/hub`, `/sistema/*`, `/app/*` |
| **Dakinis Hub** | ✅ | Tiles productos (One, SA, AkoeNet) + módulos One (CRM, **WhatsApp**, inventario, reservas, roadmap) |
| **Marca unificada** | ✅ | Dakinis Systems = empresa · Dakinis One = producto principal |
| **Analytics conversión** | ✅ | `dakinisTrackEvent` → `dataLayer` + breadcrumb Sentry + gtag si `VITE_GA_MEASUREMENT_ID` |
| **Catálogo admin (Core)** | ✅ | `GET/PUT /api/platform/catalog`, panel `/admin`; requiere deploy API + tabla `platform_kv` en Postgres |
| **SSO AkoeNet (Hub)** | 🟡 | `/auth/hub-sso` + puente Core `/ecosystem/launch/akoenet` con JWT IdP; requiere `VITE_DAKINIS_AUTH_URL` + login SSO en Core |
| **SSO StreamAutomator** | 🟡 | `/auth/hub-sso` + `POST /api/user/auth/exchange`; requiere `VITE_DAKINIS_AUTH_URL` / `REACT_APP_DAKINIS_AUTH_URL` |
| **Home legacy** | ✅ | `platform/core/web/src/legacy/HomePage.jsx` — no en rutas |

### Dominios (sin cambio)

| URL | Rol |
|-----|-----|
| `https://dakinissystems.com` | Landing corporativa |
| `https://core.dakinissystems.com` | Dakinis One + **Hub** (`/hub`) |
| `https://api.dakinissystems.com` | Gateway (`/auth/`, `/core/`, …) |

### Flujo usuario actual

```
Landing (ventas)
    → Login (Core) o Hub directo
    → Hub (sesión Core en sessionStorage)
    → Dakinis One / enlace externo SA·AkoeNet
```

### Eventos analytics (nombres)

`cta_dakinis_one_clicked` · `hub_opened` · `login_started` · `login_success` · `demo_opened` · `product_opened` · `hub_tile_clicked` · `landing_product_view`

Opcional en prod: `VITE_GA_MEASUREMENT_ID` carga gtag (GA4) además de `dataLayer`.

---

## Pendiente — operaciones

### Backups (crítico infra)

| Acción | Estado |
|--------|--------|
| Workflow [`.github/workflows/backup-postgres.yml`](../.github/workflows/backup-postgres.yml) (cron diario + artefacto 14 días) | ✅ en repo |
| Secret GitHub `BACKUP_DATABASE_URL` (Supabase **5432** directo, no pooler) | ⬜ |
| Primer backup verificado en Actions (artifact `backup.sql.gz`) | ⬜ |
| Restore mensual [`scripts/restore-postgres-test.ps1`](../scripts/restore-postgres-test.ps1) | ⬜ |

### Deploy tras cambios Hub / shared-brand / SSO

| Repo / servicio | Acción |
|-----------------|--------|
| `dakinissystems/dakinis-systems` | Push `packages/shared-brand`, `docs/`, gateway si aplica |
| `dakinissystems/dakinis-core` | Redeploy **Core API** + **Core Front** (`/hub`, `/ecosystem/launch/*`, `/admin` catálogo) |
| `dakinissystems/dakinis-landing` | Redeploy + `VITE_HUB_URL`, opcional `VITE_GA_MEASUREMENT_ID` |
| **dakinis-auth** (Railway) | `JWT_SECRET` alineado con Core; CORS incluye Core, AkoeNet, SA |
| **AkoeNet Client** | Deploy `dist/` (build **1.5.17** local lista) + `VITE_DAKINIS_AUTH_URL` |
| **AkoeNet Server** | Redeploy si hubo cambios en `/auth/exchange` |
| **StreamAutomator** | Redeploy API (`/user/auth/exchange`) + Web (`/auth/hub-sso`) + `REACT_APP_DAKINIS_AUTH_URL` |

### Base de datos Core (prod)

| Acción | Estado |
|--------|--------|
| Ejecutar bloque `platform_kv` en [`supabase/schemas/02-dakinis-core-prod.sql`](./supabase/schemas/02-dakinis-core-prod.sql) (o auto-create vía API en SQLite dev) | ⬜ en Supabase prod si aún no existe |
| Verificar `POSTGRES_SCHEMA=dakinis_core_prod` en Core Back | ⬜ |

### Variables de entorno (verificación prod)

| Variable | Servicio | Estado |
|----------|----------|--------|
| `VITE_DAKINIS_AUTH_URL` → `https://api.dakinissystems.com/auth` (o ruta gateway `/auth/`) | Core Front, AkoeNet Client | ⬜ |
| `REACT_APP_DAKINIS_AUTH_URL` (misma URL IdP) | StreamAutomator Web | ⬜ |
| `JWT_SECRET` + `JWT_ISSUER` / `JWT_AUDIENCE` coherentes | auth, Core API, SA API | ⬜ |
| `VITE_GA_MEASUREMENT_ID` | Core Front, Landing | ⬜ |
| `VITE_HUB_URL` → `https://core.dakinissystems.com/hub` | Landing | ⬜ |
| `API_UPSTREAM` en Core Front (proxy `/api`) | Core Front Railway | ⬜ |

---

## Pendiente — producto (prioridades acordadas)

### P1 — SSO entre productos

| Paso | Estado | Notas |
|------|--------|-------|
| Sesión Core persistida para ecosistema | ✅ | `dakinis_ecosystem_sso_v1` + `dakinis_idp_tokens_v1` |
| Exchange IdP → Core (`POST /api/auth/exchange`) | ✅ | Tenant en body o claim JWT (`tenant`, `tenant_slug`, …) |
| Hub → AkoeNet sin re-login (IdP) | 🟡 | `HubSso` + hash `platform_token`; login Core «Cuenta Dakinis (SSO)» |
| Hub → StreamAutomator (IdP) | 🟡 | Igual que AkoeNet: puente Core + `hub-sso` |
| `ssoReady: true` en `products.json` | ✅ | AkoeNet + StreamAutomator |

### P2 — Catálogo dinámico

| Paso | Estado |
|------|--------|
| `products.json` + `hub-modules.json` en shared-brand | ✅ |
| `GET /api/public/catalog` (lectura catálogo) | ✅ |
| `GET/PUT /api/platform/catalog` (admin plataforma) | ✅ |
| Panel admin JSON catálogo en `/admin` | ✅ |

### P3 — Métricas

| Paso | Estado |
|------|--------|
| Eventos + Sentry breadcrumb | ✅ |
| GA4 (`dakinisInitAnalytics` + `VITE_GA_MEASUREMENT_ID`) | 🟡 | Landing + Core; falta ID en Railway |
| Dashboard conversión (Looker / Metabase) | ⬜ |

### P4 — WhatsApp Business

| Paso | Estado |
|------|--------|
| Tile WhatsApp destacado en Hub | ✅ |
| Reglas + preview API (`/api/whatsapp/rules`, `/preview`) | ✅ |
| Handlers dry-run (`DAKINIS_WHATSAPP_AUTO_SEND=true` futuro) | 🟡 |
| API WhatsApp Business (envío real Meta) | ⬜ |

### Otros hitos Hub (roadmap)

| Módulo | En Hub | En producto |
|--------|--------|-------------|
| Facturación | roadmap | — |
| Analytics | roadmap | — |
| IA empresarial | roadmap | — |
| Marketplace / billing Stripe | — | ⬜ |

---

## Estructura workspace (resumen)

```
dakinis-systems/          control repo
├── packages/shared-brand/
├── gateway/
├── docs/
└── (apps/ + platform/ — repos separados)

platform/core/            dakinis-core
├── web/                  Hub, ProductHome, restaurante…
├── api/                  tenant, auth/login, auth/exchange
└── shared/

apps/landing/             dakinis-landing
```

---

## Smoke rápido

```bash
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://api.dakinissystems.com/core/api/public/catalog | head -c 200
curl -sS -o /dev/null -w "core:%{http_code}\n" https://core.dakinissystems.com/hub
curl -sS -o /dev/null -w "hub-sso:%{http_code}\n" https://akoenet.dakinissystems.com/auth/hub-sso
curl -sS -o /dev/null -w "sa-hub-sso:%{http_code}\n" https://streamautomator.com/auth/hub-sso
```

| Prueba manual | Esperado |
|---------------|----------|
| Login demo Core → `/hub` | Tiles WhatsApp (restaurante demo), inventario, productos externos |
| Hub → AkoeNet (con IdP configurado) | `/auth/hub-sso` → sesión SA sin re-login |
| Hub → StreamAutomator (con IdP) | Igual vía `/auth/hub-sso` |
| `/admin` + JWT platform_admin | Sección catálogo JSON; PUT y `public/catalog` con `source: database` |
| SSO sin IdP en Core | Enlace externo con `?dakinis_sso=1` + login manual (email precargado) |

---

## Referencias

- [`packages/shared-brand/`](../packages/shared-brand/)  
- [`observability/SENTRY-SETUP.md`](./observability/SENTRY-SETUP.md)  
- [`railway.env.example`](./railway.env.example)  
