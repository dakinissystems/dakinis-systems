# Runbook — dakinis-auth + Google OAuth

Servicio **dakinis-auth** (`auth.dakinissystems.com`). Tras cambios en código, **redeploy obligatorio**.

## Variables prod

| Variable | Valor |
|----------|-------|
| `AUTH_PUBLIC_URL` | `https://auth.dakinissystems.com` |
| `JWT_SECRET` | Igual que Core Back |
| `DATABASE_URL` | Supabase pooler 6543 |
| `AUTH_SCHEMA` | `dakinis_auth` |
| `CORS_ORIGINS` | Orígenes de todos los frontends |
| `RESEND_API_KEY` / `RESEND_FROM` | Remitente verificado |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Mismo OAuth client que StreamAutomator |
| `GOOGLE_REDIRECT_URI` | `https://auth.dakinissystems.com/auth/oauth/google/callback` |
| `HUB_WEB_URL` | `https://hub.dakinissystems.com` |
| `FINANZAS_WEB_URL` | `https://finance.dakinissystems.com` |

**Google Cloud Console:** añadir el redirect URI al OAuth client.

## Convención `VITE_DAKINIS_AUTH_URL`

| App | Valor | Motivo |
|-----|-------|--------|
| Hub, AkoeNet client | `https://auth.dakinissystems.com/auth` | Cliente llama `/login`, `/password-reset/start` |
| Tabletop web | `https://auth.dakinissystems.com` | Cliente añade `/auth/oauth/...` |
| Tabletop API | `DAKINIS_AUTH_URL=https://auth.dakinissystems.com` | Servidor añade `/auth/me` |

⚠️ **No mezclar:** Hub sin `/auth` → 404 en `/login`. Tabletop con `/auth` → `/auth/auth/oauth/...`.

## Smoke reset

```powershell
curl.exe -sS -o NUL -w "%{http_code}" -X POST https://auth.dakinissystems.com/auth/password-reset/start -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"product\":\"hub\"}"
# Esperado: 200
```
