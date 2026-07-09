# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts). Código de producto en repos GitHub → [`GITHUB-ORG.md`](./GITHUB-ORG.md).

---

## Índice (empieza aquí)

| Necesitas… | Lee |
|------------|-----|
| **Estado hoy** (madurez, KPIs, Done, riesgos) | [`STATUS.md`](./STATUS.md) |
| **Qué viene** (jul–Q4 2026, negocio + técnico) | [`ROADMAP.md`](./ROADMAP.md) |
| **Arquitectura** (capas, diagramas, reglas) | [`ARCHITECTURE.md`](./ARCHITECTURE.md) — [14 diagramas Mermaid](./ARCHITECTURE.md#arquitectura-visual) |
| **Deploy, env, incidencias** | [`OPERATIONS.md`](./OPERATIONS.md) |
| **Dev día 1** | [`ONBOARDING.md`](./ONBOARDING.md) |
| **Hub / workspace** | [`HUB-WORKSPACE.md`](./HUB-WORKSPACE.md) |
| **Productos** | [`PRODUCTS.md`](./PRODUCTS.md) |
| **Releases** | [`CHANGELOG.md`](./CHANGELOG.md) |
| **Negocio / ventas** | [`company/`](./company/) · [`WHY.md`](./WHY.md) |
| **ADRs** | [`adr/`](./adr/) |
| **APIs HTTP** | [`contracts/`](./contracts/) |
| **SQL** | [`supabase/migrations/`](./supabase/migrations/) |

---

## Reglas de documentación

1. **Estado y pendientes** → solo [`STATUS.md`](./STATUS.md) (no duplicar en otros sitios).
2. **Roadmap** → [`ROADMAP.md`](./ROADMAP.md).
3. **Arquitectura estable** → [`ARCHITECTURE.md`](./ARCHITECTURE.md) (sin versiones ni commits).
4. **Ops + runbook** → [`OPERATIONS.md`](./OPERATIONS.md).

Snapshot automático (versiones, health):

```bash
node scripts/generate-docs-status.mjs
```

---

*Julio 2026*
