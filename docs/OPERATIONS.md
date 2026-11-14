# Dakinis Systems — Operaciones

> Deploy, infra y monitorización. Arquitectura → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Seguridad → [`SECURITY.md`](./SECURITY.md) · Runbooks → [`RUNBOOKS/`](./RUNBOOKS/).

---

## Comandos útiles

```powershell
# Stack local completo
.\scripts\dev.ps1

# Sincronizar tokens de marca → Landing, Core, LifeFlow
node scripts/sync-shared-brand.mjs

# Health checks prod
curl -sS https://api.dakinissystems.com/health
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://finance-api.dakinissystems.com/health
curl -sS https://tabletop-api.dakinissystems.com/health
curl -sS https://core.dakinissystems.com/hub -o /dev/null -w "%{http_code}`n"

# Checkouts anidados en D:\dakinis-systems. Este worktree no los trae.
# LifeFlow: D:\dakinis-systems\finanzas   (raíz api/ + web/)
# Core:     D:\dakinis-systems\platform\core
# Hub:      D:\dakinis-systems\hub
# Auth:     D:\dakinis-systems\platform\auth
# Landing:  D:\dakinis-systems\apps\landing
# AI:       D:\dakinis-systems\ai

# Backup Postgres (secret GitHub `BACKUP_DATABASE_URL`)
.\scripts\backup-postgres.ps1
```

**Cuentas demo (sin passwords en git):** emails y tenants abajo; contraseñas solo en gestor de secretos / vars locales (`DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`, `COPERNICO_ADMIN_EMAIL`, `COPERNICO_ADMIN_PASSWORD`). **A6:** en producción, login de cuentas seed (`demo@local`, `admin@*-demo.local`, `admin@dakinis-platform.local`) debe fallar; el piloto Copérnico no es seed. No activar `CORE_SEED_DEMO`.

| Uso | Email (público OK) | Tenant slug |
|-----|--------------------|-------------|
| Demo Core (solo local) | `admin@restaurante-demo.local` | `restaurante-demo` |
| Piloto Copérnico (pro free) | `admin@heladeria-copernico.local` | `heladeria-copernico` |

Si alguna password salió en historial de docs → rotar y ver [`SECRET-LEAK-REMEDIATION.md`](./SECRET-LEAK-REMEDIATION.md).

Plantilla variables: [`railway.env.example`](./railway.env.example).

---

## Railway — mapa servicios

| Servicio | Repo canónico | Rama | Root directory | Dominio |
|----------|---------------|------|----------------|---------|
| Gateway | `dakinis-systems` | `main` | `gateway/` | `api.dakinissystems.com` |
| Auth | `dakinis-auth` | `main` | `/` | `auth.dakinissystems.com` |
| Core API / Web | `dakinis-core` | `main` | anotar api/web en Railway | `core-api…` · `core.dakinissystems.com` · `/core/` |
| Hub | `dakinis-hub` | `main` | `/` | `hub.dakinissystems.com` |
| AI API / Worker | `dakinis-ai` | `main` | **pendiente captura** (dos checkouts en disco) | `ai.dakinissystems.com` |
| Landing | `dakinis-landing` | `main` | `/` o `apps/landing` | `dakinissystems.com` |
| StreamAutomator | `dakinis-streamautomator` | `main` | `apps/api` · `apps/web` · worker/scheduler | `api.streamautomator.com` |
| AkoeNet | repos Railway `akoenet-*` (no el fork `ChristianDVillar/Akoenet`) | `main` | client/backend — confirmar dashboard | `api.akoenet…` · `akoenet.dakinissystems.com` |
| LifeFlow Web / API | `lifeflow` (`finanzas/`) | `main` | `api/` · `web/` | `finance…` · **`finance-api.dakinissystems.com`** |
| Tabletop Web / API | `dakinis-tabletop` (`DND/`) | `main` | `api/` · `web/` | `tabletop…` · **`tabletop-api…`** |
| Billing | `dakinis-billing` | `main` | anotar | `/billing/` |
| Notifications | `dakinis-notifications` | `main` | anotar | `/notifications/` |
| Search | `dakinis-search` | `main` | anotar | `/search/` |
| Knowledge | `dakinis-knowledge` | `main` | anotar | `/knowledge/` |
| Internal | `dakinis-internal-api` | `main` | anotar | `/internal/` |
| Redis | plugin | — | — | AI · SA · Billing · Notifications · Search · Knowledge |

**A7 — checkouts duplicados (14 nov 2026):** AI (`ai/` vs `platform/ai`), StreamAutomator (`D:\dakinis-streamautomator` vs `apps/streamautomator`), AkoeNet (`D:\AkoNet` vs `apps/akoenet`), Tabletop (`D:\DND` vs `DND/`) y shared. No archivar el secundario hasta comparar historias y anotar el commit/root que Railway despliega. Detalle → [`inventario-d.md`](./inventario-d.md).

⚠️ **No usar** `api.finance.dakinissystems.com` — SSL Cloudflare free no cubre subdominio de 2º nivel.

**Fuente de verdad.** El servicio de Railway es el repo de la tabla, no la carpeta homónima de este repo (`billing/`, `notifications/`, `search/`, `internal/`). Esas carpetas no se parchean como si el cambio llegara a producción. Un Dependabot abierto sobre ellas no despliega. Hasta retirar la copia, no se editan los dos árboles a la vez.

**Madurez.** Infraestructura en producción no es producto cerrado. Un servicio cuenta como usable cuando un negocio completa el escenario sin asistencia. Circuito → [`RUNBOOKS/circuito-comercial.md`](./RUNBOOKS/circuito-comercial.md).

Pendientes por servicio → [`STATUS.md`](./STATUS.md).  
Workers (crear/redeploy) → [`RUNBOOKS/railway-workers.md`](./RUNBOOKS/railway-workers.md).

---

## Health URLs (prod)

| Nombre | URL |
|--------|-----|
| Gateway | `https://api.dakinissystems.com/health` |
| Auth | `https://auth.dakinissystems.com/health` |
| Core API | `https://api.dakinissystems.com/core/api/health` |
| Billing | `https://api.dakinissystems.com/billing/health` |
| Internal | `https://api.dakinissystems.com/internal/health` |
| Knowledge | `https://api.dakinissystems.com/knowledge/health` |
| Search | `https://api.dakinissystems.com/search/health` |
| Notifications | `https://api.dakinissystems.com/notifications/health` |
| AkoeNet | `https://api.akoenet.dakinissystems.com/health` |
| StreamAutomator | `https://api.streamautomator.com/api/health` |
| LifeFlow API | `https://finance-api.dakinissystems.com/health` |

Smokes: `.\scripts\smoke-prod-suite.ps1` · `smoke-billing.ps1` · `smoke-hub.ps1` · `smoke-knowledge.ps1` · `smoke-ai.ps1`.

---

## Gateway

- Config: [`gateway/routes/default.conf`](../gateway/routes/default.conf)
- Cabeceras: [`gateway/routes/security-headers.conf`](../gateway/routes/security-headers.conf)
- Reglas cambio: [`rules.md`](./rules.md)

---

## Cloudflare (edge)

- SSL/TLS **Full (Strict)** · WAF managed · Bot Fight
- Rate limit (1 regla plan): `/auth/` + `/api/` · 20 req / IP / 10s
- Health-skip custom: path termina en `/health`

```powershell
$env:CLOUDFLARE_API_TOKEN = "<Zone WAF Write>"
node scripts/configure-cloudflare-health-skip.mjs
node scripts/configure-cloudflare-api-rate-limit.mjs
```

Detalle checklist → [`SECURITY.md`](./SECURITY.md).

---

## Monitorización

**✅ Activo 25 jul 2026** — **UptimeRobot Free**, **7 monitores** HTTP(s), intervalo 5 min, alerta email.

| # | Nombre | URL |
|---|--------|-----|
| 1 | Gateway | `https://api.dakinissystems.com/health` |
| 2 | Auth | `https://auth.dakinissystems.com/health` |
| 3 | Core API | `https://api.dakinissystems.com/core/api/health` |
| 4 | Billing | `https://api.dakinissystems.com/billing/health` |
| 5 | Internal | `https://api.dakinissystems.com/internal/health` |
| 6 | AkoeNet | `https://api.akoenet.dakinissystems.com/health` |
| 7 | StreamAutomator | `https://api.streamautomator.com/api/health` |

Dashboard: https://uptimerobot.com

**GitHub Actions:** `.github/workflows/uptime-probes.yml` cada 15 min.  
Los 403 «Just a moment…» de Cloudflare Bot Fight se registran como **warning** (no tumbaron el job).  
**UptimeRobot** es la fuente de alerta fiable.

Cuando haya facturación SaaS seria, valorar plan de pago (ToS free a menudo “personal / no comercial”).

---

## Supabase (ops breve)

Orden migraciones: [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md).  
Backup: `.\scripts\backup-postgres.ps1` · Restore test: `.\scripts\restore-postgres-test.ps1`.  
Seguridad → [`SECURITY.md`](./SECURITY.md).

---

## Hub — env Railway (resumen)

| Variable | Valor |
|----------|-------|
| `VITE_DAKINIS_AUTH_URL` | `https://auth.dakinissystems.com/auth` |
| `VITE_CORE_URL` | `https://core.dakinissystems.com` |
| `VITE_GATEWAY_URL` | `https://api.dakinissystems.com` |
| `HUB_INTERNAL_URL` | `http://dakinis-internal-api.railway.internal:4083` |
| `HUB_INTERNAL_SERVICE_KEY` | Igual que Internal API |

Antes de push Hub: `.\scripts\sync-hub-des.ps1`.

---

## Runbooks

| Tema | Doc |
|------|-----|
| LifeFlow env / reset | [`RUNBOOKS/lifeflow-env.md`](./RUNBOOKS/lifeflow-env.md) |
| Auth + Google OAuth | [`RUNBOOKS/auth-google-oauth.md`](./RUNBOOKS/auth-google-oauth.md) |
| Fiscal / VERI*FACTU (Core) | [`RUNBOOKS/fiscal-verifactu.md`](./RUNBOOKS/fiscal-verifactu.md) |
| Billing E2E | [`RUNBOOKS/billing-e2e.md`](./RUNBOOKS/billing-e2e.md) |
| Circuito comercial (piloto) | [`RUNBOOKS/circuito-comercial.md`](./RUNBOOKS/circuito-comercial.md) |
| Backlog priorizado (14 nov 2026) | [`BACKLOG-priorizado.md`](./BACKLOG-priorizado.md) |
| Railway workers | [`RUNBOOKS/railway-workers.md`](./RUNBOOKS/railway-workers.md) |
| Dominios + Google Workspace | [`RUNBOOKS/google-workspace-domains.md`](./RUNBOOKS/google-workspace-domains.md) |
| Incidencias | [`RUNBOOKS/incidents.md`](./RUNBOOKS/incidents.md) |

---

*Actualizar al cerrar tareas de deploy o cambiar secrets en Railway/Supabase.*
