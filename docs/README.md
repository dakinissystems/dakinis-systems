# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts). Código de producto → repos GitHub ([`GITHUB-ORG.md`](./GITHUB-ORG.md)).

## Dos capas de documentación

| Audiencia | Carpeta / docs | Contenido |
|-----------|----------------|-----------|
| **CEO · ventas · inversores** | [`company/`](./company/) · [`WHY.md`](./WHY.md) | Por qué, estrategia, journey, mensaje, modelo negocio |
| **Ingeniería · ops** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`OPERATIONS.md`](./OPERATIONS.md) | Servicios, Railway, Redis, SQL, deploy |

No mezclar: un inversor empieza en [`company/STRATEGY.md`](./company/STRATEGY.md); un dev en [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Empieza aquí

| Prioridad | Documento | Para qué |
|-----------|-----------|----------|
| **1** | [**PLATFORM-STATUS.md**](./PLATFORM-STATUS.md) | Solo pendientes técnicos |
| **2** | [**company/STRATEGY.md**](./company/STRATEGY.md) | Posicionamiento · competencia · FODA |
| **3** | [**ROADMAP-CEO.md**](./ROADMAP-CEO.md) | Jul–nov 2026 · enfoque cliente |
| **4** | [**company/CUSTOMER-JOURNEY.md**](./company/CUSTOMER-JOURNEY.md) | Landing → pago → retención |
| **5** | [**company/MESSAGING.md**](./company/MESSAGING.md) | Landing · Hub · IA |
| **6** | [**OPERATIONS.md**](./OPERATIONS.md) | Deploy · Billing E2E |

## Estrategia y plataforma (jul 2026)

| Documento | Contenido |
|-----------|-----------|
| [WHY.md](./WHY.md) | Por qué Hub, Core separado, Assistant sin bots… |
| [PLATFORM-CAPABILITIES.md](./PLATFORM-CAPABILITIES.md) | Identity · Billing · AI · Banking… (no solo servicios) |
| [WORKSPACE-LIFECYCLE.md](./WORKSPACE-LIFECYCLE.md) | Crear → invitar → plan → expandir |
| [PLATFORM-INTEGRATIONS.md](./PLATFORM-INTEGRATIONS.md) | Catálogo conectores (roadmap) |
| [MARKETPLACE.md](./MARKETPLACE.md) | Apps · templates · agents (diseño) |
| [BANKING-PLATFORM.md](./BANKING-PLATFORM.md) | Agregación multi-banco LifeFlow + Core |
| [HUB-WORKSPACE.md](./HUB-WORKSPACE.md) | Admin workspace · Super Admin |

## Referencia técnica estable

| Documento | Contenido |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Capas · reglas · contratos |
| [PRODUCTS.md](./PRODUCTS.md) | Módulos por producto |
| [COMPANY.md](./COMPANY.md) | Misión · visión · valores |
| [ORGANIZATION.md](./ORGANIZATION.md) | Organigrama · delegación |
| [company/](./company/) | Business model · pricing · KPIs · hiring |
| [GITHUB-ORG.md](./GITHUB-ORG.md) | Repos y DES |

## Clientes e integradores

| Recurso | Descripción |
|---------|-------------|
| [`legal/`](./legal/) | Legales bilingües ES/EN |
| [`contracts/`](./contracts/) | Contratos HTTP |
| [`adr/`](./adr/) | Decisiones de arquitectura |
| [`rules.md`](./rules.md) | Reglas gateway |

## Infra

| Recurso | Descripción |
|---------|-------------|
| [`railway.env.example`](./railway.env.example) | Variables (sin secretos) |
| [`supabase/migrations/RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) | SQL prod |
| [`../gateway/README.md`](../gateway/README.md) | Gateway Nginx |

## Qué no duplicar

- Estado “hecho” → git + ADR + ARCHITECTURE
- Checklists ops → OPERATIONS
- **Pendientes → solo [`PLATFORM-STATUS.md`](./PLATFORM-STATUS.md)** (fuente canónica)

---

*Julio 2026 — docs recortados a lo funcional. Legal y ADR se mantienen completos.*
