# Dakinis — Changelog

> **Qué cambió** — sin hashes de commit (detalle en Git)  
> Estado actual → [`STATUS.md`](./STATUS.md)

Formato: [Keep a Changelog](https://keepachangelog.com/) simplificado por **release** o mes.

---

## [Jul 2026] — Platform Assistant + Workspace

### Added

- AkoeNet Assistant: orchestrator, modules, Internal API `/akoenet/assistant/*`
- Supabase migr. `031` workspace + super admin
- Supabase migr. `032`–`033` AkoeNet Assistant modules + events
- Hub Workspace Admin UI `/admin` + Internal API `/workspaces/*`
- migr. `034` RLS deny policies (SQL en repo, aplicación prod pendiente)
- Docs: separación STATUS / ROADMAP / CHANGELOG / DASHBOARD
- ADR-008–011 (Hub entry, Railway, BullMQ, Internal API)

### Changed

- `STATUS.md` → redirige a `STATUS.md`
- Documentación: madurez, ownership, definición de Done

### Deployed (prod)

- Internal API release Jul 2026 (status page, workspace handlers)
- AkoeNet client: voz sidebar, export perfil, i18n Assistant
- AkoeNet backend: event bridge mensajes / joins / `@AI`

### Pending deploy

- akoenet-backend vars `DAKINIS_INTERNAL_*`
- Billing E2E live
- Workers BullMQ Assistant

---

## [Jun 2026] — Billing + Knowledge

### Added

- Billing v0.2.0 scaffold en Railway
- Knowledge service + migr. `025`–`026`
- meta governance migr. `024`
- Hub v0.2.x Mi día scaffold

---

## [May 2026] — Hub + Platform services

### Added

- Hub SSO launcher
- Notifications v0.3.x
- Search service
- Internal API v0.3.x

---

## Cómo registrar cambios

1. Añadir entrada bajo mes o tag de release (`v0.3.1`).
2. **No** pegar SHAs — usar nombre de release o repo.
3. Al cerrar hito en STATUS, añadir línea aquí.
4. Releases GitHub por repo para detalle técnico.
