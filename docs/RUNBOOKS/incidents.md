# Runbook — incidencias comunes

Estado → [`../STATUS.md`](../STATUS.md).

## Webhook Stripe falla (Billing)

**Síntomas:** plan no actualiza · webhook 4xx/5xx · `smoke-billing-e2e.ps1` falla

1. Stripe → Webhooks → `https://api.dakinissystems.com/billing/v1/webhooks/stripe`
2. Railway → `dakinis-billing` → logs (`webhook`)
3. Verificar `STRIPE_WEBHOOK_SECRET` y `STRIPE_SECRET_KEY` (test vs live)
4. SQL: `SELECT * FROM billing.subscriptions ORDER BY updated_at DESC LIMIT 5;`
5. Replay evento → `.\scripts\smoke-billing-e2e.ps1`

Checklist setup → [`billing-e2e.md`](./billing-e2e.md).

## Gateway 502 / 504

1. Identificar prefijo (`/billing/`, `/core/`, …)
2. Railway → upstream → health directo
3. **504 en `/core/` o `/auth/`:** suele ser `proxy_pass` con variable + resolver — productos usan dominio público literal en `gateway/routes/default.conf`
4. Private networking gateway ↔ servicio
5. `DATABASE_URL`, `PORT` · redeploy si crash loop

## AkoeNet 503 `database_schema_outdated`

1. Logs `akoenet-backend` · `npm run migrate`
2. [`../supabase/scripts/akoenet_backend_schema_check.sql`](../supabase/scripts/akoenet_backend_schema_check.sql)

## `@AI` no responde

1. `DAKINIS_INTERNAL_SERVICE_KEY` + `DAKINIS_INTERNAL_URL` en akoenet-backend
2. Redis / worker BullMQ · `.\scripts\smoke-ai.ps1`
3. Ver [`../AKOENET-ASSISTANT.md`](../AKOENET-ASSISTANT.md) si existe

## Hub dashboard vacío / stub

1. Migr. `016`–`019`, `027`–`029` en prod
2. `SELECT hub.v1_get_dashboard('user-id');`
3. Internal API logs

## Supabase RLS sin política

1. Ejecutar [`../supabase/migrations/034_rls_security_advisor_deny_policies.sql`](../supabase/migrations/034_rls_security_advisor_deny_policies.sql)
2. O gaps puntuales en `006b-rls-policies-missing-tables.sql`

## Post-incidente

- [ ] Causa en CHANGELOG o issue
- [ ] Smoke relevante OK
- [ ] Riesgo en STATUS si aplica
