# Runbook live — condiciones abiertas (sin cobro)

Plantillas operativas. Marcar PASS en `B-cond*` / `B-ocho` con fecha.  
**No** pegar secretos, tokens ni `.env` en evidencias.

---

## COND-001 — Tenant A ≠ B (Search / Core)

**Preparación**

1. Tenant A y Tenant B (piloto + segundo o staging).  
2. Dato privado solo en A (doc Search o recurso Core).

**Ejecución**

1. Autenticar como usuario de B.  
2. Consultar API/Search que debería devolver solo B.  
3. Intentar ID/recurso de A.

**Esperado:** denegado / vacío · sin filtración.  
**Evidencia:** request-id + status + captura (sin PII).

---

## COND-002 — Rol sin permiso

1. Usuario **member** (no admin) en Copérnico.  
2. Abrir ruta admin / acción admin-only.  
**Esperado:** 403 / UI oculta. Viewer no aparece en invite (`B2`).

---

## COND-003 — Refresh revocado → 401

1. Login → guardar refresh.  
2. Revocar sesión/familia (`POST` revoke o UI sesiones).  
3. Reusar refresh antiguo.

**Esperado:** **401** · familia tumbada (`reuseDetected` si aplica).  
Access token puede vivir hasta `JWT_ACCESS_TTL` (documentado).

---

## COND-005 — UNIQUE webhook (SQL vivo, sin charge)

En SQL del proyecto Billing (Supabase/Railway), solo lectura:

```sql
-- Esperado: UNIQUE en stripe_event_id
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'billing'
  AND tablename = 'stripe_webhook_events';
```

O `\d billing.stripe_webhook_events` en `psql`.  
**PASS** si existe UNIQUE / unique index en `stripe_event_id`.  
No hace falta reenviar evento Stripe de cobro.

---

## COND-007 — Audit row

1. Acción admin (p. ej. cierre de caja) en Core piloto.  
2. SQL:

```sql
SELECT action, tenant_id, user_id, created_at
FROM tenant_audit_logs
ORDER BY created_at DESC
LIMIT 5;
```

**PASS** si aparece la acción esperada (p. ej. `restaurant.cash_close`).

---

## COND-008 — Suplente

Rellenar `tmp/B-cond8-suplente-checklist.md` (nombre + contacto + fecha).

---

## B9 — Hub Mi día browser

1. `https://hub.dakinissystems.com` login piloto.  
2. Mi día → stock → Ver inventario.  
3. Mi día → pedido → Ver pedidos.  
4. PASS en `B9-hub-midia-browser-checklist.md`.
