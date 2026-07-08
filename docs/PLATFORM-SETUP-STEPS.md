# Pasos operativos — Supabase y servicios

> Checklist para activar **Hub Workspace Admin** (031), **AkoeNet Assistant** (032–033) y validar deploys en producción.  
> Arquitectura → [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md) · [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md) · Estado → [`PLATFORM-STATUS.md`](./PLATFORM-STATUS.md)

---

## Orden recomendado

```
027–029 (Hub Mi día) → 031 (Workspace) → deploy Internal API + Hub
  → 032 (Assistant módulos) → 033 (Assistant expansión)
  → deploy akoenet-backend + akoenet-client
```

Si 027–029 no están aplicadas, 031 puede ejecutarse igual; el backfill de productos usa `hub.tenant_product_access` si existe.

**Estado jul 2026:** `031` ✅ · Hub `/admin` ✅ · Internal API workspace + assistant ✅ · cliente panel + i18n + event bridge ✅ · `032`–`033` ⬜ prod · workers BullMQ ⬜.

---

## 1. Supabase — SQL Editor

Proyecto: **Dakinis Production** · [Supabase Dashboard](https://supabase.com/dashboard)

### Paso 1.1 — Migración 031 (Workspace + Super Admin) ✅

1. Pega [`supabase/migrations/031_workspace_super_admin.sql`](./supabase/migrations/031_workspace_super_admin.sql) → Run
2. Verifica:

```sql
SELECT count(*) FROM meta.workspaces;
SELECT count(*) FROM meta.workspace_members;
SELECT flag_key, enabled FROM meta.feature_flags WHERE flag_key LIKE 'hub.%';
```

3. **Provisioning completo** (super admin + tenant Core + workspace + productos):

[`supabase/scripts/provision_workspace_christiandvillar.sql`](./supabase/scripts/provision_workspace_christiandvillar.sql)

Idempotente — incluye `core.tenant_memberships` (sin fila = Hub muestra `no_workspace`).

Alternativa mínima solo flags: [`grant_super_admin_christiandvillar.sql`](./supabase/scripts/grant_super_admin_christiandvillar.sql)

### Paso 1.2 — Migración 032 (AkoeNet Assistant — módulos)

**Requisito:** schema `akoenet` activo ([`006_akoenet.sql`](./supabase/migrations/006_akoenet.sql)).

1. Pega [`032_akoenet_assistant_modules.sql`](./supabase/migrations/032_akoenet_assistant_modules.sql) → Run
2. Verifica:

```sql
SELECT key, name, phase FROM akoenet.assistant_modules ORDER BY phase, key;
```

### Paso 1.3 — Migración 033 (AkoeNet Assistant — expansión)

1. Pega [`033_akoenet_assistant_expansion.sql`](./supabase/migrations/033_akoenet_assistant_expansion.sql) → Run
2. Verifica:

```sql
SELECT count(*) FROM akoenet.assistant_events;
SELECT key FROM akoenet.assistant_modules WHERE key IN ('translator', 'support', 'events', 'levels');
```

### Paso 1.4 — Registrar migraciones (opcional)

```sql
INSERT INTO meta.migration_history (migration_file, success, notes)
VALUES
  ('031_workspace_super_admin.sql', true, 'manual prod'),
  ('032_akoenet_assistant_modules.sql', true, 'manual prod'),
  ('033_akoenet_assistant_expansion.sql', true, 'manual prod')
ON CONFLICT (migration_file) DO NOTHING;
```

---

## 2. Railway — Internal API

Servicio: `dakinis-internal-api`

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Supabase pooler `:6543` |
| `DAKINIS_INTERNAL_SERVICE_KEY` | secreto fuerte |
| `REDIS_URL` | Redis Railway |

1. Deploy con cambios en `internal/` (rutas `/workspaces/*`, `/admin/v1/*`, `/akoenet/assistant/*`)
2. Health:

```powershell
curl https://api.dakinissystems.com/internal/health
```

3. Smoke workspace:

```powershell
$k = $env:DAKINIS_INTERNAL_SERVICE_KEY
$uid = "TU-USER-UUID"
curl -H "Authorization: Bearer $k" "https://api.dakinissystems.com/internal/workspaces/me/$uid"
```

4. Smoke assistant (catálogo):

```powershell
curl -H "Authorization: Bearer $k" "https://api.dakinissystems.com/internal/akoenet/assistant/modules"
```

**Commits referencia:** `9cb3f00` (workspace) · `5dfbdca` (assistant).

---

## 3. Railway — Hub (`dakinis-hub`)

| Variable | Valor |
|----------|--------|
| `HUB_INTERNAL_SERVICE_KEY` | mismo que Internal API |
| `HUB_INTERNAL_URL` | `http://dakinis-internal-api.railway.internal:4083` |
| `HUB_API_BASE` | `https://api.dakinissystems.com` |

1. Deploy Hub con panel `/admin`
2. Verifica (logueado IdP):
   - `https://hub.dakinissystems.com/admin`
   - Miembros · Plan · Productos · Configuración

**Commits referencia:** `8f42833` · `15dc18b`

### Dev local

```powershell
cd d:\dakinis-systems\hub
npm ci
# .env: VITE_INTERNAL_SERVICE_KEY, VITE_HUB_DEMO_USER_ID, VITE_API_BASE
npm run dev
```

Abre `http://localhost:5175/admin`

---

## 4. Billing E2E (para Plan en Hub Admin)

Sin esto, la pestaña **Plan** muestra datos pero el portal puede fallar.

1. [`scripts/smoke-billing-e2e.ps1`](../scripts/smoke-billing-e2e.ps1)
2. Stripe → Webhook → `https://api.dakinissystems.com/billing/v1/webhooks/stripe`
3. `STRIPE_WEBHOOK_SECRET` en dakinis-billing
4. Checkout test → verificar `billing.subscriptions` y plan en Core

---

## 5. AkoeNet — Backend + Cliente

### 5.1 Repos

| Repo | Local | Rol |
|------|-------|-----|
| `akoenet-backend` | `apps/akoenet/Server` | API REST + Socket.IO + proxy assistant |
| `akoenet-client` | `apps/akoenet/Client` | Web · Tauri · Capacitor |

Clonar: `.\scripts\clone-akoenet.ps1`

### 5.2 Railway — akoenet-backend

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Postgres dedicado o Supabase (`public` schema legacy) |
| `DAKINIS_INTERNAL_SERVICE_KEY` | mismo que Internal API |
| `DAKINIS_INTERNAL_URL` | `http://dakinis-internal-api.railway.internal:4083` |
| `VITE_API_URL` / gateway | `https://api.akoenet.dakinissystems.com` (cliente) |

Sin `DAKINIS_INTERNAL_*` los toggles del panel Assistant **no persisten** (404 o error silencioso).

1. Deploy backend (`9015f7f2`+ — healthcheck OK)
2. Verificar:

```powershell
curl -s -o /dev/null -w "%{http_code}" https://api.akoenet.dakinissystems.com/health
```

### 5.3 Railway — akoenet-client

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | `https://api.akoenet.dakinissystems.com` |

Panel **Assistant** en ajustes del servidor → `GET/PUT /servers/:id/assistant/modules`.

**Commits referencia:** `eabcb95` (panel) · `8b8d91f` (apiBase fix).

### 5.4 Internal API — rutas Assistant

| Método | Ruta |
|--------|------|
| GET | `/internal/akoenet/assistant/modules` |
| GET | `/internal/akoenet/servers/:serverId/modules` |
| PUT | `/internal/akoenet/servers/:serverId/modules/:moduleKey` |
| POST | `/internal/akoenet/servers/:serverId/assistant/command` |
| POST | `/internal/akoenet/servers/:serverId/assistant/events` |

Backend expone proxy público (JWT usuario): `/servers/:serverId/assistant/modules`.

### 5.5 Event bridge (implementado en backend)

Con `DAKINIS_INTERNAL_*` configurado, **akoenet-backend** reenvía automáticamente:

| Evento local | Internal API |
|--------------|--------------|
| `message.created` (socket + REST) | `POST .../assistant/events` |
| `member.joined` (join / invite) | `POST .../assistant/events` |
| Mensaje con `@AI` en texto | `POST .../assistant/command` (`ai.ask`) |

Código: `apps/akoenet/Server/src/services/assistant-events.service.js` · registrado en `lib/register-domain-handlers.js`.

Los handlers de módulos siguen en **scaffold** hasta workers BullMQ + migr. prod.

### 5.6 StreamAutomator → AkoeNet (siguiente)

```
POST https://api.dakinissystems.com/internal/akoenet/servers/{serverId}/assistant/events
Authorization: Bearer <INTERNAL_SERVICE_KEY>

{ "type": "stream.started", "source": "streamautomator", "payload": { "platform": "twitch", "title": "...", "url": "..." } }
```

### 5.7 Workers BullMQ (Fase 1 — pendiente)

Colas: `akoenet:assistant`, `akoenet:moderation-ai`, `akoenet:knowledge`  
Conectar `AI_PLATFORM_URL` + service key para `@AI` y Guardian AI.

### 5.8 Sync packages antes de deploy Internal API

```powershell
cd d:\dakinis-systems
node scripts/sync-akoenet-packages.mjs
node scripts/verify-package-drift.mjs
```

Copia `packages/akoenet-*` → `internal/packages/` (lo que importa Railway).

---

## 6. Feature flags (opcional)

Tras 031:

```sql
UPDATE meta.feature_flags SET enabled = true WHERE flag_key = 'hub.workspace_admin';
```

O vía Internal API:

```powershell
curl -X PATCH -H "Authorization: Bearer $k" -H "Content-Type: application/json" `
  -d '{"enabled":true}' `
  "https://api.dakinissystems.com/internal/admin/v1/features/hub.workspace_admin"
```

---

## 7. Checklist final

### Hub Admin

- [x] Migr. **031** aplicada en Supabase
- [x] `meta.workspace_members` — script provisioning super admin
- [x] Internal API desplegada con rutas workspace
- [x] Hub desplegado — `/admin` accesible
- [ ] Invitar miembro de prueba funciona
- [ ] Productos on/off se reflejan en launcher
- [ ] Portal Billing abre (tras E2E)

### AkoeNet Assistant

- [ ] Migr. **032** aplicada
- [ ] Migr. **033** aplicada
- [x] Código orchestrator + Internal API + UI toggles + i18n EN/ES
- [x] Backend proxy módulos + event bridge (`message.created`, `member.joined`, `@AI`)
- [x] Sync script `scripts/sync-akoenet-packages.mjs`
- [ ] Toggles persisten E2E en prod
- [ ] Guardian AutoMod en canal test
- [ ] @AI responde vía AI Platform
- [ ] Stream live anuncia en AkoeNet
- [ ] `assistant_usage` registra tokens

---

## 8. AkoeNet login 503 `database_schema_outdated`

**Importante:** migr. **031/032/033** (platform `akoenet` schema) ≠ migraciones **akoenet-backend** (`node-pg-migrate` → tabla `public.users`).

El 503 en login = BD del servicio Railway **akoenet-backend** sin schema legacy.

### Diagnóstico Supabase

[`scripts/akoenet_backend_schema_check.sql`](./supabase/scripts/akoenet_backend_schema_check.sql)

### Fix Railway (akoenet-backend)

1. Confirma `DATABASE_URL` en Variables
2. Pooler Supabase: `?sslmode=no-verify` + `ALLOW_INSECURE_DB_SSL=true`
3. **Redeploy** — arranque ejecuta `runStartupMigrations()` → `npm run migrate`
4. O shell: `npm run migrate`

Login debe devolver **401** con credenciales malas, no **503**.

---

## 9. Super admin — christiandvillar@gmail.com

Ejecutar en Supabase (si no usaste el script completo):

[`scripts/provision_workspace_christiandvillar.sql`](./supabase/scripts/provision_workspace_christiandvillar.sql)

Redeploy **Hub** si no ves enlace **Admin** (hub v0.3.0+).

---

## 10. StreamAutomator build — `supabasePublicUrl`

Si el build falla con `Could not resolve ../../utils/supabasePublicUrl`:

```powershell
cd d:\dakinis-systems\apps\streamautomator
git add apps/web/src/utils/supabasePublicUrl.js
git commit -m "fix(web): add supabasePublicUrl util for Settings build"
git push
```

---

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---------|----------------|-----|
| `/admin` dice "migración 031 pendiente" | Sin `meta.workspaces` / members | 031 + provisioning script |
| `/admin` `no_workspace` | Sin `core.tenant_memberships` | `provision_workspace_christiandvillar.sql` |
| 401 en `/api/hub/me/workspace` | JWT IdP no enviado | Login Hub con IdP |
| 503 `service_key` | Falta `HUB_INTERNAL_SERVICE_KEY` | Railway vars Hub |
| Portal billing error | Billing E2E incompleto | [`PLATFORM-STATUS.md`](./PLATFORM-STATUS.md) Prioridad 1 |
| Assistant 404 en toggles | Cliente usa `api.dakinissystems.com` sin host AkoeNet | `VITE_API_URL=https://api.akoenet.dakinissystems.com` |
| Assistant error con API correcta | Backend caído o sin `DAKINIS_INTERNAL_*` | Redeploy backend + vars |
| Módulos en inglés con UI en ES | Sin i18n cliente | `serverAssistant.modules.*` en `enServerUi.js` / `esServerUi.js` |
| `@AI` no responde | Workers BullMQ ⬜ | Migr. 032–033 + `akoenet:assistant` worker + AI Platform |
| Módulos no en DB | 032 no aplicada | 006 + 032 + 033 |

---

*Actualizar al cerrar cada hito en prod.*
