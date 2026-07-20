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
| MFA en consolas | P0 | Credential theft | ~15 min/cuenta | ⬜ consola |
| Backups diarios | P0 | Data loss | ~20 min (secret + 1 run) | 🟡 secret pendiente |
| Restore test | P0 | Backup corruption / DR ciego | ~30 min primera vez | ✅ script + workflow mensual |
| DR documentado | P0 | Tiempo de recuperación | ya en este doc | ✅ |
| Auditoría permisos admin (trimestral) | P0 | Privilege sprawl | ~30 min/trimestre | ⬜ consola |
| Cloudflare WAF | P1 | OWASP Top 10 / bots / escaneos | ~30 min | ⬜ consola |
| Cabeceras HTTP Gateway | P1 | Clickjacking, MIME sniff, HTTPS | ya en repo | ✅ código · redeploy edge |
| Rate limiting Gateway | P1 | Brute force / DoS ligero | ya en repo | ✅ código · redeploy edge |
| Monitorización uptime + errores | P1 | Blind ops | ~1 h | ⬜ consola |
| Rotación periódica secretos | P1 | Secret leak prolongado | ~1–2 h/ciclo | 🟡 dual-key en código · calendario consola |
| Dependabot + `npm audit` CI | P1 | Supply chain (CVEs conocidas) | ya en repo | ✅ |
| Secret scanning GitHub | P1 | Secrets en git | ~10 min org | ⬜ consola |
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
| Backups diarios (workflow) | P0 | 🟡 pendiente secret | `.github/workflows/backup-postgres.yml` |
| Prueba de restauración | P0 | ✅ script + workflow mensual | `scripts/restore-postgres-test.ps1` · `.github/workflows/restore-postgres-test.yml` |
| Dependabot | P1 | ✅ | `.github/dependabot.yml` |
| `npm audit` en CI | P1 | ✅ | `.github/workflows/ci.yml` |
| Rate limiting Gateway | P1 | ✅ código · redeploy edge | `gateway/nginx.conf` |
| Cabeceras HTTP Gateway | P1 | ✅ código · redeploy edge | `gateway/routes/security-headers.conf` |
| RLS Supabase (deny anon) | P1 | ✅ | migraciones `034`+ |
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

- [ ] GitHub (org + owners)
- [ ] Railway
- [ ] Supabase
- [ ] Stripe
- [ ] Cloudflare

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
.\scripts\restore-postgres-test.ps1 -BackupFile path\to\backup.sql.gz
```

**Riesgo mitigado:** backup corruption / falsa sensación de seguridad.  
Anotar «Último restore test» en STATUS.

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

Zona `dakinissystems.com` (y subdominios API):

- [ ] Security → WAF → **Managed rules** (Cloudflare Managed + OWASP) en *Block* o *Managed Challenge*
- [ ] Bot Fight Mode / Super Bot Fight (según plan)
- [ ] Rate limiting rules en `/auth/*` y rutas públicas sensibles (complementa nginx)
- [ ] Response Headers en edge: HSTS, `X-Content-Type-Options`, `X-Frame-Options` (refuerzo; el Gateway también las envía)

**Riesgo mitigado:** OWASP Top 10 / bots / escaneos automáticos.

### Redeploy Gateway (headers + rate limits)

Código ya en repo. Sin redeploy Railway del servicio Gateway, producción no se beneficia.

**Riesgo mitigado:** clickjacking, MIME sniff, abuso de API.

### Monitorización (~1 h)

Mínimo viable **sin SIEM** (SIEM = P4):

- [ ] Cloudflare Analytics / Security Events (picos 5xx, challenges)
- [ ] Railway Metrics + logs Gateway (`rt=`, `status`)
- [ ] Uptime: Better Stack / UptimeRobot / Cloudflare Health Checks → health de API, auth, core
- [ ] Alertas Slack/email si uptime &lt; 99% o error rate sube

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

### GitHub Secret scanning (~10 min)

En la org: Secret scanning + **push protection**. Complementa Dependabot.

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

1. **Esta semana:** cerrar filas P0 de la matriz (MFA, secret backup, 1 restore test).
2. **Antes de cobrar el primer euro:** P1 (WAF, redeploy Gateway **+ Internal/Billing/Auth**, uptime, rotación calendarizada con dual-key).
3. **Con tracción (~20 clientes):** P2 restante (JWT internos, audit completo, RBAC fino).
4. **Con escala (~100):** P3 (Guardian solo con prereqs).
5. **No abrir tickets P4** «por si acaso».

### Deploy pendiente tras este lote de código

| Servicio | Qué entra |
|----------|-----------|
| Gateway | Cabeceras seguridad (si aún no redeploy) |
| Internal API | Fail-closed, dual-key, audit flags, tenant RL |
| Billing | Fail-closed + dual-key; subscriptions siempre auth |
| Auth (`dakinis-auth`) | Refresh conserva `permissions[]` |
| Knowledge | Dual-key verify |

Actualizar la columna **Estado** de la matriz y los KPI de backup/restore en [`STATUS.md`](./STATUS.md) al cerrar cada ítem.
