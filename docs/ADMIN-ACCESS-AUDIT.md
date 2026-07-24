# Auditoría de permisos admin (trimestral)

> Completar ~30 min · anotar fecha en [`STATUS.md`](./STATUS.md) · checklist canónica también en [`SECURITY-OPS.md`](./SECURITY-OPS.md)

**Última auditoría:** ⬜ _(pendiente — primera pasada)_

## GitHub org (`dakinissystems`)

- [ ] Owners: solo cuentas con MFA
- [ ] Teams / outside collaborators: nadie de más
- [ ] Deploy keys: rotar/eliminar huérfanas
- [ ] GitHub Apps instaladas: revisar permisos
- [ ] Actions secrets org: quién puede leer
- [ ] Branch protection en repos críticos (`main`)

URL: https://github.com/organizations/dakinissystems/settings/security

## Railway

- [ ] Miembros del workspace / proyecto
- [ ] Quién ve variables de entorno (prod)
- [ ] Tokens de API personales activos

URL: https://railway.com/dashboard

## Supabase (Dakinis Production)

- [ ] Organization members / roles
- [ ] Service role no compartido fuera de Railway
- [ ] MFA en cuentas del proyecto

URL: https://supabase.com/dashboard

## Stripe

- [ ] Team members
- [ ] Restricted keys vs secret keys
- [ ] Webhooks endpoints esperados

URL: https://dashboard.stripe.com/settings/team

## Cloudflare

- [ ] Account members
- [ ] API tokens (mínimo privilegio, caducidad)
- [ ] Zone `dakinissystems.com` admins

URL: https://dash.cloudflare.com/?to=/:account/members

## Cierre

- [ ] Revocar accesos de quien ya no colabora **el mismo día**
- [ ] Actualizar «Última auditoría» arriba + STATUS
- [ ] Si hubo revocación: rotar secretos tocados por esa persona

**Riesgo mitigado:** privilege sprawl.
