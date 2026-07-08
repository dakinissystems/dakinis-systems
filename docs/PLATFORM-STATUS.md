# Dakinis Systems — Pendientes (julio 2026)

> **Solo lo que falta.** Referencia estable → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md) · Productos → [`PRODUCTS.md`](./PRODUCTS.md) · Empresa → [`COMPANY.md`](./COMPANY.md) · [`company/`](./company/)

**Leyenda:** ⬜ pendiente · 🔴 bloquea go-live · 🟠 importante · 🟡 producto · 🔵 después de clientes

**Regla:** consolidar y validar en prod — no ampliar arquitectura sin cliente.

---

## Hecho (referencia mínima)

Plataforma prod: Gateway · Auth · Hub v0.2.1+ · Billing v0.2.0 · Notifications v0.3.1 · Search · Knowledge · **AI OpenAI** ✅ · Internal API v0.3.1+ · BullMQ.

Supabase prod: migr. `000`–`030` · `022`–`024` · `12-tenant-access` ✅ · **`031` workspace** ✅ (jul 2026) · **`032`–`033` AkoeNet Assistant** ⬜ prod · **`016`–`019` · `027`–`029`** ⬜ prod.

**Hub Workspace Admin:** UI `/admin` ✅ · Internal API `/workspaces/*` ✅ · migr. `031` ✅ · provisioning → [`provision_workspace_christiandvillar.sql`](./supabase/scripts/provision_workspace_christiandvillar.sql).

**AkoeNet Assistant (código en git):** orchestrator + modules · Internal API `/akoenet/assistant/*` · panel toggles + i18n EN/ES · proxy backend · event bridge (`message.created`, `member.joined`, `@AI`). Ver [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md).

**Commits recientes (jul 2026, pusheados):**

| Repo | Commit | Qué |
|------|--------|-----|
| `dakinis-systems` | `ec50ce0` | Assistant orchestrator + Internal API + sync script |
| `dakinis-systems` | `bf57297` | Docs + migr. 031–033 SQL |
| `akoenet-client` | `0511218` | Voz sidebar · export en perfil · i18n módulos |
| `akoenet-backend` | `d6823e32` | Event bridge mensajes / joins / `@AI` |
| `dakinis-internal-api` | *(este deploy)* | Status page + handlers sync + CI |

Hub SSO probe 3/3 (SA · LifeFlow · AkoeNet) ✅ · Smokes: `.\scripts\smoke-prod-suite.ps1`.

---

## 🚦 Despliegue pendiente (código listo, prod no al día)

| Paso | Sistema | Acción |
|------|---------|--------|
| 1 | **Supabase** | SQL Editor: migr. [`032`](./supabase/migrations/032_akoenet_assistant_modules.sql) + [`033`](./supabase/migrations/033_akoenet_assistant_expansion.sql) |
| 2 | **akoenet-backend** | Railway: `DAKINIS_INTERNAL_SERVICE_KEY` + `DAKINIS_INTERNAL_URL` → redeploy |
| 3 | **akoenet-client** | Redeploy (voz sidebar, export perfil, i18n Assistant) |
| 4 | **dakinis-internal-api** | Push + redeploy tras `sync-akoenet-packages.mjs` |
| 5 | **Billing** | E2E live (desbloquea portal Plan en Hub `/admin`) |

Sin paso 1–2, los toggles del Assistant **no persisten** y `@AI` no llega a Internal API.

---

## 🔴 Prioridad 1 — Go-live

| # | Hito | Verificación |
|---|------|--------------|
| 1 | ~~IA OpenAI prod~~ | ✅ |
| 2 | **Billing E2E Live** | webhook 200 · `business.plan` |
| 3 | **Billing degraded** | `smoke-billing-degraded.ps1` |
| 4 | **Hub SSO E2E** | `smoke-prod-suite.ps1 -E2E` |
| 5 | **Primer cliente piloto** | Hub + Dakinis One · 2 sem · [`ROADMAP-CEO.md`](./ROADMAP-CEO.md) |

### Billing E2E (30–60 min)

1. `.\scripts\smoke-billing-e2e.ps1`
2. Stripe → webhook `https://api.dakinissystems.com/billing/v1/webhooks/stripe`
3. `STRIPE_WEBHOOK_SECRET` en dakinis-billing si cambió
4. Checkout → pago test
5. Webhook **200** · SQL subscriptions · plan actualizado

Checklist: [ ] webhook test **200** · [ ] checkout E2E · [ ] degraded → restore — detalle [`OPERATIONS.md`](./OPERATIONS.md#billing-e2e-live-checklist)

---

## 🟠 Prioridad 2 — Mensaje y producto (jul–ago)

| # | Hito | Notas |
|---|------|-------|
| 6 | ~~Landing narrativa plataforma~~ | ✅ prod |
| 7 | **Hub en demo** | Demo empieza Hub (Mi día) → Dakinis One |
| 8 | **Screenshot Hub real** | `dakinis-landing/public/showcase/hub.png` (hoy mock CSS) |
| 9 | **Ads → SEM** | Google/Meta → `dakinissystems.com/empieza` |
| 10 | Vars Internal API Core · Resend live | [`OPERATIONS.md`](./OPERATIONS.md) |
| 11 | Ctrl+K + inbox E2E | smokes con creds |
| 12 | Hub Mi día DB | migr. `016`–`019` + `027`–`029` ⬜ |
| 13 | **Hub Workspace Admin** | UI + API ✅ · migr. `031` ✅ · invitar miembro · launcher productos · portal Billing ⬜ |
| 14 | **AkoeNet Assistant Fase 1** | Código ✅ · migr. `032`–`033` ⬜ · redeploys ⬜ · workers BullMQ ⬜ · `@AI` respuesta real ⬜ |

---

## 🟡 Prioridad 3 — Productos (tras piloto)

| Producto | Pendiente |
|----------|-----------|
| **Dakinis One** | UX vendible · `/precios` · copilot E2E |
| **LifeFlow** | SQLite → PostgreSQL · migr. `030` |
| **AkoeNet** | Prod: migr. `032`–`033` · vars Railway · workers · `@AI` real · cutover schema · [`MIGRATE-AKOENET.md`](./supabase/MIGRATE-AKOENET.md) |
| **Tabletop** | SQLite → Supabase |
| **StreamAutomator** | Métricas · event bus · React Doctor 61/110 |

---

## 🟠 Prioridad 4 — Plataforma (post-piloto)

Knowledge ingest masivo · WhatsApp Meta · Observability · Search pgvector · Events por dominio · **Super Admin Nivel 1** (5+ clientes) → [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md)

---

## 🔵 Prioridad 5 — Solo con clientes de pago

Marketplace · Centro IA Hub · Integraciones (Slack, Zapier…) · Storage R2 · AI multi-provider · Revenue dashboard (MRR/ARR/churn) · Costes por workspace · Media workers · Staging Railway · Playwright E2E · `foundation/` física

---

## Supabase — cutovers pendientes

| Pendiente | Notas |
|-----------|-------|
| Fase C `016`–`019` | ⬜ Base Hub Mi día + cutover `core` |
| Fase C+ `027`–`029` | ⬜ Hub Mi día widgets + product access |
| Fase F `032`–`033` | ⬜ **Assistant** — bloquea toggles en prod |
| `015b` | ⬜ Backfill datos AkoeNet legacy |
| `030` | ⬜ LifeFlow ↔ IdP |
| `dakinis_core_prod` → `core` | `019_rls_templates_and_cutover_plan.sql` |

Orden: [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) · Pasos: [`PLATFORM-SETUP-STEPS.md`](./PLATFORM-SETUP-STEPS.md)

---

## Smokes prod

| Script | Requiere |
|--------|----------|
| `smoke-prod-suite.ps1` | probes · `-E2E` + creds |
| `smoke-billing-e2e.ps1` | creds o `INTERNAL_API_KEY` |
| `smoke-billing-degraded.ps1` | `INTERNAL_API_KEY` + `DAKINIS_BUSINESS_ID` |
| `smoke-ai.ps1` | `DAKINIS_AI_SERVICE_KEY` + creds (E2E) |
| `smoke-hub-search-query.ps1` | creds Core |
| `smoke-notifications.ps1` | creds (auto userId IdP) |
| `smoke-knowledge-search-sync.ps1` | `DAKINIS_INTERNAL_SERVICE_KEY` |

Helpers: `scripts/lib/core-smoke-auth.ps1` · `scripts/lib/idp-smoke-auth.ps1`

---

## Local sin commit (no bloquea prod)

| Repo | Archivos |
|------|----------|
| `dakinis-systems` | `DND/*` · `packages/shared-layouts/HubDashboardPage.jsx` |
| `akoenet-client` | iconos Android borrados · `CookieConsentBanner.jsx` |

---

**Pregunta guía:** *¿Qué necesita un cliente para pagar por Dakinis este mes?*

*Actualizar solo al cerrar hitos. Lo hecho vive en git + ARCHITECTURE + ADR.*
