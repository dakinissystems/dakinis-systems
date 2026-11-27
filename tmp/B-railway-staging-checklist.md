# Railway staging — checklist circuito comercial

**Estado:** ⏸ **aparcado** — no bloquea piloto · environment `staging` existe a medias (Auth crash; secretos sellados pendientes)  
**Captura:** `assets/image-40245f49-…` / `image-6ac0be5b-…`  
**Retomar:** antes del 2º negocio o cobro de prueba que no quieras en prod.

## Fallos vistos al primer deploy

| Servicio | Fallo | ¿Circuito? | Acción |
|----------|-------|------------|--------|
| `dakinis-auth` | **Crashed** | **Sí** | Redeclarar secretos sellados + Deploy Logs |
| `dakinis-internal-assistant-worker` | push registry `resumable blob upload invalid` | No | Redeploy / ignorar por ahora |
| `streamautomator-scheduler` | healthcheck `/api/health` → 503 | No | Ignorar o quitar healthcheck en staging |

## Auth staging — checklist secretos

Tras Duplicate, las variables **selladas** no se copian. Sin ellas Auth no arranca en prod-like:

- [ ] `JWT_SECRET` (staging, distinto de prod)
- [ ] `DATABASE_URL` del Postgres/staging (o Supabase staging)
- [ ] `RESEND_API_KEY` (o desactivar guard de email si hay flag de staging)
- [ ] `CORS_ORIGINS` / URLs de Hub/Core staging
- [ ] Cualquier `JWT_*` / `DAKINIS_*` que Auth lea al boot

1. Abrir `dakinis-auth` → Deployments → **Deploy Logs** (crash reason)  
2. Variables → rellenar selladas  
3. Redeploy Auth  
4. Probar: `https://<auth-staging>/auth/health/live`

## Circuito mínimo (arreglar primero)

Gateway · Auth · Core Back · Billing · Hub · Internal · Redis  

**No bloquean el circuito:** StreamAutomator*, Tabletop*, AkoeNet*, LifeFlow*, AI/Search/Knowledge*, assistant-worker.

## Tras Auth Online

```powershell
.\scripts\smoke-circuit-health.ps1 -ApiBase https://<gateway-staging> -HubBase https://<hub-staging>
```
