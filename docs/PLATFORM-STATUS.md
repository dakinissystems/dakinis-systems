# Dakinis Systems — Pendientes (julio 2026)

> **Solo lo que falta.** Referencia estable → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Ops → [`OPERATIONS.md`](./OPERATIONS.md) · Productos → [`PRODUCTS.md`](./PRODUCTS.md) · Empresa → [`COMPANY.md`](./COMPANY.md) · [`company/`](./company/)

**Leyenda:** ⬜ pendiente · 🔴 bloquea go-live · 🟠 importante · 🟡 producto · 🔵 después de clientes

**Regla:** consolidar y validar en prod — no ampliar arquitectura sin cliente.

---

## Hecho (referencia mínima)

Plataforma prod: Gateway · Auth · Hub v0.2.1 · Billing v0.2.0 · Notifications v0.3.1 · Search · Knowledge · **AI OpenAI** ✅ · Internal API · BullMQ.

Supabase prod: migr. `000`–`030` · `022`–`024` · `12-tenant-access` ✅.

Hub SSO probe 3/3 (SA · LifeFlow · AkoeNet) ✅ · Smokes: `.\scripts\smoke-prod-suite.ps1`.

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

---

## 🟡 Prioridad 3 — Productos (tras piloto)

| Producto | Pendiente |
|----------|-----------|
| **Dakinis One** | UX vendible · `/precios` · copilot E2E |
| **LifeFlow** | SQLite → PostgreSQL |
| **AkoeNet** | Schema Supabase · SSO E2E · repo `apps/akoenet/Server` |
| **Tabletop** | SQLite → Supabase |
| **StreamAutomator** | Métricas · event bus platform |

---

## 🟠 Prioridad 4 — Plataforma (post-piloto)

Knowledge ingest masivo · WhatsApp Meta · Observability · Search pgvector · Events por dominio

---

## 🔵 Prioridad 5 — Solo con clientes de pago

Marketplace · Storage R2 · AI multi-provider · Media workers · Staging Railway · Playwright E2E · `foundation/` física

---

## Supabase — cutovers pendientes

| Pendiente | Notas |
|-----------|-------|
| `dakinis_core_prod` → `core` | `019_rls_templates_and_cutover_plan.sql` |
| Schema `akoenet` | Producto AkoeNet |
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
