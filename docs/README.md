# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts). Código de producto → repos GitHub ([`GITHUB-ORG.md`](./GITHUB-ORG.md)).

## Empieza aquí

| Prioridad | Documento | Para qué |
|-----------|-----------|----------|
| **1** | [**PLATFORM-STATUS.md**](./PLATFORM-STATUS.md) | **Solo pendientes técnicos** |
| **2** | [**ROADMAP-CEO.md**](./ROADMAP-CEO.md) | Jul–nov 2026 · enfoque cliente |
| **3** | [**company/MESSAGING.md**](./company/MESSAGING.md) | Landing · Hub · IA · Knowledge |
| **4** | [**OPERATIONS.md**](./OPERATIONS.md) | Deploy · Billing E2E |

## Referencia estable (no borrar)

| Documento | Contenido |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Capas · reglas · contratos |
| [PRODUCTS.md](./PRODUCTS.md) | Módulos por producto |
| [COMPANY.md](./COMPANY.md) | Misión · visión · valores |
| [ORGANIZATION.md](./ORGANIZATION.md) | Organigrama · delegación (para el fundador) |
| [company/](./company/) | Business model · pricing · journey · hiring · KPIs |
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
- Pendientes → **solo** PLATFORM-STATUS

---

*Julio 2026 — docs recortados a lo funcional. Legal y ADR se mantienen completos.*
