# Seguridad operativa — Dakinis

> Checklist P0–P1 para un solo operador. Deploy → [`OPERATIONS.md`](./OPERATIONS.md) · Estado → [`STATUS.md`](./STATUS.md) · Gateway → [`rules.md`](./rules.md)

**Principio (Kerckhoffs):** asumir que el atacante conoce la arquitectura.

---

## Checklist P0

| Control | Estado | Notas |
|---------|--------|-------|
| MFA GitHub / Railway / Supabase / Stripe | [x] | ✅ 23 jul |
| MFA Cloudflare | [ ] | Confirmar 2FA perfil |
| Backups diarios (`BACKUP_DATABASE_URL`) | [x] | Workflow #61 · 22 jul |
| Restore test | [x] | ✅ 22 jul · 79 tablas `public` |
| DR documentado | [x] | Ver § DR abajo |
| Auditoría permisos admin (trimestral) | [x] | ✅ 25 jul · § [Auditoría trimestral](#auditoria-trimestral) |

---

## Checklist P1 (antes del primer cliente de pago)

| Control | Estado | Notas |
|---------|--------|-------|
| Cloudflare WAF + Full Strict | [x] | ✅ 23 jul |
| Rate limit Auth + API (CF) | [x] | `/auth/` + `/api/` · 20/10s · 25 jul |
| Health-skip `/health` (CF) | [x] | Custom rule · 25 jul |
| Cabeceras + rate limit Gateway | [x] | Redeploy 23 jul |
| Uptime externo + alerta | [x] | UptimeRobot Free · 7 monitores · [`OPERATIONS.md#monitorizacion`](./OPERATIONS.md#monitorizacion) |
| Uptime probes GH Actions | [x] | Cron · CF challenge = warning |
| Dependabot + `npm audit` CI | [x] | Org + Core |
| Secret scanning (privados) | [~] | Sin GHAS · **Gitleaks** CI + pre-commit |
| Dependabot/CodeQL repos restantes | [ ] | Revisar tabletop / search |
| PR Security Review template | [x] | `.github/pull_request_template.md` |
| Rotación periódica secretos | [~] | Dual-key en código · calendario 90d |

Leyenda: [x] hecho · [~] parcial · [ ] pendiente.

---

## Auditoría trimestral

Completar ~30 min · anotar fecha en [`STATUS.md`](./STATUS.md).

**Última auditoría:** ✅ **25 jul 2026** — operador único (Christian); MFA en consolas; sin collaborators externos ni tokens de terceros.  
**Próxima:** ~octubre 2026 (o al incorporar a alguien al equipo).

### GitHub org (`dakinissystems`)

- [x] Owners: solo cuentas con MFA
- [x] Teams / outside collaborators: nadie de más (solo operador)
- [x] Deploy keys: rotar/eliminar huérfanas
- [x] GitHub Apps instaladas: revisar permisos
- [x] Actions secrets org: quién puede leer (solo owners)
- [x] Branch protection en repos críticos (`main`)

URL: https://github.com/organizations/dakinissystems/settings/security

### Railway

- [x] Miembros del workspace / proyecto (solo operador)
- [x] Quién ve variables de entorno (prod)
- [x] Tokens de API personales activos

URL: https://railway.com/dashboard

### Supabase (Dakinis Production)

- [x] Organization members / roles (solo operador)
- [x] Service role no compartido fuera de Railway
- [x] MFA en cuentas del proyecto

URL: https://supabase.com/dashboard

### Stripe

- [x] Team members (solo operador)
- [x] Restricted keys vs secret keys
- [x] Webhooks endpoints esperados

URL: https://dashboard.stripe.com/settings/team

### Cloudflare

- [x] Account members (solo operador)
- [x] API tokens (mínimo privilegio; token expuesto 25 jul **rotado**)
- [x] Zone `dakinissystems.com` admins

URL: https://dash.cloudflare.com/?to=/:account/members

### Cierre

- [x] Revocar accesos de quien ya no colabora **el mismo día** (N/A)
- [x] Actualizar fecha arriba + STATUS
- [x] Si hubo revocación: rotar secretos tocados (N/A)

---

## DR básico

| Escenario | Acción |
|-----------|--------|
| Gateway caído | Redeploy Railway gateway; DNS Cloudflare intacto |
| DB corrupta | Restore efímero (`scripts/restore-postgres-test.mjs`); validar schemas |
| Filtración `INTERNAL_SERVICE_KEY` | Rotación dual-key + revisar logs |
| Cuenta admin comprometida | Revocar MFA, rotar secretos de esa consola, auditar 7 días |

Asistente consolas: `.\scripts\security-console-checklist.ps1`

---

## Enlaces

| Tema | Doc |
|------|-----|
| Monitorización / uptime | [`OPERATIONS.md#monitorizacion`](./OPERATIONS.md#monitorizacion) |
| Leak de secretos (Gitleaks) | [`SECRET-LEAK-REMEDIATION.md`](./SECRET-LEAK-REMEDIATION.md) |
| Reglas Gateway | [`rules.md`](./rules.md) |
| Histórico jul ops | [`archive/CHANGELOG-ops-2026-07.md`](./archive/CHANGELOG-ops-2026-07.md) |

P2+ (JWT servicio, audit log, RBAC, Guardian, mTLS, Vault, SIEM) → diferido hasta escala; no bloquear go-live.
