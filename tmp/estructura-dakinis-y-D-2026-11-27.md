# Estructura Dakinis + inventario D:\ — 2026-11-27

> **Naturaleza:** inventario local + **arquitectura objetivo / gobierno** (puente).  
> **No** sustituye STATUS / SYSTEMS / OPERATIONS / SECURITY.  
> **No** es aún `DAKINIS-SYSTEMS-ARCHITECTURE.md` canónico — lo prepara.

| Canónico hoy | Rol en la transición |
|--------------|----------------------|
| [`docs/STATUS.md`](../docs/STATUS.md) | Go-live · scores |
| [`docs/SYSTEMS.md`](../docs/SYSTEMS.md) | Mapa actual |
| [`docs/OPERATIONS.md`](../docs/OPERATIONS.md) | URLs · smokes · deploy |
| [`docs/SECURITY.md`](../docs/SECURITY.md) | P0–P1 |
| [`docs/inventario-d.md`](../docs/inventario-d.md) | Inventario D:\ (11 nov) |
| Este archivo (`tmp/`) | Foto 27 nov + decisiones objetivo |

**Worktree:** `D:\dakinis-systems-wt-ops` · `feat/b11-commercial-smoke-daily`  
**Orquestación local:** `D:\dakinis-systems` · `docs/b5-pricing-catalog` @ `d91dd56b`  
**Org GitHub:** `dakinissystems` · **~26 repos** · **1 miembro** visible (People)

---

## Principio rector

> **Una plataforma. Varios productos. Una experiencia conectada.**  
> Ecosistema **federado** de productos SaaS — no monólito de módulos, no silos aislados.

> **¿Puede un restaurante real usar Dakinis 30 días y pagar sin que intervengas?**  
> Criterio que decide qué se desarrolla, mantiene o aparca.

| Concepto | Significado |
|----------|-------------|
| **Plataforma compartida** | Capacidades reutilizables por contrato (Auth, Billing, AI…) |
| **Producto independiente** | Dominio, datos, UI y ciclo de release propios |
| **Experiencia unificada** | Hub + SSO + DES: el usuario siente el mismo ecosistema |

**Principio de valor de plataforma:** cada producto debe poder generar valor solo; **desarrollar sobre Dakinis debe ser más sencillo** que construir un producto de cero.

| Score / foto | Valor | Nota |
|--------------|-------|------|
| Technical | ~90% | Falta fórmula (Local→CI→Staging→Prod verified) |
| Commercial | ~55% | Falta fórmula piloto/activación/retención/conversión |
| Piloto | Copérnico **gratis** | 0 clientes de pago · B6 ⏸ |
| Esfuerzo | One 60 · indep. 20 · juegos 15 · exp. 5 | Máx. 1–2 secundarios activos |

**Transición:** de “desarrollar proyectos” → **gobernar un ecosistema** (canónico · dependencias · desplegado · probado · valor).  
**No** reorg masiva de repos todavía → registro + arquitectura documental primero.

---

## 1. Dirección estratégica

### 1.1 Modelo objetivo (capas = responsabilidades, no cadena obligatoria)

```text
DAKINIS SYSTEMS — plataforma compartida + productos independientes

1. EXPERIENCE & ACCESS
   Landing · Hub · SSO · DES

2. SHARED PLATFORM
   Auth · Billing · Internal API · Notifications
   AI Gateway · Search · Knowledge · Shared SDK/DES

3. INDEPENDENT PRODUCTS
   Dakinis One · LifeFlow · StreamAutomator
   AkoeNet · Dakinis Chat · Tabletop

4. DEVICE & DESKTOP
   Dakinis OS · Desktop · Device Agent · Nexus Browser

5. INFRASTRUCTURE & ENGINEERING
   Cloudflare · Railway · Supabase · Redis · Docker
   GitHub Actions · Sentry · Engineering standards
   (contratos · SDK · DES · testing · seguridad · versionado · telemetría)
```

One consume Billing/Auth por API; LifeFlow puede usar el mismo Auth **sin** compartir tablas financieras con One.

### 1.2 Orden de inversión (conclusión)

1. **Dakinis One** — producto usable y contratable  
2. **Platform** — identidad, Billing, seguridad, contratos  
3. **Hub** — experiencia que conecta productos  
4. **Engineering** — gobierno de ~26 repos  
5. **Secundarios** — sin comprometer 1–4  

La plataforma **no crece sola**: la demanda de productos consumidores manda.

---

## 2. Organización GitHub — 26 repos (propuesta de gobierno)

Clasificación por nombres/descripciones públicas (**no** auditoría de código completa).

### A. Plataforma y compartidos

| Repo | Rol |
|------|-----|
| `dakinis-systems` | Orquestación · infra · docs · gateway · Docker |
| `dakinis-auth` | IdP / SSO |
| `dakinis-billing` | Suscripciones / Stripe |
| `dakinis-internal-api` | S2S / Hub facades |
| `dakinis-hub` | Experiencia / Mi día |
| `dakinis-search` | Búsqueda |
| `dakinis-ai` | AI gateway |
| `dakinis-knowledge` | Knowledge / RAG |
| `dakinis-notifications` | Entrega notificaciones |
| `dakinis-shared` | Paquetes DES / SDK |

### B. Productos comerciales

| Repo | Producto |
|------|----------|
| `dakinis-core` | **Dakinis One** |
| `lifeflow` | LifeFlow |
| `dakinis-streamautomator` | StreamAutomator |
| `akoenet-client` | AkoeNet FE |
| `akoenet-backend` | AkoeNet BE |
| `dakinis-chat` | Mensajería (ver §7 solapamiento) |

### C. Device / desktop

| Repo | Rol |
|------|-----|
| `dakinis-os` | Imagen OS (Kinoite/BlueBuild) |
| `dakinis-desktop` | Shell Tauri |
| `dakinis-device-agent` | IPC local |
| `NEXUS-Browser` | Navegador |

### D. Creativo / gaming

| Repo | Rol |
|------|-----|
| `dakinis-tabletop` | Tabletop |
| `mythos-regenesis` | MYTHOS |
| `DAKINIS-SETTLEMENT-DIRECTIVE` | 7DTD colony |
| `DAKINIS-ASHEN-PATH` | 7DTD class mod |

### E. Institucional

| Repo | Rol |
|------|-----|
| `.github` | Perfil org |
| `dakinis-landing` | Landing |

### Hallazgos

1. **Ya hay plataforma** — no hace falta inventar “Dakinis Platform” como repo nuevo.  
2. **26 repos / 1 persona** → política estricta active/paused/freeze (no borrar por defecto).  
3. **Solape potencial** Chat ↔ AkoeNet.  
4. **OS + Desktop + Agent** = familia con contratos/IPC comunes; Nexus satélite.  
5. **`dakinis-systems` = orquestador**, no vertedero de código de productos.

**Modelo:** Polyrepo + orquestación central.

---

## 3. `dakinis-systems` como composición

Objetivo (evolutivo; no mover todo el código ya):

```text
dakinis-systems/
├── architecture/          # o docs/architecture/
├── docs/{architecture,engineering,operations,products,security,governance}/
├── infrastructure/{cloudflare,gateway,docker,railway,monitoring}/
├── ecosystem/
│   ├── registry/          # YAML canónico
│   ├── manifests/
│   └── contracts/         # o link docs/contracts/
├── scripts/{inventory,validation,health,deployment}/
├── .github/workflows/
├── README.md
└── dakinis-systems.code-workspace
```

**No** debe contener copias independientes “fuente” de Core/Auth/… — debe **conocerlos, conectar, probar y coordinar versiones**.

### 3.1 Registry inicial (ejemplo — completar con auditoría)

```yaml
ecosystem:
  name: Dakinis Systems
  architecture: polyrepo
components:
  - id: dakinis-core
    type: product
    category: business
    repository: dakinissystems/dakinis-core
    deployment: railway
    status: active
    dependencies: [dakinis-auth, dakinis-billing, dakinis-shared]
  - id: dakinis-auth
    type: platform-service
    repository: dakinissystems/dakinis-auth
    status: active
  - id: dakinis-billing
    type: platform-service
    repository: dakinissystems/dakinis-billing
    status: active
  - id: dakinis-hub
    type: experience
    repository: dakinissystems/dakinis-hub
    status: active
  - id: dakinis-shared
    type: shared-packages
    repository: dakinissystems/dakinis-shared
    status: active
  # … completar los ~26
```

Informes derivados: repos · servicios · dependencias · deploys · madurez · drift.

### 3.2 Correspondencia GitHub ↔ local (registro, no renombrar aún)

| GitHub | Local tipico | Estado check 27 nov | Acción |
|--------|--------------|---------------------|--------|
| `dakinis-chat` | `apps/messenger` | remoto = `dakinis-chat` ✅ | Alias en registry |
| `NEXUS-Browser` | `apps/nexus-browser` | remoto = `NEXUS-Browser` ✅ | Normalizar ID |
| `dakinis-tabletop` | `apps/tabletop` | canónico | Confirmar |
| `DAKINIS-ASHEN-PATH` | `apps/ashen-path` | canónico | Confirmar |
| `DAKINIS-SETTLEMENT-DIRECTIVE` | `apps/settlement-directive` | — | Confirmar |
| `akoenet-client` / `akoenet-backend` | `apps/akoenet/{Client,Server}` | **apps sin `.git`** | Verificar vs checkouts / `D:\AkoNet` |
| `dakinis-shared` | `packages/` + `D:\dakinis-shared` | 3 árboles | SoT §3.3 |
| `dakinis-core` | `platform/core` | repo propio | — |
| `lifeflow` | `apps/lifeflow` | repo propio | — |

### 3.3 DES — precisión (preferencia actual)

Ante README público que nombra **`dakinis-shared`** como paquetes compartidos:

**Preferido (minimizar cambio):** `dakinis-shared` = **código canónico**, salvo auditoría que demuestre que `packages/` está más consolidado.

```text
dakinis-shared  →  Package Registry  →  Core / Hub / LifeFlow / …
```

- Una fuente · productos consumen **versiones publicadas**.  
- **Sin** sync bidireccional.  
- `platform/shared` y el otro árbol → archive o referencia tras **diff** de commits/paquetes.  
- Decisión final solo tras comparar los tres árboles.

*(Mejora ops: hasta el diff, tratar `packages/` del worktree activo como “working copy hacia shared” y documentar en cada PR de DES cuál es el push target.)*

---

## 4. Plataforma realmente compartida (límites)

### 4.1 Identidad unificada · permisos por producto

```text
Dakinis Auth (subject id · sesiones)
        ├── One: roles restaurante
        ├── LifeFlow: roles personales/org
        ├── AkoeNet: roles comunidad
        └── SA: roles workspace
```

Misma persona ≠ mismos permisos.  
**No** forzar Org→Venture→Location de One en LifeFlow.  
IDs de persona comunes + relaciones explícitas producto↔espacio.

### 4.2 Billing compartido · planes independientes

```text
Billing: catalog · subscriptions · Stripe · invoices · metering · entitlements
           → One / LifeFlow / SA / AkoeNet (planes distintos)
```

Tres checks en cada operación sensible:

1. ¿Autenticado?  
2. ¿Permiso del producto?  
3. ¿Entitlement de suscripción?

Billing **no** posee todos los permisos funcionales.

### 4.3 Search

Índices por dominio · filtros tenant · búsqueda global Hub **opcional y autorizada**.  
No una sola DB de búsqueda sin límites.

### 4.4 Notifications

Servicio central **entrega**; el dominio dueño del evento decide significado, destinatarios y preferencias.

### 4.5 Catálogo de servicio (dimensiones)

Responsabilidad · API/contrato · datos poseídos · tenancy · authn/authz · REST/eventos/colas · dependencias · fallos · observabilidad · escala · deploy/rollback.

---

## 5. Hub — núcleo de experiencia

No solo lanzador. Consola personal de trabajo y acceso.

| Módulo | Función |
|--------|---------|
| Mi día | Atención prioritaria |
| Workspace | Contexto org/producto |
| Apps | Lanzador |
| Actividad | Reciente |
| Inbox | Notificaciones |
| Agenda | Eventos/tareas |
| Widgets | Por producto (API + permisos + degradación) |
| Search | Global autorizada |
| Assistant | Contextual |
| Account | Identidad / preferencias |

**Product Context:** cuenta personal · Organización A (One + LifeFlow) · Organización B (SA)…  
API de registro de widgets/links para productos futuros.  

**Prioridad:** Mi día con **One + 1 segundo producto real** — no integrar seis a la vez.  
Estado ops: código paths PASS · browser ⬜ login (`tmp/B9-…`).

---

## 6. Madurez en tres ejes

| Eje | Escala |
|-----|--------|
| Ciclo de vida | Planned → Active → Paused → Deprecated |
| Verificación técnica | Local → CI → Staging → Production verified |
| Validación comercial | Internal → Pilot → Customer validated → Paying |

Semáforo único 🟢🟡 = insuficiente. Toda celda con **evidencia + fecha**.

Público README: distinguir **Shared Identity/Billing/Search/Experience** *disponible* vs *planificado* — no vender madurez comercial por smoke de plataforma.

---

## 7. Portfolio — decisiones

| Proyecto | Decisión |
|----------|----------|
| Dakinis One | Desarrollo **principal** |
| Hub | Desarrollo compartido (experience) |
| Auth · Billing · Core · Internal | Prioridad plataforma |
| DES | Consolidación SoT |
| LifeFlow / SA | Mantenimiento + evolución selectiva |
| AkoeNet | Mantener + **diferenciar** vs Chat |
| **Dakinis Chat** | Resolver solape con AkoeNet (aparcado o capa messaging compartida) |
| OS | Hitos |
| Desktop + Agent | Integración gradual con OS |
| Nexus Browser | Congelar features hasta estrategia |
| Tabletop | Prioridad baja |
| MYTHOS / Settlement / Ashen | Hitos / playtest · cupo 15% |

### Chat vs AkoeNet

| Producto | Diferenciador propuesto (a validar) |
|----------|-------------------------------------|
| AkoeNet | Comunidades · servidores · voz · bots · grupos |
| Dakinis Chat | Mensajería personal / DM entre identidades Dakinis |

Si Chat solo reproduce AkoeNet → aparcar o absorber.  
Opcional: contratos messaging compartidos + frontends distintos — **no** dos roadmaps sin razón comercial.

### Device family

OS (imagen) · Desktop (shell) · Agent (IPC) · Nexus (independiente, integra si hay justificación).  
Registro de compatibilidad: versión imagen / shell / IPC / motor · IPC versionado · permisos mínimos · firmas · updates · recovery.  
**No** bloquear lanzamiento comercial de One.

### README público — categorías sugeridas

| Categoría | Elementos |
|-----------|-----------|
| Business | One, LifeFlow |
| Creators & Communities | SA, AkoeNet |
| Shared Platform | Hub, Auth, Billing, AI, Search, Notifications, Knowledge, DES |
| Desktop & Emerging | OS, Desktop, Nexus |
| Labs & Games | MYTHOS, Tabletop, Settlement, Ashen |

---

## 8. Validación comercial One (paralelo)

Captación → alta → configuración → uso real → seguimiento → conversión.  

KPIs: onboarding time · activación · uso semanal · ops completadas · intervenciones · incidencias · retención · conversión.  

No módulos grandes hasta circuito suficientemente probado. Seguridad = puerta de lanzamiento; piloto **en paralelo**.

---

## 9. Gobierno GitHub (1 operador)

| Área | Mejora |
|------|--------|
| Branch protection | `main` protegido |
| PR | Obligatorios + CI verde (sin 2º reviewer artificial hasta haber equipo) |
| Actions | Workflows reutilizables |
| CODEOWNERS | Por componente |
| Dependabot / secret & code scanning | Activo |
| Releases / Environments | Staging ≠ prod |
| Packages | Publicación versionada DES |
| Permissions | Mínimo necesario |

**Engineering Hub:** módulo *Repository & Architecture Registry* (lectura/diagnóstico) **después** del YAML registry — no otro sistema enorme antes.

---

## 10. Plan maestro

### P0 — Fundaciones

- [ ] Formalizar Polyrepo + orquestador  
- [ ] Registrar ~26 repos  
- [ ] Correspondencia GitHub ↔ `D:\`  
- [ ] SoT DES (`dakinis-shared` vs `packages/`)  
- [ ] Chat ↔ AkoeNet  
- [ ] Core vs marca “Dakinis One”  
- [ ] Propiedad de datos + contratos  

### P1 — Plataforma

- [ ] Auth/SSO estable · orgs/tenants  
- [ ] Billing + entitlements  
- [ ] APIs/eventos · multi-tenant  
- [ ] Staging reproducible · observabilidad · restore  

### P1 — Producto comercial

- [ ] Onboarding restaurante · roles · recorridos  
- [ ] Mi día Hub · widgets 2 productos  
- [ ] Métricas intervenciones · proceso comercial de prueba  

### P2 — Engineering Control

- [ ] Registry · reports · dependency map · releases · deploys · doc health  

### P3 — Expansión

- [ ] AI/Search/Knowledge · Desktop/OS/Nexus · secundarios  

### Cola circuito ops (en curso, sin cobro)

| Ítem | Estado 27 nov |
|------|----------------|
| Smoke circuit | 🟢 10/10 |
| Cond 6 restore local | 🟢 |
| Cond 2 RBAC tests | 🟡 código PASS · browser ⬜ |
| Cond 3 Auth revoke | 🟢 código [#3](https://github.com/dakinissystems/dakinis-auth/pull/3)+[#4](https://github.com/dakinissystems/dakinis-auth/pull/4) · Railway 🟢 · live ⬜ |
| Cond 4 dual-key | 🟡 Internal #4 |
| Cond 5 UNIQUE | 🟡 código · SQL vivo ⬜ |
| Cond 7 audit | 🟡 código PASS · live ⬜ |
| Cond 8 suplente | ⬜ nombrar |
| Hub Mi día browser | ⬜ login |
| Staging / B6 | ⏸ |

---

## 11. Ocho documentos para consolidar (antes que los 40)

| Documento | Propósito |
|-----------|-----------|
| `ECOSYSTEM-ARCHITECTURE.md` | Arquitectura global (maestro) |
| `PLATFORM-BOUNDARIES.md` | Límites de servicios |
| `PRODUCT-PORTFOLIO.md` | Estrategia productos |
| `REPOSITORY-REGISTRY.yaml` | Fuentes de verdad |
| `SERVICE-CATALOG.yaml` | Servicios + deps |
| `DATA-OWNERSHIP.md` | Datos / aislamiento |
| `INTEGRATION-CONTRACTS.md` | APIs / eventos |
| `ENGINEERING-ROADMAP.md` | Prioridades |

Durante la transición: STATUS / SYSTEMS / OPERATIONS / SECURITY siguen canónicos.

**Siguiente artefacto recomendado:** `DAKINIS-SYSTEMS-ARCHITECTURE.md` + registry de 26 repos (implementado vs propuesto explícito).  
**Borrador local:** [`tmp/B-repository-registry-draft.yaml`](./B-repository-registry-draft.yaml) (P0 parcial).

### Antes de tocar código de reunificación — inspeccionar

| Componente | Qué verificar |
|------------|---------------|
| core | Dominios, API, tenancy |
| auth | SSO, JWT, revoke, user relations |
| billing | Planes, webhooks, entitlements |
| hub | Widgets, integraciones |
| shared | Paquetes, versiones, duplicados |
| chat ↔ AkoeNet | Intención vs solape |
| OS/Desktop/Agent | Contratos IPC |

---

## 12. Árbol de carpetas local (`D:\dakinis-systems`)

Omitidos: `node_modules`, `.git`, `dist`, caches.

### 12.1 Raíz

```text
D:\dakinis-systems/
├── .github/workflows/
├── .github-org/profile/assets/
├── apps/                 # §12.2
├── backups/postgres/
├── dakinis-desktop/{public,src,src-tauri}/
├── dakinis-device-agent/src/server/
├── dakinis-os/{files,modules,recipes}/
├── docs/                 # §12.5
├── infrastructure/       # §12.6
├── packages/             # DES working tree — SoT TBD vs dakinis-shared
├── platform/             # §12.3 checkouts de servicios
├── projects/             # §12.7
├── scripts/{lib,platform-scaffold}/
├── tools/{dakinis-mcp,dakinis-scout}/
└── README.md · *.code-workspace
```

### 12.2 `apps/`

```text
apps/
├── akoenet/{Client,Server}/          # sin .git en apps — mapear a akoenet-*
├── ashen-path/{DakinisAshenPath,tools}/
├── dnd-7dtd/
├── fitness-platform/{admin,api,shared,web}/
├── landing/{public,scripts,src}/
├── lifeflow/{api,docs,packages,scripts,web}/
├── messenger/                        # = dakinis-chat
├── nexus-browser/                    # = NEXUS-Browser
│   ├── apps/{desktop,mobile,web}/
│   ├── engines/{cef,geckoview,webkit}/
│   ├── packages/ · services/
├── settlement-directive/{DakinisColonyOverhaul,Mods,…}/
├── streamautomator/{apps/{api,web},docs}/
└── tabletop/{api,web,docs}/
```

### 12.3 `platform/`

```text
platform/
├── ai/{prompts,src/{agents,rag,routes,workers},tests}/
├── auth/{sql,src,test}/
├── billing/{src,test}/
├── core/{api,web,shared,packages/payroll,data}/
├── hub/{src,test,web}/
├── internal/{src,packages,test}/
├── knowledge/{api,workers/{ingest,embeddings,ocr,…}}/
├── notifications/src/
├── search/{src,test}/
├── services/media/
└── shared/packages/                  # ⚠ no-SoT candidato
```

### 12.4 `packages/` (DES tree)

`shared-brand|des|foundation|layouts|ux|…` · `sdk-*` · `domain` · `payroll` · `akoenet-*`

### 12.5–12.7 Docs / infra / projects

`docs/{adr,architecture,company,contracts,domains,evidence,RUNBOOKS,supabase,…}` · STATUS/SYSTEMS/OPERATIONS/SECURITY  

`infrastructure/{cloudflare,docker/{nginx,postgres},gateway/routes,railway}`  

`projects/workspace/{addons×26,desktop,packages,services}` · media-player · studio · experiments · archive  

---

## 13. `D:\` workspaces relacionados

| Ruta | Incluir | Nota |
|------|---------|------|
| `dakinis-systems-wt-ops` / `-wt-theme` | Sí | Worktrees orquestación |
| `dakinis-shared` | Sí | Candidato SoT DES |
| `dakinis-streamautomator` | Sí | Comparar con `apps/` |
| `AkoNet` | Cuidado | Remoto `ChristianDVillar/Akoenet` ≠ org |
| Vault / AI Studio / Engineering Hub | Sí | Secundarios / meta |
| MYTHOS / Eclipse / Aesir / … | Cupo 15% | Labs |
| Steam / Schedule / Nexexora / cursos | No | Fuera de circuito |

---

## 14. Evidencias ops (`tmp/B*`)

`B1` Copérnico · `B2` roles · `B6` cobro ⏸ · `B9` Mi día · `B10` onboarding · `B11` smoke · `B-cond2/3/5/6/7/8` · `B-ocho` · `B-railway-*` · `B-mfa-cloudflare`

Auth CI fix:  
https://github.com/dakinissystems/dakinis-auth/compare/main...fix/auth-refresh-revoke-ci-contract?expand=1

---

## 15. Mejoras adicionales (este inventario)

1. **Registry YAML mínimo en P0** incluso con 5–6 componentes críticos (One, Auth, Billing, Hub, Shared, Internal) antes de los 26.  
2. **Etiqueta `implemented` vs `proposed`** en cada decisión de este MD al migrar a `ECOSYSTEM-ARCHITECTURE.md`.  
3. **Entitlements matrix** One Growth/… como tabla en `PRODUCT-PORTFOLIO` (Billing no = RBAC).  
4. **Smoke “experience”:** Hub live + deep-link One + un widget (además del circuit health).  
5. **AkoeNet `.git` ausente en `apps/`** = riesgo inmediato de editar sin remoto; priorizar en correspondencia P0.  
6. **Public README badge** por producto: Technical / Commercial / Availability por separado.  
7. **Congelar** nexus/messenger features hasta decisión Chat↔AkoeNet (ahorra bus factor).

---

## 16. Conclusión

Dakinis ya tiene forma de ecosistema en GitHub. Falta **reglas comunes, contratos estables y operación verificable** — no más repos ni más servicios por inercia.

**Siguiente paso documental:** `DAKINIS-SYSTEMS-ARCHITECTURE.md` + `REPOSITORY-REGISTRY.yaml` (26 entradas, implemented/proposed).  
**Siguiente paso circuito:** login B9 · UNIQUE SQL / suplente · live runbook (`tmp/B-live-runbook-condiciones.md`) · piloto KPIs.  
**Merge:** Auth #4 ya en main. Docs/scripts ops se acumulan — **avisar solo merge final** (ver `tmp/B-residual-board.md`).
