# Workspace OS — QA Checklist

Checklist para validar el sprint Workspace OS (addons live, métricas platform, sync servidor, search y cron SA).

**Fecha:** 2026-07-14  
**Repos:** `akoenet-client`, `akoenet-backend`, `dakinis-systems` (internal + migraciones), `dakinis-streamautomator`

---

## Pre-requisitos

- [ ] Migración **039** aplicada en Supabase (`meta.workspace_addon_data`)
- [ ] Variables en AkoeNet backend:
  - [ ] `DAKINIS_INTERNAL_SERVICE_KEY`
  - [ ] `DAKINIS_INTERNAL_URL` (opcional en Railway)
  - [ ] `DAKINIS_SEARCH_URL` o `DAKINIS_GATEWAY_URL`
- [ ] Usuario de prueba con `users.platform_user_id` vinculado (UUID Hub)
- [ ] Internal API desplegada con rutas `/platform/metrics` y `/workspaces/me/:id/data/:addonKey`
- [ ] StreamAutomator (opcional cron): `CRON_SECRET`, `DAKINIS_SEARCH_URL`

---

## 1. Workspace desktop y navegación

- [ ] Login en AkoeNet → `/workspace` carga el escritorio con dock
- [ ] Perfil **office** abre addon live (calendar/kanban/notes/dashboard)
- [ ] Perfil **developer** abre terminal y muestra devops/monitor/code-editor en dock
- [ ] Cambio de perfil persiste en localStorage y restaura layout vía API
- [ ] Snap entre ventanas flotantes funciona en al menos 2 addons

---

## 2. Command Palette (Ctrl+K)

- [ ] Comandos de navegación: notes, calendar, kanban, dashboard, terminal, monitor, devops, code editor
- [ ] Comandos ecosistema: Hub, StreamAutomator, Core (abren URL externa)
- [ ] Búsqueda federada con `q` ≥ 2 chars devuelve hits remotos (mensajes)
- [ ] Búsqueda local: notas, tareas kanban, eventos calendar, archivos code-editor
- [ ] Scopes `all`, `documents`, `events`, `messages` filtran correctamente

---

## 3. Addons live (9 rutas)

| Addon | Ruta | OK |
|-------|------|----|
| Media Player | `/media` | [ ] |
| Notes | `/notes` | [ ] |
| Calendar | `/calendar` | [ ] |
| Kanban | `/kanban` | [ ] |
| Dashboard | `/dashboard` | [ ] |
| Terminal | `/terminal` | [ ] |
| Monitor | `/monitor` | [ ] |
| DevOps | `/devops` | [ ] |
| Code Editor | `/code` | [ ] |

Para cada addon:

- [ ] Toolbar «← Escritorio» vuelve a `/workspace`
- [ ] 3 ventanas flotantes visibles, drag/resize/snap OK
- [ ] Layout persiste al recargar (API o localStorage fallback)

---

## 4. Terminal sandbox

- [ ] `help` lista comandos
- [ ] `open notes|kanban|calendar|dashboard|monitor|devops|code` navega
- [ ] `dakinis hub` abre Hub externo
- [ ] `clear`, `history`, `echo` funcionan
- [ ] Bookmarks guardados en localStorage

---

## 5. Activity Center

- [ ] Feed carga vía `GET /workspace/activity`
- [ ] Items clicables (links internos/externos según producto)
- [ ] Con Internal API apagado: stub vacío sin crash

---

## 6. DevOps (`/devops`)

- [ ] `GET /workspace/devops` responde 200 autenticado
- [ ] Panel **Deployments**: lista eventos deploy (si Hub timeline los tiene)
- [ ] Panel **Logs**: líneas infra + deploy
- [ ] Panel **Servicios**: Postgres, Redis, Storage, Scheduler + links Railway/Supabase/GitHub
- [ ] Poll automático ~12s sin errores en consola

---

## 7. Monitor + métricas platform

- [ ] `GET /workspace/metrics` responde `{ local, platform, checkedAt }`
- [ ] `GET /internal/platform/metrics` (service key) lista servicios platform
- [ ] Monitor Overview muestra tarjeta «Servicios platform» (ej. `5/6`)
- [ ] Monitor Servicios lista internal, search, notifications, etc.
- [ ] Dashboard widget **Infra platform** muestra ratio y borde verde/rojo
- [ ] Widget hace click → abre `/monitor`

---

## 8. Sync addon data (servidor)

Probar con Internal API **ON** y usuario con workspace:

### Kanban

- [ ] Crear tarea → esperar ~1s → `GET /workspace/data/kanban` incluye la tarea
- [ ] Segundo navegador/dispositivo: al abrir `/kanban` hidrata datos del servidor

### Calendar

- [ ] Crear evento → sync en `GET /workspace/data/calendar`
- [ ] Command Palette encuentra evento por título (local + remoto si indexado)

### Notes

- [ ] Editar nota → sync en `GET /workspace/data/notes`

### Code Editor

- [ ] Nuevo archivo `test.js` → sync en `GET /workspace/data/code-editor`
- [ ] Outline detecta `function` / `class` en JS

Sin Internal API:

- [ ] Addons siguen en localStorage-only sin errores bloqueantes

---

## 9. Universal Search (indexación)

Con `DAKINIS_SEARCH_URL` configurado:

- [ ] Crear/editar tarea kanban → buscar título en Ctrl+K (scope events)
- [ ] Crear evento calendar → buscar en Ctrl+K
- [ ] Editar nota → buscar en Ctrl+K (scope documents)
- [ ] Archivo code-editor → buscar snippet en Ctrl+K
- [ ] Mensaje de canal sigue indexándose al crear (regresión)

---

## 10. Dashboard

- [ ] Widgets: activity, infra, notes, kanban, calendar, streams, hub
- [ ] Activity feed muestra últimos items del Hub
- [ ] Quick links abren notes, kanban, calendar, monitor, devops, code

---

## 11. StreamAutomator — search reindex

### Manual CLI

```bash
cd apps/streamautomator/apps/api
npm run search:reindex -- --limit=100
```

- [ ] Termina con `{ indexed: N }` sin error
- [ ] Contenido existente aparece en `GET /api/workspace/search?q=...`

### HTTP cron endpoint

```bash
curl -X POST "https://<sa-api>/api/workspace/search/reindex?limit=100" \
  -H "X-Cron-Secret: $CRON_SECRET"
```

- [ ] Responde `{ ok: true, ... }`
- [ ] Sin secret → 401

### Railway cron (ops)

- [ ] Servicio cron con `railway.cron.json` programado `0 4 * * *`
- [ ] Logs muestran reindex exitoso tras primera ejecución

---

## 12. Regresiones rápidas

- [ ] `/messages` y servidores Discord sin cambios rotos
- [ ] `/health` y `/health/deps` AkoeNet OK
- [ ] Media player reproduce y layout persiste
- [ ] i18n ES/EN: claves `workspace.*`, `devops.*`, `monitor.*`, `codeEditor.*` sin raw keys

---

## 13. Smoke por entorno

| Entorno | Client | API | Internal | Search | OK |
|---------|--------|-----|----------|--------|----|
| Local dev | [ ] | [ ] | [ ] | [ ] | [ ] |
| Railway staging | [ ] | [ ] | [ ] | [ ] | [ ] |
| Producción | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## Notas / incidencias

_Anotar aquí fallos, URLs, IDs de usuario de prueba y capturas._

| # | Área | Descripción | Severidad |
|---|------|-------------|-----------|
| 1 | | | |
| 2 | | | |
