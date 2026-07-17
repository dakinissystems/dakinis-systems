# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts).  
Mapa de repos → [`archive/GITHUB-ORG.md`](./archive/GITHUB-ORG.md) (histórico).

---

## Source of truth (empieza aquí)

| Necesitas… | Lee |
|------------|-----|
| **Estado hoy** | [`STATUS.md`](./STATUS.md) |
| **Qué viene** | [`ROADMAP.md`](./ROADMAP.md) |
| **Arquitectura** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| **Evolución arquitectura** | [`ARCHITECTURE-IMPROVEMENTS-FEEDBACK-2026-07.md`](./ARCHITECTURE-IMPROVEMENTS-FEEDBACK-2026-07.md) |
| **Deploy / ops** | [`OPERATIONS.md`](./OPERATIONS.md) |
| **Networking / ventas** | [`PLAYBOOK-NETWORKING.md`](./PLAYBOOK-NETWORKING.md) · [`company/sales/`](./company/sales/) |
| **Estrategia / mensaje** | [`company/STRATEGY.md`](./company/STRATEGY.md) · [`company/MESSAGING.md`](./company/MESSAGING.md) |
| **ADRs** | [`adr/`](./adr/) |
| **Legal** | [`legal/`](./legal/) |
| **SQL** | [`supabase/migrations/`](./supabase/migrations/) · orden [`RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) |
| **Contratos HTTP** | [`contracts/`](./contracts/) |
| **Histórico / drafts** | [`archive/`](./archive/) |

---

## Reglas

1. **Estado y pendientes** → solo [`STATUS.md`](./STATUS.md).
2. **Roadmap** → [`ROADMAP.md`](./ROADMAP.md).
3. **Arquitectura estable** → [`ARCHITECTURE.md`](./ARCHITECTURE.md).
4. **Ops** → [`OPERATIONS.md`](./OPERATIONS.md).
5. **Networking** → solo [`PLAYBOOK-NETWORKING.md`](./PLAYBOOK-NETWORKING.md) (kit + sales networking fusionados 17 jul 2026).

Snapshot automático:

```bash
node scripts/generate-docs-status.mjs
```

---

*Limpieza docs 17 jul 2026 — TEMP/duplicados eliminados; drafts en `archive/`.*
