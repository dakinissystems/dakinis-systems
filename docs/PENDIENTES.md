# Pendientes — checklist único

> **Única lista de tareas operativas abiertas.** Todo lo demás en docs es referencia estable.  
> **Actualizado:** 19 mayo 2026 · Marca `[x]` al completar.

Índice: [Producción](#1-producción-core) · [Stripe](#2-stripe-dakinis-core) · [Acceso tenant](#3-acceso-tenant) · [WhatsApp](#4-whatsapp-meta) · [Observabilidad](#5-observabilidad) · [Deploy](#6-deploy-y-smoke) · [Producto](#7-producto-tras-pilotos)

Referencias: [`OPERATIONS.md`](./OPERATIONS.md) (estado y modelo) · [`supabase/SETUP.md`](./supabase/SETUP.md) (SQL) · [`CORE-STRIPE-PRECIOS.md`](./CORE-STRIPE-PRECIOS.md) (IDs Stripe)

---

## 1. Producción Core

### 1.1 SQL Supabase (orden fijo)

Ejecutar en SQL Editor del proyecto **Core/Auth** (no AkoeNet):

| # | Script | Hecho |
|---|--------|-------|
| 1 | `schemas/00` → `01` → … → `11` + `12-tenant-access.sql` | [X] |
| 2 | `004-rls-lockdown-all.sql` | [X] |
| 3 | `006` (1ª vez) **o** `006b-rls-policies-missing-tables.sql` | [X] |
| 4 | `005-advisor-functions-storage.sql` (opcional) | [X] |
| 5 | `schemas/99-verify-all-tables.sql` (diagnóstico) | [X] |

Tras migraciones nuevas: repetir `004` + `006b`. Detalle: [`supabase/SETUP.md`](./supabase/SETUP.md).

### 1.2 Variables Railway — Core Back

| Variable | Hecho |
|----------|-------|
| `JWT_SECRET`, `DAKINIS_MASTER_API_KEY` (≥24 chars, ≠ dev) | [X] |
| `DATABASE_URL` pooler **6543**, `DB_DRIVER=postgres`, `POSTGRES_SCHEMA=dakinis_core_prod` | [X] |
| `WHATSAPP_*` (token, phone id, verify, app secret, default business) | [ ] |
| `OPENAI_API_KEY` (opcional — Copilot) | [ ] |
| Stripe — ver [§2](#2-stripe-dakinis-core) | [ ] |

### 1.3 Variables Railway — Core Front / Landing

| Variable | Servicio | Hecho |
|----------|----------|-------|
| `VITE_DAKINIS_AUTH_URL`, `API_UPSTREAM` | Core Front | [X] |
| `VITE_HUB_URL`, `VITE_CONTACT_WHATSAPP_*` | Landing | [X] |

### 1.4 Backups

| Tarea | Hecho |
|-------|-------|
| Workflow `.github/workflows/backup-postgres.yml` + secret `BACKUP_DATABASE_URL` (5432 directo) | [ ] |
| Probar [`scripts/backup-postgres.ps1`](../scripts/backup-postgres.ps1) | [ ] |

---

## 2. Stripe — Dakinis Core

**Código:** ✅ SDK, Payment Links, webhook, `/success`, degradación por impago.

### 2.1 Claves en Railway (API)

| Variable | Hecho |
|----------|-------|
| `STRIPE_SECRET_KEY` (`sk_live_...`) | [X] |
| `STRIPE_WEBHOOK_SECRET` (`whsec_...`) | [ ] |
| Price IDs + Payment Links — ya en Railway (ver [`CORE-STRIPE-PRECIOS.md`](./CORE-STRIPE-PRECIOS.md)) | [x] |
| `FRONTEND_URL=https://core.dakinissystems.com` | [x] |

### 2.2 Webhook Stripe (cuenta Dakinis Core)

1. Developers → Webhooks → **Add endpoint**
2. URL: `https://<api-railway>/api/webhooks/stripe` (servicio **API**, no el front)
3. Eventos: `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_failed`
4. Signing secret → `STRIPE_WEBHOOK_SECRET` → redeploy API

| Hecho |
|-------|
| [ ] |

### 2.3 Payment Links Growth / Pro

Página de confirmación → URL personalizada: `https://core.dakinissystems.com/success`

| Hecho |
|-------|
| [ ] |

### 2.4 Opcional

| Tarea | Hecho |
|-------|-------|
| Payment Link Starter 29 € → `STRIPE_PAYMENT_LINK_STARTER` | [ ] |
| Redeploy API + Front tras cambios | [ ] |

### 2.5 Prueba end-to-end

- [ ] `GET /api/public/stripe/plans` → `configured: true`
- [ ] Pago Growth o Pro desde `/precios`
- [ ] Webhook 200 en Stripe Dashboard
- [ ] Email checkout = email en `users` → `business.plan` actualizado
- [ ] Impago simulado → tenant `degraded` (plan efectivo Starter)
- [ ] Pago regularizado → plan restaurado

> Cliente paga **antes** de tener cuenta: crear tenant en `/admin` con el mismo email.

### 2.6 Stream Automator (misma cuenta Stripe, otro endpoint)

Actualizar URL del webhook SA en Stripe Dashboard:

- De: `https://stream-schedule-api.onrender.com/api/payments/webhook`
- A: `https://api.streamautomator.com/api/payments/webhook`

| Hecho |
|-------|
| [ ] |

---

## 3. Acceso tenant

Middleware y panel `/admin` → **Acceso** implementados en `dakinis-core`.

| Tarea | Hecho |
|-------|-------|
| Ejecutar `schemas/12-tenant-access.sql` en Supabase prod | [ ] |
| Redeploy API con middleware `tenant-access.js` | [ ] |
| Probar suspend / reactivate / close desde `/admin` | [ ] |
| Revisar cláusulas con abogado: [`legal/TENANT-ACCESS-AND-SUSPENSION.md`](./legal/TENANT-ACCESS-AND-SUSPENSION.md) | [ ] |

---

## 4. WhatsApp Meta

| Tarea | Hecho |
|-------|-------|
| Variables `WHATSAPP_*` en Railway prod | [ ] |
| Callback Meta: `https://api.dakinissystems.com/webhooks/whatsapp` | [ ] |
| Verify token = `WHATSAPP_VERIFY_TOKEN` | [ ] |
| Smoke: envío + mensaje entrante persistido | [ ] |

**Fase 5 (producto):** handler `crm.whatsapp.inbound`, cola OpenAI, tickets — ver [`WHATSAPP-INTEGRATION.md`](./WHATSAPP-INTEGRATION.md#roadmap).

Guía completa: [`WHATSAPP-INTEGRATION.md`](./WHATSAPP-INTEGRATION.md).

---

## 5. Observabilidad

| Tarea | Hecho |
|-------|-------|
| `SENTRY_DSN` Core Back + auth (ver [`observability/SENTRY-SETUP.md`](./observability/SENTRY-SETUP.md)) | [ ] |
| `VITE_SENTRY_DSN` Core Front (redeploy build) | [ ] |
| Uptime: Better Stack o [Uptime Kuma](./observability/uptime-kuma.md) | [ ] |
| Log drains Railway (opcional) | [ ] |

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

| Prueba manual | Esperado | Hecho |
|---------------|----------|-------|
| `/#precios` | Planes 29/79/149 + CTAs Stripe | [ ] |
| `/app/settings` | Facturación + adopción | [ ] |
| `/admin` | Telemetría + columna Acceso | [ ] |
| Supabase advisor | 0 «RLS Enabled No Policy» | [ ] |

---

## 7. Producto (tras pilotos)

No bloquean go-live. Prioridad según [`OPERATIONS.md`](./OPERATIONS.md) §2.

| Ítem | Cuándo |
|------|--------|
| RAG PDF / embeddings | Tras 30 días telemetría |
| Calendario global | Post-Stripe estable |
| Dakinis Network comercial | API base ✅ |
| SSO Hub → AkoeNet / SA | En progreso |
| Stripe metered (exceso IA/WA automático) | Fase 2 — hoy factura manual |
| Customer Portal Stripe | Fase 2 |
| Event bus SA / AkoeNet | [`contracts/events-catalog.md`](./contracts/events-catalog.md) |

---

*Sustituye checklists dispersos en OPERATIONS §5, CORE-STRIPE «Pendiente» y WHATSAPP-ROADMAP.*
