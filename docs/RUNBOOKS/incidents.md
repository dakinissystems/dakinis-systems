# Runbook — incidencias comunes

Estado → [`../STATUS.md`](../STATUS.md).  
Infra / ocho condiciones → [`infra-desarrollador.md`](./infra-desarrollador.md).

## Severidad (condición 8)

| Nivel | Significa | Respuesta |
|-------|-----------|-----------|
| **P0** | Servicio de identidad, cobro o datos de negocio caídos o filtración probable | Contener ya; comunicar en ≤ 1 h; post-mortem en 72 h si hay datos personales |
| **P1** | Circuito comercial degradado (Hub vacío, webhook a reintentos, un vertical caído) | Mitigar el mismo día; evidencia en `docs/evidence/` |
| **P2** | Fallo acotado con workaround | Issue + smoke; no bloquea piloto |
| **P3** | Cosmético / deuda / solo desarrollo | Backlog |

**Responsable P0:** operador (Christian David Villar Colodro).  
**Suplente:** ⬜ nombrar antes del segundo negocio (ejecuta runbooks sin decidir producto).  
**Deuda cobro:** B6 / Stripe live / SA pago real — aparcados; no bloquean el resto del circuito.

Break-glass: rotar `JWT_SECRET` / `DAKINIS_INTERNAL_SERVICE_KEY` según inventario de secretos; revocar familias de refresh; Stripe Dashboard → webhooks; Railway redeploy. Sin improvisar fuera de este documento y de [`infra-desarrollador.md`](./infra-desarrollador.md).

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

## Access token robado

El access token dura `JWT_ACCESS_TTL`. Si no está definida, 15 min. Revocar la familia de refresh no lo invalida antes de `exp`.

1. Revocar la familia de sesión de ese usuario (`POST /auth/sessions/revoke` o revoke-others).
2. Forzar el cambio de contraseña. Eso marca `revoked_at` en los refresh.
3. Revisar el audit log de identidad de esa cuenta en la ventana del token.
4. Si la violación puede suponer un riesgo para los derechos de la persona, corre el plazo de 72 h desde que hay constancia. El detalle está en el runbook de infraestructura.

No hay corte inmediato del access token. El procedimiento es este, no una improvisación.

## Post-incidente

- [ ] Causa en CHANGELOG o issue
- [ ] Smoke relevante OK
- [ ] Riesgo en STATUS si aplica
