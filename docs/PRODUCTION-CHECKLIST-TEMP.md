# Checklist producción — pendiente (TEMP)

> **Actualizado:** 27 mayo 2026 · Solo pendiente. Guías: [`supabase/SETUP.md`](./supabase/SETUP.md)

---

## 🔴 Crítico

| Acción |
|--------|
| **Core Front** — rebuild (`VITE_SENTRY_DSN`, API URL en build) |
| **Core Front** — `/sistema/restaurante` → Network 200 (supply/cocina) |
| **AkoeNet** — `/akoenet/health` sigue 502: logs Railway backend (`PORT`, DB, Redis, crash antes de `listen`) |
| **AkoeNet client** — `VITE_DAKINIS_AUTH_URL=https://api.dakinissystems.com/auth` + rebuild |
| **AkoeNet** — IdP → exchange → WebSocket |

---

## 🟠 Importante

| Acción |
|--------|
| dakinis-auth `SENTRY_DSN` + redeploy |
| Sentry rebuild: akoenet-client (Core Front arriba si falta) |
| Quitar `VITE_SENTRY_DSN` del servicio **gateway** |
| akoenet-server redeploy (CI test `/health`) |
| SA web: opcional `VITE_SENTRY_DSN` + rebuild si quieres Sentry en prod |

---

## 🟡 Infra

| Acción |
|--------|
| GitHub `BACKUP_DATABASE_URL` (5432 directo, no pooler) |
| Supabase Security Advisor |
| Eliminar plugin Postgres Railway (al final) |
| Uptime Kuma |

---

## Smoke (cuando cierres AkoeNet)

```bash
curl -sS -o /dev/null -w "akoenet:%{http_code}\n" https://api.dakinissystems.com/akoenet/health
```

---

## Referencias

- [`supabase/SETUP.md`](./supabase/SETUP.md) · [`observability/SENTRY-SETUP.md`](./observability/SENTRY-SETUP.md) · `gateway/routes/default.conf`
