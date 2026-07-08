# Dakinis Systems — Pendientes (julio 2026)

> **Solo lo que falta.** Referencia estable → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md) · Productos → [`PRODUCTS.md`](./PRODUCTS.md) · Empresa → [`COMPANY.md`](./COMPANY.md) · [`company/`](./company/)

**Leyenda:** ⬜ pendiente · 🔴 bloquea go-live · 🟠 importante · 🟡 producto · 🔵 después de clientes

**Regla:** consolidar y validar en prod — no ampliar arquitectura sin cliente.

---

## Hecho (referencia mínima)

Plataforma prod: Gateway · Auth · Hub v0.2.1+ · Billing v0.2.0 · Notifications v0.3.1 · Search · Knowledge · **AI OpenAI** ✅ · Internal API v0.3.1+ · BullMQ.

Supabase prod: migr. `000`–`030` · `022`–`024` · `12-tenant-access` ✅ · **`031` workspace** ✅ aplicada (jul 2026) · **`032`–`033` AkoeNet Assistant** ⬜ prod.

**Hub Workspace Admin:** UI `/admin` desplegada (`dakinis-hub` `8f42833` · `15dc18b`) · Internal API `/workspaces/*` + `/admin/v1/*` (`9cb3f00` · `9dc5862`) · provisioning super admin → [`provision_workspace_christiandvillar.sql`](./supabase/scripts/provision_workspace_christiandvillar.sql).

**AkoeNet Assistant (código):** orchestrator + modules · Internal API `/akoenet/assistant/*` · panel toggles + **i18n EN/ES** · proxy backend · **event bridge** (`message.created`, `member.joined`, `@AI`) · migr. `032`–`033` ⬜ prod.

Hub SSO probe 3/3 (SA · LifeFlow · AkoeNet) ✅ · Smokes: `.\scripts\smoke-prod-suite.ps1`.

**Deploys jul 2026:** Hub `15dc18b` (errores workspace claros) · Internal `5dfbdca` (assistant) · akoenet-client `8b8d91f` (apiBase + assistant UI) · akoenet-backend `9015f7f2` (healthcheck fix) · Landing `b226624` · StreamAutomator `e343813` — CI verde tras push.

StreamAutomator web: React Doctor **61/110** (era 60/121) — pure-fn hoist, overlay `<button>`, Supabase SDK en chunk lazy.

Landing prod: home plataforma + SEM `/empieza` + CTA Hub (`bc4e271` · `9ddd99c`) · copy → [`company/LANDING-COPY.md`](./company/LANDING-COPY.md).

Docs empresa: [`COMPANY.md`](./COMPANY.md) · [`company/MESSAGING.md`](./company/MESSAGING.md) · [`ROADMAP-CEO.md`](./ROADMAP-CEO.md).

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
| 12 | Hub Mi día DB | migr. `027`–`029` si no aplicadas |
| 13 | **Hub Workspace Admin** | ✅ UI `/admin` + API · migr. `031` ✅ · backfill resto tenants ⬜ → [`PLATFORM-SETUP-STEPS.md`](./PLATFORM-SETUP-STEPS.md) |
| 14 | **AkoeNet Assistant Fase 1** | UI + i18n + event bridge ✅ · migr. `032`–`033` ⬜ prod · workers BullMQ ⬜ · E2E `@AI` respuesta real ⬜ |

---

## 🟡 Prioridad 3 — Productos (tras piloto)

| Producto | Pendiente |
|----------|-----------|
| **Dakinis One** | UX vendible · `/precios` · copilot E2E |
| **LifeFlow** | SQLite → PostgreSQL |
| **AkoeNet** | Migr. `032`–`033` prod · workers assistant/moderation-ai · `@AI` respuesta real · schema cutover · **migración datos** → [`supabase/MIGRATE-AKOENET.md`](./supabase/MIGRATE-AKOENET.md) · UX voz sidebar + export en perfil (cliente local, pendiente deploy) |
| **Tabletop** | SQLite → Supabase |
| **StreamAutomator** | Métricas · event bus platform · React Doctor follow-up |

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
| `dakinis_core_prod` → `core` | `019_rls_templates_and_cutover_plan.sql` |
| Schema `akoenet` | Producto AkoeNet · `032`–`033` assistant · guía [`MIGRATE-AKOENET.md`](./supabase/MIGRATE-AKOENET.md) |
| Schema `audit` | Platform logs |
| Tabletop → Supabase | Producto |

Orden: [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md)

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

**Pregunta guía:** *¿Qué necesita un cliente para pagar por Dakinis este mes?*

*Actualizar solo al cerrar hitos. Lo hecho vive en git + ARCHITECTURE + ADR.*
