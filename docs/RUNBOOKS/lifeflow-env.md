# Runbook — LifeFlow env / reset

> Mapa servicios → [`../OPERATIONS.md`](../OPERATIONS.md)

## Variables Railway

### API

| Variable | Valor |
|----------|-------|
| `FINANZAS_DB_PATH` | `/data/finanzas.db` |
| `FINANZAS_JWT_SECRET` | Secreto fijo (no regenerar en cada deploy) |
| `RESEND_API_KEY` | Obligatorio en prod para reset por email |
| `RESEND_FROM` | `Dakinis Finanzas <noreply@dakinissystems.com>` |
| `DAKINIS_AUTH_URL` | `https://auth.dakinissystems.com` (**sin** `/auth`) |
| `PORT` | Railway auto |

### Web

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://finance-api.dakinissystems.com` |

**Volume:** montar en **`/data`**, no solo el archivo.

## Auth 401 — diagnóstico

LifeFlow **no usa Supabase** para usuarios. Auth vive en **SQLite** (`users` en `finanzas.db`).

| Síntoma | Causa probable |
|---------|----------------|
| `POST /api/auth/login` → **401** | Email no existe o contraseña incorrecta |
| Registro OK, login falla después | BD efímera / WAL / volume mal montado |
| `/api/auth/me` → 401 con token viejo | JWT secret cambió entre deploys |

```powershell
curl.exe -sS https://finance-api.dakinissystems.com/health
```

Esperado: `"engine":"sqlite"`, `"userCount":N`, `"configuredPath":true`.

## Reset password (Railway Shell — LifeFlow API)

```bash
npm run reset-password -w @finanzas/api -- tu@email.com TuNuevaClave123 --create
```

`--create` crea el usuario si no existe.
