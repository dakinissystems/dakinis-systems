# Changelog ops — julio 2026 (archivo)

> Notas operativas densas extraídas de STATUS / SECURITY-OPS en el cleanup docs v1 (25 jul 2026).  
> Estado vivo → [`../STATUS.md`](../STATUS.md) · Seguridad → [`../SECURITY.md`](../SECURITY.md)

---

## Consola seguridad (23–25 jul)

- MFA: GitHub · Railway · Supabase · Stripe
- Cloudflare: Full Strict · WAF managed · DDoS · Auth+API rate limit (1 regla plan: `/auth/` + `/api/`, 20 req/10s) · health-skip custom `/health`
- GitHub: Advanced Security / Dependabot / CodeQL revisados en org + Core; sin GHAS en privados → mitigación Gitleaks CI
- Token Cloudflare usado en scripts: rotado tras uso (25 jul)
- UptimeRobot Free: 7 monitores HTTP(s) activos (25 jul)
- Auditoría permisos admin: operador único + MFA (25 jul); próxima ~oct 2026

## Código / plataforma (ventana jul)

- Backups: workflow Postgres #61 · restore test 22 jul (79 tablas `public`, 21 schemas)
- RLS: migr. `052`–`054` + `034` Security Advisor
- Gateway: rate limits live (redeploy 23 jul) · security headers edge
- Heladería Copérnico: tenant pro free · carta editable · floor/kitchen/inventory stubs
- AppGuard: Bearer `/api/me` sin exigir `x-business-id` en cliente
- AkoeNet `@AI`: worker BullMQ `dakinis.ai` · gamificación MVP · levels en servidor piloto
- Hub Mi día: migr. `016`–`019` + `027`–`029` prod (`stub=false`)
- Billing: LiveCheckout unificado SA (probe 16 jul); E2E pago real pendiente
- Secrets historial: akoenet `.env` purge + rotaciones; SA history scrub; Gitleaks `--log-opts=HEAD` en CI

## KPIs snapshot (jul, pre-slim STATUS)

| Métrica | Valor (aprox.) |
|---------|----------------|
| Productos | 5 |
| Repos GitHub | ~18 |
| Servicios Railway | 11+ |
| Workers | AI, Knowledge, Notifications (parcial), SA |
| Clientes de pago | 0 |
| Tenants prod | demo + heladeria-copernico |
| Deploy medio | ~6 min |
| React Doctor media | ~92% |

Detalle de producto / migraciones → ver historial git de `STATUS.md` antes del cleanup.
