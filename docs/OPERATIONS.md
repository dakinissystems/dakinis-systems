# Dakinis Systems — Operaciones

> Deploy, variables, health checks, backups y pendientes operativos. Arquitectura → [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Comandos útiles

```powershell
# Stack local completo
.\scripts\dev.ps1

# Sincronizar tokens de marca → Landing, Core, LifeFlow
node scripts/sync-shared-brand.mjs

# Health checks prod
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://finance-api.dakinissystems.com/health
curl -sS https://tabletop-api.dakinissystems.com/health
curl -sS https://core.dakinissystems.com/hub -o /dev/null -w "%{http_code}`n"

# Finanzas / LifeFlow local
cd D:\dakinis-systems\finanzas
npm run dev
npm test   # 87 tests

# Dakinis AI + Core (Copilot)
cd D:\dakinis-systems\platform\core
npm run dev:full:ai

# Design audit (DES)
node packages/design-audit/src/audit.mjs platform/core/web finanzas/web/src/styles

# Backup Postgres (cuando BACKUP_DATABASE_URL esté configurado)
.\scripts\backup-postgres.ps1
```

**Demo Core:** `admin@restaurante-demo.local` / `demo123` · tenant `restaurante-demo`.

Plantilla variables: [`railway.env.example`](./railway.env.example).

---

## Railway — mapa servicios (Fase 1)

| Servicio | Repo | Dominio |
|----------|------|---------|
| Gateway | `dakinis-systems` | `api.dakinissystems.com` |
| Auth | `dakinis-auth` | `auth.dakinissystems.com` |
| Core API | `dakinis-core` | `core-api.dakinissystems.com` + `/core/` |
| Core Web | `dakinis-core` | `core.dakinissystems.com` |
| Hub | `dakinis-hub` | `hub.dakinissystems.com` |
| AI API | `dakinis-ai` | `ai.dakinissystems.com` |
| AI Worker | `dakinis-ai` | interno |
| Landing | `dakinis-landing` | `dakinissystems.com` |
| StreamAutomator | `dakinis-streamautomator` | `api.streamautomator.com` |
| AkoeNet | `akoenet-*` | `api.akoenet.dakinissystems.com` |
| **LifeFlow Web** | `lifeflow` | `finance.dakinissystems.com` |
| **LifeFlow API** | `lifeflow` | **`finance-api.dakinissystems.com`** |
| **Tabletop Web** | `dakinis-tabletop` | `tabletop.dakinissystems.com` |
| **Tabletop API** | `dakinis-tabletop` | **`tabletop-api.dakinissystems.com`** |
| Redis | plugin | interno — **hoy:** AI, StreamAutomator · **roadmap:** Notifications, Hub, Billing, Search |

### Fase 1 — operativo (no cambiar)

Los servicios listados arriba son la **Fase 1** coherente con producción actual.

### Reservado — Fase 2+ (solo documentar)

No crear servicios Railway vacíos. Cuando se implementen:

| Servicio | Repo (futuro) | Prefijo gateway |
|----------|---------------|-----------------|
| Billing | [`dakinis-billing`](https://github.com/dakinissystems/dakinis-billing) | `/billing/` | mirror [`billing/`](../billing/) |
| Notifications | [`dakinis-notifications`](https://github.com/dakinissystems/dakinis-notifications) | `/notifications/` | mirror [`notifications/`](../notifications/) |
| Search | [`dakinis-search`](https://github.com/dakinissystems/dakinis-search) | `/search/` | mirror [`search/`](../search/) |
| Storage / Media | worker | `/media/` |
| Observability | workers | interno |

Contratos placeholder: [`docs/contracts/`](./contracts/README.md).

⚠️ **No usar** `api.finance.dakinissystems.com` — SSL Cloudflare free no cubre subdominio de 2º nivel.

**Workers roadmap:** Notifications · Scheduler · Media · Search — ver [`ROADMAP.md`](./ROADMAP.md).

---

## LifeFlow — env Railway

### API

| Variable | Valor / notas |
|----------|----------------|
| `FINANZAS_DB_PATH` | `/data/finanzas.db` (**requiere volume** en `/data`) |
| `FINANZAS_JWT_SECRET` | Secret **estable** (no regenerar en cada deploy) |
| `FINANZAS_CORS_ORIGINS` | `https://finance.dakinissystems.com` |
| `PORT` | Railway auto |

### Web

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://finance-api.dakinissystems.com` |

### Estabilidad prod (may 2026)

| Tema | Estado |
|------|--------|
| Crash tier `pro` / init SQLite | ✅ |
| Service Worker v3 | ✅ |
| CORS | ✅ código |
| Auth login/register | ✅ código |
| Volume SQLite persistente | 🔄 verificar mount en `/data` |
| JWT secret fijo | ✅ según `/health` |

### Auth 401 — diagnóstico (no es Supabase)

LifeFlow **no usa Supabase** para usuarios. Auth vive en **SQLite** (`users` en `finanzas.db`).

| Síntoma | Causa probable |
|---------|----------------|
| `POST /api/auth/login` → **401** | Email no existe en SQLite **o** contraseña incorrecta |
| Registro OK, login falla después | BD efímera / WAL sin checkpoint (redeploy) o volume mal montado |
| `/api/auth/me` → 401 con token viejo | JWT secret cambió entre deploys |

**Comprobar prod:**

```powershell
curl.exe -sS https://finance-api.dakinissystems.com/health
```

Esperado: `"engine":"sqlite"`, `"userCount":N`, `"configuredPath":true`.

**Recuperar cuenta en Railway** (Shell del servicio LifeFlow API):

```bash
npm run reset-password -w @finanzas/api -- tu@email.com TuNuevaClave123 --create
```

`--create` crea el usuario si no existe. Sin Supabase ni SQL manual.

**Volume Railway:** montar en **`/data`**, no solo el archivo. Variables:

- `FINANZAS_DB_PATH=/data/finanzas.db`
- `FINANZAS_JWT_SECRET=<secreto fijo>`

---

## Supabase — operaciones

Orden migraciones: [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md).

| Fase | Scripts | Prod |
|------|---------|------|
| A Estructura | 000–013 | ✅ |
| B Backfill | 014a, 014, 015 | ✅ |
| C Mejoras | 016, 016b, 017, 018, 019 | ⬜ SQL Editor |
| E Cutover apps | código + disable triggers | ⬜ |

**Regla API:** usar funciones `schema.v1_*` — no queries directas cross-schema.

Backup: workflow `.github/workflows/backup-postgres.yml` — secret `BACKUP_DATABASE_URL` pendiente.

---

## Gateway

- Config: [`gateway/routes/default.conf`](../gateway/routes/default.conf)
- LifeFlow: `/finance/health`, `/finance/api/*`, SPA `/finance/`
- Reglas cambio: [`docs/rules.md`](./rules.md)

---

## 🔴 Bloquean go-live

| # | Área | Tarea | Estado |
|---|------|-------|--------|
| 1 | Stripe | Webhook prod → `STRIPE_WEBHOOK_SECRET` | [ ] |
| 2 | Stripe | Payment Links Growth/Pro | [ ] |
| 3 | Stripe | E2E pago → webhook 200 → plan actualizado | [ ] |
| 4 | Stripe | Impago → tenant degraded → restore | [ ] |
| 5 | Stripe SA | Webhook `api.streamautomator.com/...` | [ ] |
| 6 | Tenant access | `schemas/12-tenant-access.sql` en prod | [ ] |
| 7 | Tenant access | Redeploy + smoke suspend/reactivate | [ ] |
| 8 | Deploy | Push `dakinis-core` + Railway | [ ] |
| 9 | Deploy | Push `dakinis-landing` + smoke | [ ] |
| 10 | Deploy | `upsert-platform-admin.mjs` prod | [ ] |

---

## 🟡 Post-go-live cercano

| # | Área | Tarea | Estado |
|---|------|-------|--------|
| 11 | Railway Core | Variables `WHATSAPP_*` | [ ] |
| 12 | WhatsApp | Callback Meta + smoke | [ ] |
| 13 | Observabilidad | Sentry backend + frontend | [ ] |
| 14 | Observabilidad | Uptime monitoring | [ ] |
| 15 | Backups | Secret + probar workflow | [ ] |
| 16 | Brand sync | SA/AkoeNet pendiente | 🔄 |
| 17 | Legal | Revisión abogado tenant access | [ ] |
| 18 | LifeFlow ops | Volume + JWT secret Railway | [ ] |

---

## ✅ Completado (referencia ops)

- Variables Railway Core Back (JWT, DATABASE_URL pooler, Stripe key)
- RLS lockdown SQL listo
- Gateway LifeFlow upstreams
- LifeFlow dominios prod + contrato `finance-api.json`
- LifeFlow SW v3, auth, onboarding v6.8.1, responsive móvil
- Script `sync-shared-brand.mjs`
- AI Gateway + analytics usage en código

---

*Actualizar al cerrar tareas de deploy o cambiar secrets en Railway/Supabase.*
