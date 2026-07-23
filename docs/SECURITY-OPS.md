# Seguridad operativa — roadmap Dakinis

> Inversiones de infraestructura con alto retorno aunque haya pocos clientes.  
> **Principio (Kerckhoffs):** asumir que el atacante conoce la arquitectura. La seguridad no depende de ocultar puertos ni diagramas.  
> Estado producto → [`STATUS.md`](./STATUS.md) · Deploy → [`OPERATIONS.md`](./OPERATIONS.md)

Este documento es un **roadmap de gestión del riesgo**, no una checklist OWASP genérica. Prioriza medidas que reducen riesgo real (robo de credenciales, pérdida de datos, abuso de API) y deja claro qué vive en Git y qué solo en consolas.

---

## Leyenda de prioridades

| Nivel | Condición | Significado |
|-------|-----------|-------------|
| **P0** | Imprescindible ya | Sin esto, un incidente típico es catastrófico o irreversible |
| **P1** | Antes del primer cliente de pago | Base mínima para tráfico real |
| **P2** | Antes de ~20 clientes | Reduce movimiento lateral e impacto de cuentas robadas |
| **P3** | Antes de ~100 clientes | Detección y respuesta a escala |
| **P4** | Cuando escale (equipos / muchos servicios) | Zero Trust avanzado — **retrasar** hasta entonces |

**Esfuerzo:** estimación de calendario (persona única familiarizada con el stack), no persona-mes.

---

## Matriz de riesgo (visión rápida)

| Medida | P | Riesgo mitigado | Esfuerzo | Estado |
|--------|---|-----------------|----------|--------|
| MFA en consolas | P0 | Credential theft | ~15 min/cuenta | ✅ 23 jul (GH · Railway · Supabase · Stripe) |
| Backups diarios | P0 | Data loss | ~20 min (secret + 1 run) | ✅ secret + run #61 (22 jul) |
| Restore test | P0 | Backup corruption / DR ciego | ~30 min primera vez | ✅ 22 jul 2026 (79 tablas public) |
| DR documentado | P0 | Tiempo de recuperación | ya en este doc | ✅ revisado 23 jul |
| Auditoría permisos admin (trimestral) | P0 | Privilege sprawl | ~30 min/trimestre | ⬜ pendiente (GH · Railway · Supabase · Stripe) |
| Cloudflare WAF | P1 | OWASP Top 10 / bots / escaneos | ~30 min | ✅ 23 jul managed + DDoS + Auth RL |
| Cabeceras HTTP Gateway | P1 | Clickjacking, MIME sniff, HTTPS | ya en repo | ✅ prod verificado |
| Rate limiting Gateway | P1 | Brute force / DoS ligero | ya en repo | ✅ prod + CF `/auth/` RL |
| Monitorización uptime + errores | P1 | Blind ops | ~1 h | 🟡 GH probes · falta alerta externa |
| Rotación periódica secretos | P1 | Secret leak prolongado | ~1–2 h/ciclo | 🟡 dual-key en código · calendario consola |
| Dependabot + `npm audit` CI | P1 | Supply chain (CVEs conocidas) | ya en repo | ✅ org + Core verificado |
| Secret scanning GitHub (privados) | P1 | Secrets en git | — | ⏸ **sin GHAS** · mitigación ✅ **Gitleaks** CI + pre-commit |
| PR Security Review template | P1 | Olvidos en features nuevas | — | ✅ `.github/pull_request_template.md` |
| JWT internos (servicio) | P2 | Lateral movement / clave eterna | ~1–2 semanas | ⬜ guía · fail-closed + dual-key listos |
| Audit log central | P2 | Incident response ciego | ~1–2 semanas | 🟡 `meta.log_audit` en invites/workspace/flags |
| RBAC granular | P2 | Over-privilege tokens | ~1–2 sprints | 🟡 Auth roles + refresh fix |
| Sesiones cortas + refresh | P2 | Token theft | Auth | ✅ access 15m + refresh rotatorio |
| Límites por tenant | P2 | Noisy neighbor / abuso IA | ~3–5 días | 🟡 Redis tenant cap en Internal API |
| Guardian (detección anómala) | P3 | Abuse / fraud / takeover | ~1 mes **tras prereqs** | ⬜ no empezar aún |
| Sandboxing / tool-calling IA | P3 | Prompt injection / exfiltración | ~1–2 semanas | 🟡 parcial |
| Trivy / firma imágenes | P3–P4 | Supply chain contenedores | ~1 semana | ⬜ |
| mTLS entre servicios | P4 | Spoofing en red | alto | ⏸ retrasar |
| Vault | P4 | Secret sprawl multi-equipo | alto | ⏸ retrasar |
| SIEM | P4 | Correlación logs a escala | alto | ⏸ retrasar |

---

## Inventario de activos críticos

Cuando ocurre un incidente, lo primero es saber **qué proteger**.

| Activo | Tipo | Criticidad | Notas |
|--------|------|------------|--------|
| Gateway (`api.dakinissystems.com`) | Edge | Crítica | Único punto de entrada público plataforma |
| Auth | Identidad | Crítica | Emite/verifica sesiones |
| Internal API | Orquestación | Crítica | Hub, invites, eventos internos |
| Billing | Pagos | Crítica | Stripe webhooks + suscripciones |
| Supabase (Postgres) | Datos | Crítica | Fuente de verdad multi-tenant |
| Redis | Estado / colas | Alta | Sessions cache, BullMQ |
| AI | Compute | Alta | Coste + datos de prompts |
| Knowledge | Datos | Alta | RAG / documentos tenant |
| Cloudflare | Edge / DNS / WAF | Crítica | Primera línea |
| Railway | Runtime | Crítica | Deploy + secretos runtime |
| GitHub org | Código / CI | Crítica | Supply chain + Actions secrets |
| Hub / Core / productos | Apps | Alta | Superficie usuario |

Detalle de topología → [`ARCHITECTURE.md`](./ARCHITECTURE.md) (repo privado).

---

## Clasificación de datos

Ayuda a decidir controles (cifrado, retención, quién puede ver qué).

| Nivel | Ejemplos | Tratamiento |
|-------|----------|-------------|
| **Público** | Landing, docs legales públicos, assets de marketing | CDN OK; sin secretos |
| **Interno** | Logs de request, métricas, runbooks, este documento | Solo staff; repos privados |
| **Confidencial** | Usuarios, facturas, inventario, contenido tenant, prompts IA | RLS + auth; no en tickets públicos |
| **Crítico** | Passwords/hashes, JWT signing keys, `INTERNAL_SERVICE_KEY`, Stripe secrets, Supabase service role, SSH | Solo gestores de secretos (Railway/GitHub); rotación; nunca en git ni docs |

Si una feature toca **Crítico** o **Confidencial**, aplicar la [Security Review](#security-review--nueva-funcionalidad) antes de merge.

---

## Estado en código / CI

| Control | P | Estado | Dónde |
|---------|---|--------|--------|
| Backups diarios (workflow) | P0 | ✅ secret + run #61 (22 jul) | `.github/workflows/backup-postgres.yml` |
| Prueba de restauración | P0 | ✅ 22 jul (79 tablas public) | `scripts/restore-postgres-test.mjs` · `.github/workflows/restore-postgres-test.yml` |
| Dependabot | P1 | ✅ | `.github/dependabot.yml` |
| `npm audit` en CI | P1 | ✅ | `.github/workflows/ci.yml` |
| Rate limiting Gateway | P1 | ✅ prod 23 jul | `gateway/nginx.conf` |
| Cabeceras HTTP Gateway | P1 | ✅ código · redeploy edge | `gateway/routes/security-headers.conf` |
| RLS Supabase (deny anon) | P1 | ✅ | migraciones `034`+ · gaps `052`–`054` (22 jul) |
| Service auth fail-closed (prod) | P1 | ✅ | Internal / Billing / Knowledge |
| Dual-key rotation S2S | P1 | ✅ | `DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS` |
| PR Security Review checklist | P1 | ✅ | `.github/pull_request_template.md` |
| Auth access 15m + refresh | P2 | ✅ | `platform/auth` (`JWT_ACCESS_TTL`, refresh family) |
| Audit writes (`meta.log_audit`) | P2 | 🟡 parcial | invites, workspace status, feature flags |
| Tenant rate limit (Internal) | P2 | 🟡 parcial | `INTERNAL_RATE_LIMIT_TENANT_PER_MIN` + headers |

Leyenda estado: ✅ hecho · 🟡 parcial / bloqueado por consola · ⬜ no empezado · ⏸ retrasar a propósito.

---

## P0 — Imprescindible (consola + un secret)

### MFA obligatorio (~15 min/cuenta)

Activar MFA (TOTP o hardware) en **todas** las cuentas admin:

- [x] GitHub (org + owners) — ✅ 23 jul · 2FA + org security review + Advanced Security
- [x] Railway — ✅ 23 jul
- [x] Supabase — ✅ 23 jul
- [x] Stripe — ✅ 23 jul · MFA + revisión seguridad cuenta
- [ ] Cloudflare — MFA cuenta (WAF/DNS ya endurecidos 23 jul; confirmar 2FA perfil)

Asistente interactivo (abre dashboards):

```powershell
.\scripts\security-console-checklist.ps1
```

**Riesgo mitigado:** credential theft.  
Revisar trimestralmente quién tiene rol Owner/Admin en cada consola (ver auditoría abajo).

### Backups (~20 min setup)

1. Crear secret de GitHub Actions `BACKUP_DATABASE_URL` (connection string **pooler/read** o rol de solo lectura si existe; nunca service role en logs).
2. Ejecutar workflow **Postgres backup** → `workflow_dispatch` y verificar artifact `postgres-backup-*`.
3. Anotar fecha en [`STATUS.md`](./STATUS.md) (KPI «Último backup auto»).

**Riesgo mitigado:** data loss.

### Restore test (~30 min primera vez)

Mensual (workflow automático el día 1) o manual:

```powershell
# Con DATABASE_URL de Railway (recomendado):
npx @railway/cli run --service dakinis-internal-api -- node scripts/restore-postgres-test.mjs

# O desde un .sql.gz ya generado:
.\scripts\restore-postgres-test.ps1 -BackupFile path\to\backup.sql.gz
```

**Riesgo mitigado:** backup corruption / falsa sensación de seguridad.  
**Último PASS:** 22 jul 2026 — dump session-mode Supabase → restore efímero `pgvector/pgvector:pg17` → 79 tablas `public`, 21 schemas (anotado en STATUS).

### Auditoría de permisos admin (~30 min/trimestre)

- [ ] GitHub org: owners, teams, deploy keys, apps instaladas
- [ ] Railway: quién puede ver variables
- [ ] Supabase: miembros del proyecto
- [ ] Stripe: team members + restricted keys
- [ ] Cloudflare: account members
- [ ] Eliminar accesos de ex-colaboradores **el mismo día**

**Riesgo mitigado:** privilege sprawl.

### DR básico (procedimiento)

Probar 1×/año o tras cambio mayor de infra:

| Escenario | Acción |
|-----------|--------|
| Gateway caído | Redeploy Railway gateway; DNS Cloudflare intacto |
| DB corrupta | Restore a staging / contenedor efímero (`restore-postgres-test.ps1`); validar schemas; plan de cutover |
| Filtración `INTERNAL_SERVICE_KEY` | Rotación inmediata + revisar logs Gateway/Internal |
| Cuenta admin comprometida | Revocar sesión MFA, rotar secretos de esa consola, auditar últimos 7 días |

**Riesgo mitigado:** RTO/RPO indefinidos.

---

## P1 — Antes del primer cliente de pago

### Cloudflare WAF (~30 min)

Zona `dakinissystems.com` (y subdominios API) — **harden pass 23 jul 2026:**

- [x] DNS revisado (Landing · Core · API · AI · Finance · Hub · Tabletop · Knowledge) · casi todos detrás de proxy CF
- [x] SSL/TLS → **Full (Strict)**
- [x] WAF Managed Rules · Browser Integrity Check · HTTP/Network/SSL DDoS · Automatic Security Level · Challenge Passage
- [x] Revisión Bot Protection / Hotlink / Email Obfuscation / Replace insecure JS / Asset Discovery
- [x] Rate limiting custom **Auth**: `URI Path starts with /auth/` · 20 req / IP / 10s · Block 10 min
- [x] Segunda regla RL en `/api/` — script `scripts/configure-cloudflare-api-rate-limit.mjs` (o Dashboard; plan-dependent)
- [x] Response Headers en edge (refuerzo; Gateway también las envía)

Baseline vía API (security_level + browser_check) si tienes token:

```powershell
$env:CLOUDFLARE_API_TOKEN = "<Zone WAF Write>"
node scripts/configure-cloudflare-waf.mjs
```

Dashboard: https://dash.cloudflare.com/?to=/:account/:zone/security/waf

**Riesgo mitigado:** OWASP Top 10 / bots / escaneos / brute force auth.

### Redeploy Gateway (headers + rate limits)

Código en repo · **redeploy Gateway SUCCESS 23 jul 2026** (rate zones `api_limit` / `public_limit` / `bff_limit` / …).

**Riesgo mitigado:** clickjacking, MIME sniff, abuso de API.

### Monitorización (~1 h)

Mínimo viable **sin SIEM** (SIEM = P4):

- [x] Probes GitHub Actions cada 15 min — `.github/workflows/uptime-probes.yml`
- [ ] Cloudflare Analytics / Security Events (picos 5xx, challenges)
- [ ] Railway Metrics + logs Gateway (`rt=`, `status`)
- [ ] Uptime externo: ver [`UPTIME-EXTERNAL.md`](./UPTIME-EXTERNAL.md) (UptimeRobot / CF / Better Stack)
- [ ] Alertas Slack/email si uptime &lt; 99% o error rate sube

Endpoints cubiertos por el workflow: Gateway `/health`, Auth, Core, Billing, Internal, SA, AkoeNet.

**Riesgo mitigado:** blind ops.

### Rotación periódica de secretos (~1–2 h/ciclo)

Cadencia: **90 días** (críticos: 30–60).

| Secreto | Dónde rota | Notas |
|---------|------------|--------|
| `DAKINIS_INTERNAL_SERVICE_KEY` / `HUB_INTERNAL_SERVICE_KEY` | Railway (servicios que lo compartan) | Dual-key: poner nueva en `…_KEY` y antigua en `…_KEY_PREVIOUS` |
| `STRIPE_WEBHOOK_SECRET` | Stripe + Railway billing | Tras regenerar endpoint |
| JWT / auth secrets | dakinis-auth | Invalidará sesiones |
| `BACKUP_DATABASE_URL` | GitHub Actions secrets | Tras rotar password DB |
| Supabase service role | Supabase + Railway | Impacto alto; planificar |

Procedimiento (S2S con dual-key — **soportado en código** Internal / Billing / Knowledge):

1. Generar valor nuevo (`openssl rand -hex 32` / password manager).
2. Railway: `DAKINIS_INTERNAL_SERVICE_KEY=<nuevo>` y `DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS=<antiguo>` (mismo en Hub si aplica).
3. Redeploy servicios que emiten o verifican la clave.
4. Tras verificar smokes: borrar `…_PREVIOUS` y redeploy.
5. Anotar fecha en STATUS.

**Riesgo mitigado:** secret leak prolongado.

### GitHub security por repo (sin GHAS) — 23 jul 2026

**Conclusión org:** GitHub muestra *“This organization does not have GitHub Advanced Security”* → *“Private repositories will only have free features enabled.”*

**No disponible en repos privados (requiere GHAS / Secret Protection de pago):**
- ❌ Secret Scanning (alertas de secretos propios)
- ❌ Push Protection basada en Secret Scanning
- ❌ Security configurations centralizadas de AdvSec de pago
- ❌ AI Secret Scanning / validación avanzada de secretos

**Sí disponible (gratis) y en uso:**
- ✅ Dependency Graph · Dependabot alerts / security updates / version updates · Malware alerts
- ✅ CodeQL **Default Setup** (donde se activó; no implica licencia GHAS completa)
- ✅ Private Vulnerability Reporting (según repo)
- ✅ Política local: no `.env` en git · `.gitignore` · secrets en GitHub Actions / Railway · rotación si hay sospecha · review en PRs

**Org — Global settings revisados:** Dependabot rules (1) · runner standard · CodeQL extended / Autofix / AI findings (preview) · Secret scanning + Push protection aparecen en la UI org pero **no aplican a privados sin GHAS**.

#### Checklist Dependabot / CodeQL (capa gratis)

| # | Repositorio | Dependabot / Dep graph | CodeQL default | Notas |
|---|-------------|------------------------|----------------|-------|
| 1 | [`dakinis-core`](https://github.com/dakinissystems/dakinis-core) | ✅ | ✅ | revisado 23 jul |
| 2 | [`dakinis-systems`](https://github.com/dakinissystems/dakinis-systems) | ✅ | ✅ | incl. gateway + `packages/` shared |
| 3 | [`dakinis-auth`](https://github.com/dakinissystems/dakinis-auth) | ✅ | 🟡 | AdvSec gratis; sin Secret Scanning (plan) |
| 4 | [`dakinis-hub`](https://github.com/dakinissystems/dakinis-hub) | ⬜ | ⬜ | pendiente |
| 5 | [`dakinis-ai`](https://github.com/dakinissystems/dakinis-ai) | ✅ | 🟡 | |
| 6 | [`dakinis-billing`](https://github.com/dakinissystems/dakinis-billing) | ✅ | 🟡 | |
| 7 | [`dakinis-internal-api`](https://github.com/dakinissystems/dakinis-internal-api) | ✅ | 🟡 | |
| 8 | [`dakinis-notifications`](https://github.com/dakinissystems/dakinis-notifications) | ✅ | 🟡 | |
| 9 | [`dakinis-search`](https://github.com/dakinissystems/dakinis-search) | ⬜ | ⬜ | pendiente |
| 10 | [`dakinis-knowledge`](https://github.com/dakinissystems/dakinis-knowledge) | ✅ | 🟡 | |
| 11 | [`dakinis-landing`](https://github.com/dakinissystems/dakinis-landing) | ✅ | 🟡 | |
| 12 | [`lifeflow`](https://github.com/dakinissystems/lifeflow) | ✅ | 🟡 | |
| 13 | [`dakinis-streamautomator`](https://github.com/dakinissystems/dakinis-streamautomator) | ✅ | 🟡 | sin Secret Scanning (plan) |
| 14 | [`akoenet-backend`](https://github.com/dakinissystems/akoenet-backend) | ✅ | ✅ | |
| 15 | [`akoenet-client`](https://github.com/dakinissystems/akoenet-client) | ✅ | ✅ | |
| 16 | [`dakinis-tabletop`](https://github.com/dakinissystems/dakinis-tabletop) | ✅ | 🟡 | |

**Sin repo propio:** Gateway + shared packages → cubiertos por `dakinis-systems`.

**Secret Scanning GitHub (privados):** ⏸ N/A en todo el plan actual — no es un olvido de configuración.

**Siguiente (alternativa sin GHAS — recomendado):**
1. ✅ **Gitleaks en Actions** — workflow canónico en `dakinis-systems` (CLI, sin licencia org de gitleaks-action). Sync: `node scripts/sync-gitleaks-workflow.mjs`. **Desplegado:** systems · core · auth · streamautomator · akoenet×2 · billing · internal · hub (gateway/shared vía systems).
2. ✅ **Reusable** — `.github/workflows/gitleaks-reusable.yml` · callers: `uses: dakinissystems/dakinis-systems/.github/workflows/gitleaks-reusable.yml@main` (tras habilitar Actions access entre repos privados de la org).
3. ✅ **Local** — `winget install Gitleaks.Gitleaks` · `gitleaks detect` / `gitleaks git` · pre-commit: `.pre-commit-config.yaml` → `pip install pre-commit && pre-commit install`.
4. Completar Dependabot/CodeQL en **hub** · **search**.
5. Plantilla para repos restantes: [`docs/templates/gitleaks.yml`](./templates/gitleaks.yml).
6. No comprar GHAS hasta escala / compliance lo justifique.

**Riesgo mitigado (capa actual):** CVEs en deps · secrets vía Gitleaks CI + disciplina · no Secret Scanning nativo GH.

### Gitleaks local (Windows)

```powershell
# Gitleaks (winget a menudo no está en PATH de Cursor):
$dir = "$env:LOCALAPPDATA\gitleaks"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$ver = "8.24.2"
curl.exe -sSL -o "$env:TEMP\gitleaks.zip" "https://github.com/gitleaks/gitleaks/releases/download/v$ver/gitleaks_${ver}_windows_x64.zip"
Expand-Archive "$env:TEMP\gitleaks.zip" $dir -Force
& "$dir\gitleaks.exe" detect --config .gitleaks.toml

# pre-commit (pip --user deja Scripts fuera del PATH):
python -m pip install --user pre-commit
python -m pre_commit install
```

Opcional PATH de usuario: `%LOCALAPPDATA%\gitleaks` y `%APPDATA%\Python\Python313\Scripts` → reinicia la terminal.

Org Actions (reusable entre repos privados): Settings → Actions → General → **Workflow permissions / Access** → permitir workflows de `dakinis-systems`. Luego un caller puede usar:

```yaml
jobs:
  scan:
    uses: dakinissystems/dakinis-systems/.github/workflows/gitleaks-reusable.yml@main
```

Hoy cada repo lleva copia autocontenida (más fiable sin GITLEAKS_LICENSE de gitleaks-action).

---

## P2 — Antes de ~20 clientes

### Auth fuerte entre microservicios (JWT) — ~1–2 semanas

**Hoy:** Bearer estático compartido + **fail-closed en prod** + **dual-key** (`DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS`). Helper en `packages/shared-auth/src/service-auth.js`.  
**Siguiente (aún no):** JWT de servicio con `iss`/`aud`/`scope`/`exp`.

```
Caller → JWT corto (iss, aud, scope, exp)
       → cada servicio verifica firma + audience
```

Pasos restantes:

1. Emitir JWT de servicio desde Internal API o Auth (`exp` 5–15 min).
2. Validar en middleware compartido (`packages/shared-auth`).
3. Dual-accept (clave estática **o** JWT) 1–2 sprints.
4. Retirar clave estática.

**Riesgo mitigado:** lateral movement / clave eterna.  
**No hacer aún:** mTLS (ver [Retrasar](#retrasar-p4--cuando-escale)).

### Auditoría central — ~1–2 semanas

**Parcial:** `meta.audit_logs` + `meta.log_audit` en invites, suspend/activate workspace, feature flags; lectura `GET /admin/v1/audit`.  
**Pendiente:** cubrir más mutaciones (billing, RBAC, AI), before/after uniforme, IP/`request_id` en metadata, UI Hub.

**Riesgo mitigado:** incident response ciego.  
**Prerequisito de Guardian.**

### RBAC granular — ~1–2 sprints

**Parcial:** Auth emite `permissions[]` por rol; refresh **ya no** los vacía.  
**Pendiente:** permisos finos (`tenant.billing.read`, …) y deny-by-default en Internal/Billing/productos.

**Riesgo mitigado:** over-privilege en tokens robados.

### Sesiones — ✅ en Auth

Access token default **15m** (`JWT_ACCESS_TTL`) · refresh rotatorio con detección de reuse · `revokeAllUserRefreshTokens`.

**Riesgo mitigado:** token theft de larga duración.

### Límites por tenant — 🟡 parcial

Internal API: rate limit por path tier + cap global por tenant (`INTERNAL_RATE_LIMIT_TENANT_PER_MIN`, default 600/min) usando `tenantId` query o headers `X-Tenant-Id` / `X-Business-Id`. Admin mutations (suspend/activate/flags) también limitadas.  
**Pendiente:** mismos caps en AI prompts y Billing.

**Riesgo mitigado:** noisy neighbor / abuso de un solo tenant.

---

## P3 — Antes de ~100 clientes

### Guardian (detección de comportamiento anómalo)

**No empezar Guardian hasta tener prerequisitos.** Es un sistema de detección, no un middleware suelto.

| Prerequisito | Estado objetivo |
|--------------|-----------------|
| Audit central (P2) | ✅ escribiendo eventos |
| Redis | ✅ disponible en platform |
| Métricas / logs Gateway | ✅ `rt=`, status, tenant cuando exista |
| Telemetría por tenant (límites P2) | ✅ contadores usable |
| Canal de alertas (P1 monitorización) | ✅ Slack/email u equivalente |

Ejemplos de señales (cuando exista):

- Login geográficamente imposible en minutos
- Ráfaga de facturas / prompts IA
- Una IP golpeando muchos tenants

**Riesgo mitigado:** abuse / fraud / account takeover a escala.  
**Esfuerzo:** ~1 mes **después** de los prereqs.

### Sandboxing IA

Controlar prompt injection, exfiltración, tool-calling solo con datos del tenant; el modelo no decide libremente qué ejecutar.

### Supply chain avanzado

Trivy en build Docker; opcional firma de imágenes. Dependabot + audit ya cubren el mínimo (P1).

---

## Retrasar (P4 — cuando escale)

No invertir aquí mientras Railway tenga red privada, JWT internos (P2) y secretos en Railway/GitHub.

| Tecnología | Por qué retrasar | Cuándo reconsiderar |
|------------|------------------|---------------------|
| **mTLS** | Alto esfuerzo; beneficio marginal vs JWT + red privada Railway | Varios equipos, requisitos compliance, o red no confiable |
| **Vault** | Railway gestiona secretos bien a esta escala | Decenas de servicios, varios equipos, cientos de secretos |
| **SIEM** | Otra plataforma que mantener | Muchos clientes, varios admins, volumen de logs alto |
| Zero Trust / bastion / IDS | Overkill operativo | Compliance o tamaño de org |

---

## Security Review — nueva funcionalidad

Checklist corta antes de merge de APIs o features que toquen datos **Confidencial** / **Crítico**:

**Nueva API / endpoint**

- [ ] Auth (quién puede llamar)
- [ ] Rate limit (zona nginx o app)
- [ ] Audit (acción sensible → evento)
- [ ] RBAC / scopes (mínimo privilegio)
- [ ] Input validation
- [ ] Output validation (no filtrar campos internos)
- [ ] Logging (sin secretos ni PII innecesaria)
- [ ] Tests (al menos happy path + 401/403)

**Nueva tabla / migración**

- [ ] RLS / deny anon-authenticated si aplica
- [ ] Clasificación de datos (¿Confidencial? ¿Crítico?)
- [ ] Sin secretos en SQL ni seeds de prod

**Nuevo secreto / integración**

- [ ] Solo en Railway/GitHub Secrets
- [ ] Nombre documentado en `railway.env.example` **sin valor**
- [ ] Plan de rotación (entrada en tabla P1)

---

## Documentación y exposición

- Mantener docs de arquitectura en repos **privados**.
- No versionar `.env` reales; revisar `*.env.example` sin valores live.
- Si algún día hay docs «públicas»: omitir nombres internos Railway, puertos, rutas `/internal`, nombres de env, diagramas de topología.
- La seguridad **no** se basa en que `/internal/events` sea desconocido: un atacante con tiempo descubre casi toda la superficie. Diseñar controles como si el mapa ya fuera público.

---

## Cómo usar este roadmap

1. **Hecho (consola 23 jul):** MFA · Cloudflare Full Strict + WAF + Auth RL · Dependabot/CodeQL (capa gratis; **sin GHAS**) · DR/backups · Gateway headers + RL.  
2. **Siguiente (alta):** Gitleaks desplegado en repos clave · ampliar a billing/internal/… vía `docs/templates/gitleaks.yml` · RL Cloudflare `/api/` · uptime externo.  
3. **Media:** auditoría permisos admin (trimestral) · calendario rotación secretos · Dependabot en hub/search.  
4. **Cliente fijo:** Heladería Copérnico (pro free) — ✅ Hub + Core · pendiente invite staff + demo reunión.  
5. **Antes de cobrar el primer euro:** Billing E2E + uptime externo.  
6. **Con tracción (~20 clientes):** P2 restante (JWT internos, audit completo, RBAC fino) · reevaluar GHAS si compliance lo exige.  
7. **Con escala (~100):** P3 (Guardian solo con prereqs).  
8. **No abrir tickets P4** «por si acaso».

### Consola hardening pass (23 jul 2026)

| Área | Estado |
|------|--------|
| MFA | ✅ GH · Railway · Supabase · Stripe |
| Cloudflare | ✅ DNS · Full Strict · WAF · Auth RL (~95%; falta RL `/api/`) |
| GitHub (plan gratis) | ✅ Dependabot · Dep graph · CodeQL default · **sin GHAS** → Secret Scanning ⏸ |
| Railway / Supabase / Stripe | ✅ |
| Backups / DR | ✅ |
| Gateway | ✅ headers · rate limit · JWT + refresh |

### Deploy prod (20–23 jul 2026)

| Servicio | Estado |
|----------|--------|
| Gateway | ✅ cabeceras HSTS / XFO / nosniff · rate limits |
| Cloudflare edge | ✅ Full Strict · WAF · Auth RL `/auth/` |
| Internal API | ✅ fail-closed (401 sin token en `/admin`) |
| Billing | ✅ health OK |
| Auth | ✅ health OK · refresh permissions |
| Knowledge | ✅ health OK |

**Siguiente (consola/código):** Ampliar Gitleaks a billing/hub/… · RL `/api/` · uptime externo · auditoría permisos.  
Backups + restore test: ✅ (secret · run #61 · PASS 22 jul).

Actualizar KPI backup/restore en [`STATUS.md`](./STATUS.md) al cerrar cada ítem.
