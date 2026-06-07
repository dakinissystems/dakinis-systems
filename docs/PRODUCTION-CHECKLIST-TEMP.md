# Checklist producción — temp

> **Audiencia:** operador (uso interno).  
> **Actualizado:** 19 junio 2026  
> **Fuente canónica:** [`OPERATIONS.md`](./OPERATIONS.md) §5 — copia de trabajo marcable. Borrar o archivar cuando el deploy esté cerrado.

**Orden recomendado:** código → sync → SQL → variables → deploy → smoke → pilotos.

**Progreso (jun 2026):** §0 ✅ · Core Back vars §2 ✅ · Supabase §1 ⬜ · Auth §3 ⬜ · Front §4 ⬜ · Redeploy §6 ⬜

---

## 0. Pre-deploy (local) ✅

- [x] `cd D:\dakinis-systems\platform\core`
- [x] `npm ci` (si falla el lock → `npm install`)
- [x] `npm run build -w @dakinis/web`
- [x] `npm run start -w @dakinis/api` — arranca sin error
- [x] `npm test -w @dakinis/api` — **37/37** tests OK
- [x] `node scripts/sync-shared-brand.mjs` (desde `platform/core`)
- [x] Push a `dakinissystems/dakinis-core` con:
  - seguridad (master key, plan gating, bcrypt API keys, AppGuard)
  - onboarding por email (contraseña temporal + reset)
  - credenciales usuario (`10-user-credentials`)

---

## 1. Supabase (SQL Editor)

**Proyecto:** el de Dakinis Core/Auth (mismo `DATABASE_URL` que Railway Core Back). **No** el de AkoeNet.

**Dónde:** [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor** → New query → pegar script → **Run**.

### ¿Qué ejecutar?

| Situación | Qué correr |
|-----------|------------|
| **Prod ya tenía `00`–`09`** (tenants demo, CRM, etc.) | Solo filas **10** → **004** → **006b** → **99** |
| **Instalación nueva** (schema vacío) | Todas las filas **1**–**17** en orden |

### Orden archivo por archivo

Copia cada archivo desde `docs/supabase/` en el repo local. Marca al ejecutar:

| # | Archivo | Qué crea / hace | Hecho |
|---|---------|-----------------|-------|
| 1 | `schemas/00-bootstrap-schemas.sql` | Schemas `dakinis_auth`, `dakinis_core_prod`, … | ⬜ |
| 2 | `schemas/01-dakinis-auth.sql` | IdP: `users`, `refresh_tokens` | ⬜ |
| 3 | `schemas/02-dakinis-core-prod.sql` | Core base: `business`, `users`, stock, … | ⬜ |
| 4 | `schemas/03-whatsapp-messages.sql` | `tenant_whatsapp_*` | ⬜ |
| 5 | `schemas/04-crm-core.sql` | CRM + conversaciones WA | ⬜ |
| 6 | `schemas/05-tenant-intelligence.sql` | branches, módulos, webhooks | ⬜ |
| 7 | `schemas/06-tenant-intelligence-v2.sql` | deals, goals, finance, red | ⬜ |
| 8 | `schemas/07-bos-platform.sql` | subscriptions, billing, portal | ⬜ |
| 9 | `schemas/08-telemetry.sql` | `tenant_feature_usage` | ⬜ |
| 10 | `schemas/09-feature-events.sql` | `tenant_feature_events` | ⬜ |
| 11 | **`schemas/10-user-credentials.sql`** | columnas reset/onboarding en `users` | ⬜ |
| 12 | `004-rls-lockdown-all.sql` | RLS + FORCE en todas las tablas | ⬜ |
| 13 | `006b-rls-policies-missing-tables.sql` | Políticas deny anon/authenticated | ⬜ |
| 14 | `005-advisor-functions-storage.sql` | *(opcional)* advisor Storage | ⬜ |
| 15 | **`schemas/99-verify-all-tables.sql`** | Diagnóstico — debe devolver **0 filas** × 3 | ⬜ |

> **006 vs 006b:** 1ª vez en el proyecto → `006-rls-policies-deny-api.sql` también vale. Si ya corriste `006` antes y solo añadiste tablas `03`–`10` → `006b`.

### Conexión Railway ↔ Supabase (ya en Core Back ✅)

- [x] `POSTGRES_SCHEMA=dakinis_core_prod`
- [x] `DB_DRIVER=postgres`
- [x] `DATABASE_URL` configurada (comprueba pooler **6543**; opcional `?pgbouncer=true`)
- [ ] `/api/health` en prod muestra `"db":"postgres"` y `"postgresSchema":"dakinis_core_prod"`

### Tras ejecutar SQL

- [x] `99-verify-all-tables.sql` → **0 filas** (tablas faltantes)
- [x] Misma query → **0 filas** (columnas `contact_id` / `conversation_id` en WA)
- [x] Misma query → **0 filas** (RLS sin política)
- [x] Supabase **Security Advisor** → **0** «RLS Enabled No Policy»
- [x] Redeploy Core Back (por si health aún no refleja tablas nuevas)

> Core Back aplica `10` al arrancar (`ALTER … IF NOT EXISTS`), pero **ejecuta `10` en SQL Editor** igualmente y corre `99` para confirmar.

Guía: [`supabase/SETUP.md`](./supabase/SETUP.md) · Índice tablas: [`supabase/schemas/README.md`](./supabase/schemas/README.md)

---

## 2. Variables Railway — Core Back

| Variable | Obligatoria | Hecho | Notas |
|----------|-------------|-------|-------|
| `NODE_ENV` | ✅ | ✅ | `production` |
| `JWT_SECRET` | ✅ | ✅ | Misma en auth y Core |
| `DATABASE_URL` | ✅ | ✅ | Supabase pooler 6543 |
| `DB_DRIVER` | ✅ | ✅ | `postgres` |
| `POSTGRES_SCHEMA` | ✅ | ✅ | `dakinis_core_prod` |
| `DAKINIS_MASTER_API_KEY` | ✅ | ✅ | ≥24 chars, ≠ `dakinis-dev-key` |
| `CORS_ORIGIN` | ✅ | ✅ | `https://core.dakinissystems.com` |
| `CORE_WEB_URL` | ✅ | ✅ | enlaces reset en emails |
| `RESEND_API_KEY` | ✅ | ✅ | Onboarding + reset |
| `RESEND_FROM` | ✅ | ✅ | dominio verificado en Resend |
| `WHATSAPP_ACCESS_TOKEN` | ✅ | ✅ | Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | ✅ | ✅ | Meta |
| `WHATSAPP_VERIFY_TOKEN` | ✅ | ✅ | Webhook GET |
| `WHATSAPP_APP_SECRET` | ✅ | ✅ | Firma POST webhook |
| `WHATSAPP_DEFAULT_BUSINESS_ID` | ✅ | ✅ | Tenant por defecto WA |
| `O1PENAI_API_KEY` | 🟡 | ⬜ | Solo si usas Copilot/IA |
| `STRIPE_SECRET_KEY` | 🔜 | ⬜ | Post-pilotos |
| `STRIPE_WEBHOOK_SECRET` | 🔜 | ⬜ | Post-pilotos |

**Webhook Meta:** `https://api.dakinissystems.com/core/webhooks/whatsapp`

**Sin `RESEND_*`:** el alta de negocio en `/admin` sigue funcionando; el panel muestra contraseña temporal y enlace de reset para copiar manualmente.

Plantilla: [`railway.env.example`](./railway.env.example)

---

## 3. Auth — Railway (`dakinis-auth`)

**Servicio:** IdP central (`platform/auth`). **Proyecto Railway:** `dakinis-platform` (mismo que Core).

**Supabase previo:** fila **#2** del §1 — `schemas/01-dakinis-auth.sql` (schema `dakinis_auth`).

### Configuración del servicio

| Campo | Valor | Hecho |
|-------|-------|-------|
| Repositorio | Repo del IdP (`platform/auth` — según tu despliegue Railway) | ⬜ |
| Root Directory | Raíz del paquete auth (donde está `package.json` de `dakinis-auth`) | ⬜ |
| Start Command | `npm start` → `node src/app.js` | ⬜ |
| Build | `npm install` (incluye `express-rate-limit` — **obligatorio** tras último push seguridad) | ⬜ |

### Variables (pestaña Variables)

| Variable | Obligatoria | Hecho | Valor / notas |
|----------|-------------|-------|----------------|
| `NODE_ENV` | ✅ | ⬜ | `production` |
| `PORT` | ✅ | ⬜ | `4000` (Railway asigna `PORT` automático; puede omitirse) |
| `JWT_SECRET` | ✅ | ⬜ | **Mismo valor exacto** que Core Back §2 |
| `DATABASE_URL` | ✅ | ⬜ | Misma URI Supabase pooler **6543** que Core Back |
| `DATABASE_SSL` | ✅ | ⬜ | `true` |
| `AUTH_SCHEMA` | ✅ | ⬜ | `dakinis_auth` |
| `CORS_ORIGINS` | ✅ | ⬜ | `https://core.dakinissystems.com,https://akoenet.dakinissystems.com` *(ajusta productos)* |
| `JWT_ACCESS_TTL` | 🟡 | ⬜ | `15m` (default) |
| `JWT_LEGACY_LONG_TTL` | 🟡 | ⬜ | `false` en prod |
| `REDIS_URL` | 🟡 | ⬜ | `${{Redis.REDIS_URL}}` si usas refresh/cache |
| `SENTRY_DSN` | 🟡 | ⬜ | Opcional |

- [ ] Tras cambiar vars → **Redeploy** `dakinis-auth`
- [ ] Gateway expone auth: `https://auth.dakinissystems.com/auth` o `https://api.dakinissystems.com/auth/` (según `gateway/routes/default.conf`)

### Verificación Auth

```bash
curl -sS https://auth.dakinissystems.com/auth/health
# o vía gateway:
curl -sS https://api.dakinissystems.com/auth/health
```

| Prueba | Esperado | Hecho |
|--------|----------|-------|
| `GET /auth/health` | `200` | ⬜ |
| `POST /auth/login` × 6 en 15 min | Rate limit `429` tras 5 intentos | ⬜ |
| `JWT_SECRET` = Core Back | Login IdP + exchange en Core sin error de firma | ⬜ |

---

## 4. Core Front — Railway

**Servicio:** SPA React + proxy `/api` → Core Back (`web/serve-production.mjs`). **Repo:** `dakinissystems/dakinis-core` (mismo monorepo, **servicio separado** del API).

### Configuración del servicio

| Campo | Valor | Hecho |
|-------|-------|-------|
| Repositorio | `dakinissystems/dakinis-core` | ⬜ |
| Root Directory | *(vacío — raíz monorepo)* | ⬜ |
| Build Command | `npm install && npm run build -w @dakinis/web` | ⬜ |
| Start Command | `npm run start:web` → `node web/serve-production.mjs` | ⬜ |
| Dominio público | `core.dakinissystems.com` | ⬜ |

### Variables runtime (servidor Node — **no** solo build)

| Variable | Obligatoria | Hecho | Valor / notas |
|----------|-------------|-------|----------------|
| `API_UPSTREAM` | ✅ | ⬜ | URL del Core Back, ej. `https://dakinis-core-production.up.railway.app` *(sin barra final)* |
| `PORT` | ✅ | ⬜ | Lo asigna Railway automáticamente |

`serve-production.mjs` reenvía las peticiones del navegador a `/api/*` hacia `API_UPSTREAM`. Sin esto, login y panel fallan con «Failed to fetch» aunque el build sea correcto.

**Alternativa Railway:** referencia al servicio API, ej. `https://${{dakinis-core-production.RAILWAY_PUBLIC_DOMAIN}}` si el nombre del servicio coincide.

### Variables build Vite (redeploy obligatorio si cambian)

| Variable | Obligatoria | Hecho | Valor / notas |
|----------|-------------|-------|----------------|
| `VITE_DAKINIS_AUTH_URL` | 🟡 | ⬜ | `https://auth.dakinissystems.com/auth` — solo si usas botón **SSO IdP** en login |
| `VITE_API_BASE_URL` | 🟡 | ⬜ | Opcional si usas proxy `/api` en el mismo host (`core.dakinissystems.com`) |
| `VITE_SENTRY_DSN` | 🟡 | ⬜ | Opcional |

> Login **local Core** (`POST /api/auth/login`) funciona **sin** `VITE_DAKINIS_AUTH_URL`. El SSO IdP/AkoeNet sí lo necesita.

- [ ] **Redeploy** Core Front tras vars (build + start)
- [ ] Rutas nuevas accesibles: `/login`, `/forgot-password`, `/reset-password`, `/admin`

### Verificación Core Front

| Prueba | URL | Esperado | Hecho |
|--------|-----|----------|-------|
| Hub carga | `https://core.dakinissystems.com/hub` | `200` | ⬜ |
| Login UI | `/login` | Formulario + enlace «¿Olvidaste la contraseña?» | ⬜ |
| Reset UI | `/reset-password` | Formulario (con `?token=` del email) | ⬜ |
| API vía proxy | `/api/health` en el mismo host | JSON con `"db":"postgres"` | ⬜ |
| Login real | `/login` → credenciales tenant | Redirige a `/hub` o a forgot si `mustChangePassword` | ⬜ |

```bash
curl -sS https://core.dakinissystems.com/api/health
```

---

## 5. Landing (opcional ahora)

| Variable | Hecho |
|----------|-------|
| `VITE_HUB_URL` | ⬜ |
| `VITE_CONTACT_WHATSAPP_*` | ⬜ |

- [ ] Sync brand → landing:

```powershell
robocopy packages\shared-brand apps\landing\packages\shared-brand /E /XD node_modules
```

- [ ] Push `dakinis-landing` + redeploy

---

## 6. Railway — mapa de servicios y redeploy

**Proyecto:** `dakinis-platform` (o equivalente). **Compute:** Railway. **Datos:** Supabase (no plugin Postgres Railway).

### Servicios del ecosistema Core

| Servicio Railway | Código | Start / Build | Dominio público | Estado |
|------------------|--------|---------------|-----------------|--------|
| **Core Back** (API) | `dakinissystems/dakinis-core` · root vacío | Build: `npm install` · Start: `npm run start -w @dakinis/api` | `dakinis-core-production.up.railway.app` + gateway `/core/` | Vars ✅ |
| **Core Front** (web) | mismo repo · **servicio aparte** | Build: `npm install && npm run build -w @dakinis/web` · Start: `npm run start:web` | `core.dakinissystems.com` | ⬜ §4 |
| **dakinis-auth** (IdP) | `platform/auth` | Build: `npm install` · Start: `npm start` | `auth.dakinissystems.com` o gateway `/auth/` | ⬜ §3 |
| **dakinis-gateway** | repo `dakinis-systems` | nginx | `api.dakinissystems.com` | ⬜ revisar |
| **Redis** | plugin Railway | — | interno | 🟡 opcional |

### Reglas de despliegue

| Regla | Detalle |
|-------|---------|
| **NO** desplegar desde `dakinis-systems` | Solo docs/SQL/gateway — el producto va en `dakinis-core` |
| **NO** Root `web/` o `api/` sueltos | Monorepo raíz con workspaces |
| Build | `npm install` (no `npm ci` roto en Railpack) |
| `shared-brand` | Vendoreado en `platform/core/packages/shared-brand`; sync antes de push |
| Mismo `JWT_SECRET` | Core Back + Auth + cualquier servicio que verifique JWT |
| Misma `DATABASE_URL` | Core Back + Auth → Supabase pooler 6543 |

### Orden de redeploy recomendado

Ejecutar **después** de Supabase §1:

| # | Acción | Hecho |
|---|--------|-------|
| 1 | **Core Back** — redeploy (vars ya configuradas §2) | ⬜ |
| 2 | **dakinis-auth** — `npm install` + vars §3 + redeploy | ⬜ |
| 3 | **Core Front** — `API_UPSTREAM` §4 + redeploy (build incluye rutas reset) | ⬜ |
| 4 | **Gateway** — solo si cambiaste rutas en `gateway/routes/default.conf` | ⬜ |

### URLs públicas (referencia)

| Ruta | Destino |
|------|---------|
| `https://core.dakinissystems.com` | Core Front |
| `https://core.dakinissystems.com/api/*` | Proxy front → Core Back |
| `https://api.dakinissystems.com/core/*` | Gateway → Core Back |
| `https://api.dakinissystems.com/auth/*` | Gateway → dakinis-auth |
| `https://auth.dakinissystems.com/auth/*` | Auth IdP (si DNS directo) |

### Incidentes conocidos

- `npm ci` sin lock en layer → usar `npm install`
- Front sin `API_UPSTREAM` → login falla aunque el API esté bien
- Cambiar `VITE_*` sin redeploy → build antiguo en caché
- Tras cambiar `business.plan` → usuario debe **logout + login**
- `shared-brand` vendoreado en `platform/core/packages/shared-brand`

---

## 7. Backups

- [ ] Workflow `backup-postgres.yml` activo
- [ ] Secret `BACKUP_DATABASE_URL` configurado
- [ ] Probar que genera backup

---

## 8. Smoke test (tras deploy)

```bash
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://api.dakinissystems.com/core/api/public/catalog | head -c 200
curl -sS -o /dev/null -w "core:%{http_code}\n" https://core.dakinissystems.com/hub
```

| Prueba manual | Esperado | Hecho |
|---------------|----------|-------|
| `https://core.dakinissystems.com/#precios` | Planes 29 / 79 / 149 € + implantación | ⬜ |
| `/app/settings` | Facturación híbrida + adopción | ⬜ |
| `/admin` (platform_admin) | Telemetría pilotos | ⬜ |
| `GET /api/v1/tenant/billing/summary` | Plan + excesos estimados | ⬜ |
| Login 6 veces seguidas (auth) | Rate limit tras 5 intentos | ⬜ |
| Supabase advisor | 0 «RLS Enabled No Policy» | ⬜ |
| `99-verify-all-tables.sql` | 0 tablas/columnas/RLS faltantes | ⬜ |

### Onboarding y contraseñas (nuevo)

| Prueba | Esperado | Hecho |
|--------|----------|-------|
| `/admin` → crear negocio con **solo email** propietario | Mensaje «credenciales enviadas» o fallback con temp + enlace | ⬜ |
| Bandeja email propietario | Correo con contraseña temporal + enlace `/reset-password?token=…` | ⬜ |
| Abrir enlace reset | Formulario nueva contraseña → éxito → login OK | ⬜ |
| `/login` → «¿Olvidaste la contraseña?» | `POST /api/auth/forgot-password` → email con enlace | ⬜ |
| `/admin` → usuarios → **Editar email** | `PATCH /api/platform/users/:id` | ⬜ |
| `/admin` → usuarios → **Reenviar reset** | `POST /api/platform/users/:id/resend-password-reset` | ⬜ |
| `/app/settings` → Equipo → reenviar reset (owner/manager) | `POST /api/tenant/users/:id/resend-password-reset` | ⬜ |

---

## 9. Pilotos (cuando smoke OK)

- [ ] Alta tenant en `/admin` con email propietario real (no `.local`)
- [ ] Propietario confirma negocio vía email (reset contraseña)
- [ ] Cambio de plan en `/admin` → propietario **logout + login**
- [ ] Probar WhatsApp end-to-end
- [ ] Medir adopción 30 días (`tenant_feature_usage` / `tenant_feature_events`) antes de ampliar scope

---

## 10. Stripe (después de pilotos)

- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` en Core Back
- [ ] SDK de cobro *(aún no implementado — tablas `07` listas)*

---

## Bloqueadores actuales

Lo que impide pilotos reales hoy:

1. **SQL Supabase §1** — mínimo `10` + `004` + `006b` + `99` (o todo `00`–`10` si es nuevo)
2. ~~Vars Core Back §2~~ ✅
3. **Auth §3** — vars + redeploy (`express-rate-limit`, `JWT_SECRET` = Core)
4. **Core Front §4** — `API_UPSTREAM` + redeploy (rutas reset)
5. **Redeploy orden §6** — Back → Auth → Front → smoke §8

Stripe (§10) y backups (§7) pueden ir en paralelo o justo después.

---

## Ya en código (no requiere más dev)

### Seguridad

| Item | Estado |
|------|--------|
| Master API key fail en prod | ✅ |
| Plan gating BOS | ✅ |
| Rate limit Auth IdP | ✅ |
| Docker solo gateway en prod | ✅ |
| Tests integración (**37/37**) | ✅ |
| AppGuard `/app/*` | ✅ |
| API keys bcrypt | ✅ |
| Webhook WA exige secret en prod | ✅ |

### Onboarding y credenciales

| Item | Estado |
|------|--------|
| Alta negocio → contraseña temporal (auto o manual) | ✅ |
| Email bienvenida con temp + enlace reset (Resend) | ✅ |
| `POST /api/auth/forgot-password` + `reset-password` | ✅ |
| Admin: editar email + reenviar reset | ✅ |
| Tenant owner/manager: editar email + reenviar reset | ✅ |
| UI `/forgot-password`, `/reset-password` | ✅ |
| SQL `10-user-credentials` + migración SQLite/Postgres | ✅ |

### Pendiente operador (no código)

| Item | Acción |
|------|--------|
| Supabase SQL §1 | Ejecutar scripts (mín. `10`→`006b`→`99`) |
| Railway Auth §3 | Vars + redeploy + rate limit |
| Railway Front §4 | `API_UPSTREAM` + redeploy |
| Railway §6 | Orden Back → Auth → Front |
| Resend | Probar envío real (alta negocio en `/admin`) |
