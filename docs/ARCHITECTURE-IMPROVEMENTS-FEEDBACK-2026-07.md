# Análisis de código y mejoras — Dakinis Systems (julio 2026, feedback consolidado)

> **Tipo:** ADR de evolución arquitectónica (no backlog ciego)  
> **Fecha:** 16 jul 2026 · **Revisión:** v2.1 (tracking post-implementación A/B + quick wins)  
> **Entrada:** análisis arquitecto + código Fase 2 + revisión crítica del propio documento  
> **Estado real:** Fase A ✅ · Fase B ✅ · Fase C parcial (SM invite/director/run + outbox consumer) · QueryMap + rate-limit granular ✅ · billing E2E **2ª prioridad** · nodos/OTel **diferidos**  
> **Relacionado:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`STATUS.md`](./STATUS.md) · [`DAKINIS-SISTEMA-COMPLETO-TEMP.md`](./DAKINIS-SISTEMA-COMPLETO-TEMP.md)

**Valoración del documento como propuesta de evolución:** ~9.8/10. El salto ya no es “añadir funcionalidades”, sino **reducir acoplamiento**. Riesgo principal: que SDK y buses se conviertan en God Objects — cada módulo pequeño, una responsabilidad, componible.

---

## 1. Feedback vs realidad (con tracking)

| Dimensión | Feedback | Realidad 16 jul | Delta / siguiente paso | Esfuerzo | Owner |
|-----------|----------|-----------------|------------------------|----------|-------|
| Foundation SDK / buses | Modular, no monolito | **`@dakinis/sdk-*` + QueryMap + middleware** | Adopción gradual en productos (menos `fetch` directo) | 1–2 sem | Platform |
| Hub Mi día / timeline | live | `stub=false` + **cache tags** + outbox→timeline | Piloto invite real en demo | — | Internal |
| Invite accept | hardening | **SM + FOR UPDATE + policies + create outbox** | Demo comercial end-to-end | ~1h ops | Internal |
| Automation runs | observabilidad | **049 + UI + AutomationRun SM** | Logs stream UI; **nodos diferidos** | ~4h | SA |
| Domain layer | faltante | **`@dakinis/domain` live** (invite/director/run/rule) | Más facades SA/Core | continuo | Platform |
| QueryMap / rate limit | quick wins | **Done** (`36214b9` / `dfc8870`) | Redeploy Gateway edge | ops | Gateway |
| Billing E2E | alto negocio | 2ª prioridad explícita | Cuando haya cliente | ~4h | Billing |
| OTel | deseable | Sentry cubre hoy | **Diferido** hasta escala | ~1 sem | Platform |
| Automation nodes | futuro | IF/THEN + Run SM OK | Solo si loops/branches/multi-trigger | 2+ sem | SA |

**Conclusión:** Fases A/B y quick wins **cerrados en código**. El apalancamiento restante es adopción del SDK en productos, piloto invite, y (cuando toque) OTel / nodes / billing E2E — no más scaffolding de runtime.

---

## 2. Qué mantener, cambiar, eliminar y añadir

### 2.1 Mantener (decisiones maduras)

- Enfoque **incremental** — no rehacer auth → API → BD → frontend de golpe.
- No separar Internal en microservicios el mes 1.
- No bloquear piloto comercial.
- No reescribir Sequelize antes de facades de dominio.
- **Domain Layer** como pieza central.
- **PlatformContext** (`saveLayout(ctx)` en lugar de 6 parámetros sueltos).
- **DomainEvent** enriquecido (`aggregateId`, `traceId`, `workspaceId`, …).

### 2.2 Cambiar respecto a v1 del documento

| Antes (v1) | Ahora (v2) |
|------------|------------|
| Un SDK gigante con 15 módulos inline | **SDK modular** (`@dakinis/sdk-auth`, `sdk-workspace`, …) + `@dakinis/sdk` reexporta |
| QueryBus con cache/invalidate/prefetch/stream | QueryBus solo `execute()`; capacidades vía **decoradores** (`CachedQuery`, `StreamQuery`, …) |
| CommandBus con pipeline fijo en el bus | **Middleware chain** (`Validation → Permissions → Audit → Handler`) |
| Event Consumer como superficie separada | **Módulo** dentro de Internal API (mismo proceso) |
| BackgroundTask capa gruesa | API mínima: `enqueue()` / `schedule()` / `cancel()` sobre BullMQ |
| OTel en Fase 2 | **Fase C** — Sentry basta de momento |
| Automation nodes en roadmap cercano | **Diferido** hasta que IF/THEN no alcance |

### 2.3 Eliminar / no hacer aún

- **Event Consumer** como servicio o capa desplegable aparte.
- **OpenTelemetry** end-to-end antes de clientes reales y varios equipos.
- **Automation node engine** mientras no haya loops, branches o múltiples triggers en producción.
- Canvas n8n visual antes de logs estructurados + SM de runs.

### 2.4 Añadir (huecos detectados en v2) — estado

| Pieza | Propósito | Estado 16 jul |
|-------|-----------|---------------|
| **Policy Engine** | `canAcceptInvite`, reglas de negocio | ✅ invite; ampliar otros agregados |
| **Versionado de dominio** | Eventos `v1` / `v2` | ✅ `invite.*.v1` + outbox map |
| **Value Objects** | `WorkspaceId`, `Email`, … | ✅ en `@dakinis/domain` |
| **DTO Generator** | Una fuente → tipos/SDK/OpenAPI | **v1** (`scripts/generate-dto.mjs`) |
| **Tests de dominio** | Cobertura lógica pura | ✅ invite/director/automation tests |
| **`platform.metrics()`** | Latencia, errores, cache | ✅ `@dakinis/sdk-metrics` |
| **QueryMap tipado** | Inferencia params/response | ✅ `query-map.js` + `.d.ts` |
| **Rate limit granular** | public/bff/admin/events | ✅ Gateway zones + Internal tiers |

---

## 3. Mapa de destino (v2)

```mermaid
flowchart TB
  subgraph Products["Productos"]
    Hub
    SA["StreamAutomator"]
    AN["AkoeNet"]
    LF["LifeFlow"]
    Core
  end

  subgraph SDK["@dakinis/sdk (facade)"]
    direction TB
    SDKAuth["@dakinis/sdk-auth"]
    SDKWs["@dakinis/sdk-workspace"]
    SDKBill["@dakinis/sdk-billing"]
    SDKEv["@dakinis/sdk-events"]
    SDKAI["@dakinis/sdk-ai"]
    SDKStore["@dakinis/sdk-storage"]
  end

  subgraph Domain["@dakinis/domain"]
    Agg["Aggregates"]
    VO["Value Objects"]
    Pol["Policies"]
    SM["State Machines"]
    DE["DomainEvent v1/v2"]
  end

  subgraph Runtime["Platform runtime"]
    QB["QueryBus.execute"]
    QD["Decorators: Cached / Stream / Prefetch"]
    CB["CommandBus + Middleware[]"]
    CTX["PlatformContext"]
    Cache["CacheService + tags"]
    BG["background.enqueue"]
    Outbox
  end

  subgraph Internal["Internal API (un proceso)"]
    BFF
    Orch["Orchestrator module"]
    ECMod["Event consumer module"]
    GWnote["Gateway = dakinis-gateway repo"]
  end

  Products --> SDK
  SDK --> Domain
  SDK --> Runtime
  Runtime --> Internal
  Internal --> DB[(Supabase / Redis / Workers)]
```

---

## 4. Cambios por capa (detalle)

### 4.1 SDK modular — evitar God Object

```mermaid
flowchart LR
  App["Producto"] --> Facade["@dakinis/sdk"]
  Facade --> Auth["sdk-auth"]
  Facade --> Ws["sdk-workspace"]
  Facade --> Bill["sdk-billing"]
  Facade --> Ev["sdk-events"]
  Facade --> AI["sdk-ai"]
  Facade --> Store["sdk-storage"]
  Facade --> Metrics["sdk-metrics"]
```

- Cada paquete evoluciona y versiona solo.
- `createDakinisPlatform(config)` construye `PlatformContext` y expone módulos con **lazy getters**.
- Ningún producto llama REST directo al Gateway/Internal.
- **Events:** `on` / `once` / `off` / `emit` (+ query histórica); transporte WS/Redis detrás del módulo.
- **Métricas:** `platform.metrics()` — calls, errors, latency, retries, cache hits.

```typescript
// Patrón facade (resumen)
export function createDakinisPlatform(config: PlatformConfig) {
  const ctx = buildPlatformContext(config);
  return {
    get auth() { return getAuthModule(ctx); },
    get workspace() { return getWorkspaceModule(ctx); },
    get events() { return getEventsModule(ctx); },
    get metrics() { return getMetricsModule(ctx); },
    query: queryBus,
    command: commandBus,
  } as const;
}
```

---

### 4.2 `@dakinis/domain` — estructura y primer agregado

```text
packages/domain/
├── aggregates/       # Workspace, WorkspaceInvite, AutomationRule, DirectorSession, …
├── value-objects/    # Email, WorkspaceId, Money, InviteRole, …
├── domain-events/    # versionados: invite.accepted.v1
├── commands/
├── queries/
├── policies/           # canInviteMember, canPublishStream, …
├── state-machines/
├── exceptions/
└── index.ts            # barrel público; package.json "exports" estrictos
```

**Agregado piloto recomendado:** `WorkspaceInvite` (ya hay accept live en infra — extraer lógica a dominio).

```mermaid
stateDiagram-v2
  [*] --> Pending: create()
  Pending --> Opened: open()
  Opened --> Accepted: accept() + email match
  Pending --> Expired: expire / TTL
  Opened --> Expired: expire / TTL
  Accepted --> Activated: member active
  Activated --> [*]
  Expired --> [*]
```

Comportamiento en agregado (no en `if` del controller):

- `WorkspaceInvite.create()` → `InviteCreated.v1`
- `open()` → `InviteOpened.v1`
- `accept(userId, email)` → valida SM + `InviteAccepted.v1`
- Repositorio en infra (`PostgresWorkspaceInviteRepository`) + outbox para eventos.

**Facades thin:** solo orquestan `repo.find → aggregate.method → repo.save → eventBus.publish`.

---

### 4.3 Policy Engine (además de permissions)

```mermaid
flowchart LR
  Handler --> CTX["PlatformContext"]
  CTX --> Perm["permissions[]"]
  CTX --> Pol["PolicyEngine"]
  Pol --> R1["canDeleteWorkspace(ctx)"]
  Pol --> R2["canPublishStream(ctx)"]
  Pol --> R3["canManageBilling(ctx)"]
```

Permisos = capacidad coarse (`workspace:invite`). Políticas = reglas de negocio compuestas (plan, rol, estado del agregado).

---

### 4.4 DomainEvent — contrato versionado

```mermaid
classDiagram
  class DomainEvent {
    +string type
    +string eventVersion
    +number schemaVersion
    +string aggregateId
    +string aggregateType
    +string workspaceId
    +string product
    +string origin
    +string actorId
    +string correlationId
    +string traceId
    +number retryCount
    +object payload
    +Date occurredAt
  }
```

Serialización robusta; preparado para event sourcing ligero opcional más adelante.

---

### 4.5 QueryBus y CommandBus — composición, no God Bus

**QueryBus** — una responsabilidad:

```mermaid
flowchart LR
  Q["Query"] --> Bus["queryBus.execute()"]
  Bus --> H["Handler"]
```

Decoradores / wrappers (no métodos en el bus):

```mermaid
flowchart LR
  Q --> Cached["CachedQuery"]
  Cached --> Stream["StreamQuery"]
  Stream --> Bus["execute"]
```

**CommandBus** — pipeline de middlewares:

```mermaid
flowchart TB
  Cmd["Command"] --> M1["ValidationMiddleware"]
  M1 --> M2["PermissionsMiddleware"]
  M2 --> M3["AuditMiddleware"]
  M3 --> M4["TelemetryMiddleware"]
  M4 --> H["Handler"]
  M4 -.->|opcional| M5["RetryMiddleware"]
```

Command state para ops largas (`pending → processing → completed|failed`) + `waitForCompletion` vía Redis/BullMQ — como **middleware o handler wrapper**, no lógica embebida en el bus.

---

### 4.6 PlatformContext (ampliado)

```mermaid
flowchart LR
  Req --> MW["createContextMiddleware"]
  MW --> CTX["PlatformContext"]
  CTX --> H["Handlers / Facades"]
```

| Campo | Uso |
|-------|-----|
| `workspace`, `user` | Identidad |
| `permissions`, `can()` | Autorización coarse |
| `policies` | Reglas de negocio |
| `locale`, `timezone` | i18n / fechas |
| `product` | Hub, SA, Core, … |
| `featureFlags` | Flags resueltos para el request |
| `requestId`, `traceId` | Correlación |
| `requestStart`, `clientVersion`, `device` | SLA, compat, analytics |
| `cache`, `logger`, `telemetry` | Servicios inyectados |

Uso objetivo: `saveLayout(ctx)` en lugar de firmas con 6+ parámetros primitivos.

---

### 4.7 Internal API — módulos, no microservicios

```mermaid
flowchart LR
  Client --> GW["dakinis-gateway"]
  GW --> Internal["dakinis-internal-api"]
  subgraph Internal
    BFF["bff/"]
    Orch["orchestrator/"]
    Events["events-consumer/"]
    Domains["workspace/ automation/ hub/"]
  end
  Internal --> DB[(Postgres / Redis)]
```

Gateway sigue en repo `dakinis-systems/gateway`. Event consumer = carpeta/módulo, **no** despliegue separado en Fase A–B.

---

### 4.8 Cache con tags

**Done** — Redis `sAdd`/`sMembers` + invalidación en timeline / invite accept.

```mermaid
sequenceDiagram
  participant T as TimelineWriter
  participant C as CacheService
  T->>C: invalidateTags(user:dashboard, user:timeline)
  Note over T,C: Tras INSERT hub.timeline / invite accept
```

---

### 4.9 Background jobs — API mínima

```typescript
// No nueva capa enorme — wrapper sobre BullMQ existente
background.enqueue(name, payload, opts?);
background.schedule(name, payload, runAt, opts?);
background.cancel(jobId);
```

Productos no importan BullMQ directamente.

---

### 4.10 Automation — IF/THEN ahora; nodos después

**Hoy (mantener):** reglas planas + `AutomationRuns` + logs estructurados + timeline.

**Disparador para nodos:** loops, branches, múltiples triggers, o builder visual que lo exija.

```mermaid
flowchart LR
  Trigger --> Condition
  Condition --> Action
  Condition -.->|futuro| Branch
  Branch -.-> Delay
  Branch -.-> Loop
```

---

### 4.11 DTO Generator y contratos

```mermaid
flowchart TB
  Source["contracts/*.json o Zod schemas"] --> Gen["codegen"]
  Gen --> FE["Frontend types"]
  Gen --> SDK["SDK clients"]
  Gen --> OAPI["OpenAPI"]
  Gen --> Val["Validators"]
  Gen --> Map["UserMapper / WorkspaceMapper / …"]
```

Evita `res.json(model)` sin mapping explícito en cada endpoint.

---

### 4.12 Observabilidad — fases

| Fase | Qué | Cuándo |
|------|-----|--------|
| Ahora | Sentry + `telemetry.track()` + logs estructurados | Ya |
| B | `platform.metrics()` en SDK | Con SDK modular |
| C | OpenTelemetry (`span`, `trace` compartido Hub→Worker) | Clientes + varios workers/equipos |

```mermaid
flowchart LR
  Hub -->|traceId en header| GW
  GW --> Internal
  Internal --> Worker
  Worker --> Stripe
  Worker --> Supabase
```

---

## 5. Mejoras tácticas (tabla priorizada)

| # | Iniciativa | Impacto | Esfuerzo | Depende de | Owner | Estado base |
|---|------------|---------|----------|------------|-------|-------------|
| 1 | QueryMap tipado (inferencia) | Alto | 2h | — | Platform | **Done** (`query-map.js` + `.d.ts`) |
| 2 | Cache tags + invalidación timeline | Alto | 3h | — | Internal | **Done** (Redis tags + timeline invalidate) |
| 3 | Invite SM + `FOR UPDATE` + policies | Alto | 3h | domain scaffold | Internal | **Done** (create+accept+outbox+timeline) |
| 4 | Rate limit granular (public/bff/admin/events) | Medio | 2h | — | Gateway | **Done** (nginx zones + Internal tiers) |
| 5 | **Scaffold `@dakinis/domain`** | Crítico | 5d | — | Platform | **Done** (`c35a014`) |
| 6 | PlatformContext middleware | Alto | 4h | — | Platform | **Done** Phase A |
| 7 | SDK modular + `events.subscribe` | Alto | 1w | domain events | Platform | **Done** (`72b094a` + Hub client) |
| 8 | CommandBus middleware pipeline | Alto | 3d | — | Internal | **Done** Phase A |
| 9 | DTO Generator (primera pasada) | Medio | 3d | contratos | Platform | **Done v1** (`scripts/generate-dto.mjs`) |
| 10 | Smokes modulares (Jest + helpers) | Medio | 4h | — | DX | PS1 (Jest diferido) |
| 11 | Automation logs estructurados + UI stream | Medio | 4h | — | SA | Runs live + Run SM |
| 12 | SDK metrics | Medio | 2d | SDK modular | Platform | **Done** (`@dakinis/sdk-metrics`) |
| 13 | Automation node engine | Alto | 2w | domain | SA | **Diferido** |
| 14 | OTel end-to-end | Medio | 1w | escala | Platform | **Diferido** |
| 15 | Billing E2E | Alto negocio | 4h | cliente | Billing | 2ª prioridad |
| 16 | DirectorSession SM en SA | Alto | 4h | domain | SA | **Done** (`8a7ea33`) |
| 17 | Domain events → outbox + consumer | Alto | 1d | domain | Platform | **Done** (invite + director) |

---

## 6. Roadmap por fases (orden acordado v2)

```mermaid
gantt
  title Evolución arquitectónica v2
  dateFormat  YYYY-MM-DD
  axisFormat  %d/%m

  section Fase A Domain
  Value Objects + policies      :a1, 2026-07-17, 4d
  Scaffold @dakinis/domain       :a2, 2026-07-17, 5d
  WorkspaceInvite aggregate      :a3, after a2, 3d
  PlatformContext middleware     :a4, 2026-07-20, 4d
  Facades thin (invite/auto)     :a5, after a3, 5d

  section Fase B Platform
  SDK paquetes modulares         :b1, 2026-07-28, 7d
  QueryBus + decoradores         :b2, after b1, 3d
  CommandBus middleware          :b3, after b1, 4d
  Cache tags                     :b4, 2026-07-28, 3d
  DTO Generator v1               :b5, after b2, 5d

  section Fase C Escala
  State Machines (invite/director/run) :c1, 2026-08-12, 7d
  Domain events v1/v2 unificados :c2, after c1, 4d
  Automation nodes               :c3, 2026-09-01, 14d
  OpenTelemetry                  :c4, 2026-09-15, 7d
```

### Prioridad de negocio (actualizado 16 jul)

1. **Piloto** — invite real end-to-end + demo Hub→Core *(código listo; falta sesión demo)*  
2. **Fase A** — domain + context + facades → **✅ Done**  
3. **Fase B** — SDK modular + buses + cache tags + QueryMap + rate-limit → **✅ Done**  
4. **Fase C** — SM invite/director/run + outbox consumer → **✅ parcial**; nodos + OTel → **diferido**  
5. **Billing E2E** — cuando negocio reactive (2ª prioridad)  
6. **Adopción** — productos consumen `@dakinis/sdk` / QueryMap; menos HTTP ad-hoc

---

## 7. Organización por dominio (no por capa técnica)

```mermaid
flowchart TB
  subgraph streamautomator["apps/streamautomator"]
    director["director/"]
    automation["automation/"]
    analytics["analytics/"]
  end
  subgraph internal["internal/src"]
    hubdom["hub/"]
    wsdom["workspace/"]
    autodom["automation/"]
  end
  director --> slice["commands · queries · events · validation · policies"]
  automation --> slice
  wsdom --> slice
```

Eje: **agregado**, no `controllers / services / routes` como carpeta raíz.

---

## 8. Criterios de aceptación

| Iniciativa | Done when | Estado |
|------------|-----------|--------|
| `@dakinis/domain` | Invite + AutomationRule con tests; APIs solo adaptan | ✅ invite/director/run/rule |
| Value Objects | No `string` suelto en dominio nuevo | ✅ |
| Policy Engine | `canAcceptInvite(ctx)` en domain | ✅ invite |
| SDK modular | Producto importa `@dakinis/sdk` | ✅ paquetes; adopción productos en curso |
| QueryBus | Solo `execute`; cache vía `CachedQuery` | ✅ + QueryMap |
| CommandBus | Middleware sin editar el bus | ✅ |
| Cache tags | Write timeline → dashboard no stale | ✅ |
| Invite SM | Estados en admin; expired no aceptable | ✅ |
| Rate limit granular | Zones public/bff/admin/events | ✅ código; redeploy GW |
| Automation nodes | Solo cuando exista branch en prod | Diferido |
| OTel | Trace Hub→worker | Diferido |

---

## 9. Anti-objetivos

- No God Object SDK ni God Bus (módulos y middlewares pequeños).
- No reescribir Sequelize completo antes de facades.
- No microservicios Internal el mes 1.
- No Event Consumer como servicio separado (aún).
- No canvas n8n antes de logs + SM.
- No OTel antes de escala real (Sentry suficiente hoy).
- No automation nodes mientras IF/THEN crezca bien.
- No billing E2E como P0 sin cliente.
- No bloquear piloto por Module Federation u OTel.

---

## 10. Resumen ejecutivo

**Hecho en código (16 jul 2026):**

| Bloque | Entregables |
|--------|-------------|
| **Fase A** | `@dakinis/domain`, PlatformContext, CommandBus middleware, CachedQuery, invite facade |
| **Fase B** | SDK modular (`sdk-*`), cache tags, DTO gen v1, QueryMap, rate-limit granular Gateway |
| **Fase C (parcial)** | Outbox `invite.*.v1` + consumer→timeline; DirectorSession + AutomationRun SM en SA; invite create dominio |
| **Producto** | Invite accept Hub live · automation runs UI · SSO 3/3 · Mi día + score 72 |

**Siguiente impacto (no scaffolding):**

1. Piloto invite real + demo Hub→Core  
2. Adopción SDK/QueryMap en productos (menos `fetch` ad-hoc)  
3. Billing E2E cuando negocio reactive  
4. OTel / automation nodes solo con demanda real  

El punto de inflexión entre “app grande” y “plataforma mantenible” ya tiene runtime: la lógica nueva debe vivir en dominio compartido, no repartirse en services que cada producto reinterpreta.

---

## Anexo A — Patrones de código (referencia breve)

### A.1 CacheService con tags (Redis)

```typescript
async set(key, value, ttlSeconds, tags = []) {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
  for (const tag of tags) await redis.sAdd(`cache:tag:${tag}`, key);
}
async invalidateTag(tag) {
  const keys = await redis.sMembers(`cache:tag:${tag}`);
  if (keys.length) await redis.del(...keys);
  await redis.del(`cache:tag:${tag}`);
}
```

### A.2 State machine ligera (invite)

```typescript
// packages/domain/src/shared/state-machine.ts — sin XState hasta Fase C si hace falta
transition(event): boolean  // false = transición inválida
can(event): boolean
```

### A.3 Events module (SDK)

```typescript
platform.events.on('invite.accepted.v1', handler);
platform.events.once('director.started.v1', handler);
platform.events.emit(domainEvent);
```

### A.4 Tests de dominio (prioridad máxima)

```typescript
// packages/domain/src/invite/__tests__/workspace-invite.spec.ts
it('rejects accept when email mismatch', () => { … });
it('expires pending invite after TTL', () => { … });
```

---

*Actualizado 16 jul 2026 tras cerrar filas §5 (1–8, 12, 16–17) y quick wins QueryMap/rate-limit. Próxima revisión: tras piloto invite real o adopción SDK en un segundo producto.*
