# Pendientes — checklist único

> **Audiencia:** operador interno. Checklist de tareas abiertas. Marca `[x]` al completar.  
> **Actualizado:** 19 mayo 2026

Índice: [Producción](#1-producción-core) · [Stripe](#2-stripe-dakinis-core) · [Acceso tenant](#3-acceso-tenant) · [WhatsApp](#4-whatsapp-meta) · [Observabilidad](#5-observabilidad) · [Deploy](#6-deploy-y-smoke) · [Producto](#7-producto-tras-pilotos)

Plantilla env: [`railway.env.example`](./railway.env.example) · SQL: [`supabase/schemas/`](./supabase/schemas/)

---

## 1. Producción Core

### 1.1 SQL Supabase (orden fijo)

Ejecutar en **SQL Editor** del proyecto **Core/Auth** (no AkoeNet), carpeta `docs/supabase/`:

| Paso | Archivo |
|------|---------|
| 1 | `schemas/00-bootstrap-schemas.sql` |
| 2 | `schemas/01-dakinis-auth.sql` |
| 3 | `schemas/02-dakinis-core-prod.sql` |
| 4 | `schemas/03-whatsapp-messages.sql` |
| 5 | `schemas/04-crm-core.sql` |
| 6 | `schemas/05-tenant-intelligence.sql` |
| 7 | `schemas/06-tenant-intelligence-v2.sql` |
| 8 | `schemas/07-bos-platform.sql` |
| 9 | `schemas/08-telemetry.sql` |
| 10 | `schemas/09-feature-events.sql` |
| 11 | `schemas/10-user-credentials.sql` |
| 12 | `schemas/11-inventory-lots.sql` |
| 13 | `schemas/12-tenant-access.sql` |
| 14 | `004-rls-lockdown-all.sql` |
| 15 | `006-rls-policies-deny-api.sql` (1ª vez) **o** `006b-rls-policies-missing-tables.sql` |
| 16 | `005-advisor-functions-storage.sql` (opcional) |
| 17 | `schemas/99-verify-all-tables.sql` (diagnóstico) |

| Hecho |
|-------|
| [ ] |

Tras migraciones nuevas: repetir `004` + `006b`. Pooler Supabase **6543** + `?pgbouncer=true` en `DATABASE_URL`.

### 1.2 Variables Railway — Core Back

| Variable | Hecho |
|----------|-------|
| `JWT_SECRET`, `DAKINIS_MASTER_API_KEY` (≥24 chars, ≠ dev) | [ ] |
| `DATABASE_URL`, `DB_DRIVER=postgres`, `POSTGRES_SCHEMA=dakinis_core_prod` | [ ] |
| `WHATSAPP_*` — ver [§4](#4-whatsapp-meta) | [ ] |
| `OPENAI_API_KEY` (opcional — Copilot) | [ ] |
| Stripe — ver [§2](#2-stripe-dakinis-core) | [ ] |

### 1.3 Variables Railway — Core Front / Landing

| Variable | Servicio | Hecho |
|----------|----------|-------|
| `VITE_DAKINIS_AUTH_URL`, `API_UPSTREAM` | Core Front | [ ] |
| `VITE_HUB_URL`, `VITE_CONTACT_WHATSAPP_*` | Landing | [ ] |

### 1.4 Backups

| Tarea | Hecho |
|-------|-------|
| Workflow `.github/workflows/backup-postgres.yml` + secret `BACKUP_DATABASE_URL` (5432 directo) | [ ] |
| Probar [`scripts/backup-postgres.ps1`](../scripts/backup-postgres.ps1) | [ ] |

---

## 2. Stripe — Dakinis Core

**Código:** SDK, Payment Links, webhook, `/success`, degradación por impago.

### 2.1 Precios live (Railway API)

| Plan | €/mes | Price ID | Payment Link |
|------|-------|----------|--------------|
| Starter | 29 | `price_1TicuQE8ho0WJUFPbEqjd52f` | Checkout Session API |
| Growth | 79 | `price_1TicwhE8ho0WJUFPZ8FJPecr` | `https://buy.stripe.com/eVq14n2kv7EN9Qf72ZcjS06` |
| Pro | 149 | `price_1TicxPE8ho0WJUFPxWQRGWki` | `https://buy.stripe.com/5kQ9AT9MX9MVgeD873cjS07` |

| Variable | Hecho |
|----------|-------|
| `STRIPE_PRICE_*_MONTHLY` + `STRIPE_PAYMENT_LINK_*` (arriba) | [x] |
| `FRONTEND_URL=https://core.dakinissystems.com` | [x] |
| `STRIPE_SECRET_KEY` (`sk_live_...`) | [ ] |
| `STRIPE_WEBHOOK_SECRET` (`whsec_...`) | [ ] |

Webhook: `POST /api/webhooks/stripe` · Match tenant: email checkout = email en `users`.

### 2.2 Webhook Stripe (cuenta Dakinis Core)

1. Developers → Webhooks → **Add endpoint**
2. URL: `https://<api-railway>/api/webhooks/stripe`
3. Eventos: `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_failed`
4. Signing secret → `STRIPE_WEBHOOK_SECRET` → redeploy API

| Hecho |
|-------|
| [ ] |

### 2.3 Payment Links Growth / Pro

Confirmación → URL: `https://core.dakinissystems.com/success`

| Hecho |
|-------|
| [ ] |

### 2.4 Opcional

| Tarea | Hecho |
|-------|-------|
| Payment Link Starter → `STRIPE_PAYMENT_LINK_STARTER` | [ ] |
| Redeploy API + Front | [ ] |

### 2.5 Prueba end-to-end

- [ ] `GET /api/public/stripe/plans` → `configured: true`
- [ ] Pago Growth o Pro desde `/precios`
- [ ] Webhook 200 en Stripe Dashboard
- [ ] Email checkout = email en `users` → `business.plan` actualizado
- [ ] Impago → `access_state: degraded` (plan efectivo Starter)
- [ ] Pago regularizado → plan restaurado

> Cliente paga antes de tener cuenta: crear tenant en `/admin` con el mismo email.

### 2.6 Stream Automator (misma cuenta Stripe)

Webhook SA: `https://api.streamautomator.com/api/payments/webhook` (sustituir URL Render antigua).

| Hecho |
|-------|
| [ ] |

---

## 3. Acceso tenant

Middleware + panel `/admin` → **Acceso** en `dakinis-core`.

| Tarea | Hecho |
|-------|-------|
| Ejecutar `schemas/12-tenant-access.sql` en Supabase prod | [ ] |
| Redeploy API con `tenant-access.js` | [ ] |
| Probar suspend / reactivate / close desde `/admin` | [ ] |
| Incorporar cláusulas impago/suspensión en términos B2B (revisión legal) | [ ] |

Estados: `active` · `degraded` (impago → Starter) · `suspended` · `closed`.

---

## 4. WhatsApp Meta

Variables Core Back (`platform/core/api/.env.example`):

| Variable | Uso |
|----------|-----|
| `WHATSAPP_ACCESS_TOKEN` | Envío |
| `WHATSAPP_PHONE_NUMBER_ID` | ID número |
| `WHATSAPP_VERIFY_TOKEN` | Verificación webhook |
| `WHATSAPP_APP_SECRET` | Firma `X-Hub-Signature-256` |
| `WHATSAPP_DEFAULT_BUSINESS_ID` | Tenant receptor webhook |

| Tarea | Hecho |
|-------|-------|
| Variables en Railway prod | [ ] |
| Callback Meta: `https://api.dakinissystems.com/webhooks/whatsapp` | [ ] |
| Verify token = `WHATSAPP_VERIFY_TOKEN` | [ ] |
| Smoke: envío + mensaje entrante persistido | [ ] |

**Fase 5 (producto):** `crm.whatsapp.inbound`, cola OpenAI, tickets por reglas.

---

## 5. Observabilidad

| Tarea | Hecho |
|-------|-------|
| `SENTRY_DSN` + `SENTRY_ENVIRONMENT=production` — Core Back, auth | [ ] |
| `VITE_SENTRY_DSN` — Core Front (redeploy build) | [ ] |
| Uptime: Better Stack o Uptime Kuma en `/api/health`, `/auth/health` | [ ] |
| Log drains Railway (opcional) | [ ] |

Health con Sentry activo: `"sentry": true` en `/api/health`.

---

## 6. Deploy y smoke

| Tarea | Hecho |
|-------|-------|
| Push `dakinis-core` + redeploy Railway (API + Front) | [ ] |
| Push `dakinis-landing` | [ ] |
| Sync `shared-brand`: `node scripts/sync-shared-brand.mjs` | [ ] |
| Platform admin prod: `api/scripts/upsert-platform-admin.mjs` | [ ] |

```bash
curl -sS https://api.dakinissystems.com/core/api/health
curl -sS https://core.dakinissystems.com/hub -o /dev/null -w "%{http_code}\n"
```

| Prueba | Esperado | Hecho |
|--------|----------|-------|
| `/#precios` | Planes 29/79/149 + CTAs Stripe | [ ] |
| `/app/settings` | Facturación + adopción | [ ] |
| `/admin` | Telemetría + columna Acceso | [ ] |
| Supabase advisor | 0 «RLS Enabled No Policy» | [ ] |

---

## 7. Producto (tras pilotos)

No bloquean go-live.

| Ítem | Cuándo |
|------|--------|
| RAG PDF / embeddings | Tras 30 días telemetría |
| Calendario global | Post-Stripe estable |
| Dakinis Network comercial | API base ✅ |
| SSO Hub → AkoeNet / SA | En progreso |
| Stripe metered (exceso IA/WA) | Fase 2 |
| Customer Portal Stripe | Fase 2 |
| Event bus SA / AkoeNet | Por definir |
