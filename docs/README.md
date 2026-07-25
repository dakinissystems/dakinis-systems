# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts).  
Mapa de repos → [`archive/GITHUB-ORG.md`](./archive/GITHUB-ORG.md) (histórico).

---

## Source of truth (empieza aquí)

| Necesitas… | Lee | Audiencia |
|------------|-----|-----------|
| **Estado hoy** | [`STATUS.md`](./STATUS.md) | Eng · Ops · CEO |
| **Mapa de sistemas** | [`SYSTEMS.md`](./SYSTEMS.md) | Eng · Product |
| **Qué viene** | [`ROADMAP.md`](./ROADMAP.md) | CEO · Product |
| **Arquitectura** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Eng |
| **Deploy / ops** | [`OPERATIONS.md`](./OPERATIONS.md) | Ops · Eng |
| **Runbooks** | [`RUNBOOKS/`](./RUNBOOKS/) | Ops |
| **Seguridad** | [`SECURITY.md`](./SECURITY.md) | Ops · Eng |
| **Leak de secretos** | [`SECRET-LEAK-REMEDIATION.md`](./SECRET-LEAK-REMEDIATION.md) | Ops |
| **Gateway rules** | [`rules.md`](./rules.md) | Eng |
| **Networking / ventas** | [`PLAYBOOK-NETWORKING.md`](./PLAYBOOK-NETWORKING.md) · [`company/sales/`](./company/sales/) | Sales · CEO |
| **Estrategia / mensaje** | [`company/STRATEGY.md`](./company/STRATEGY.md) · [`company/MESSAGING.md`](./company/MESSAGING.md) | CEO · Sales |
| **ADRs** | [`adr/`](./adr/) | Eng |
| **Legal** | [`legal/`](./legal/) | Legal · CEO |
| **SQL** | [`supabase/migrations/`](./supabase/migrations/) · [`RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) | Eng |
| **Contratos HTTP** | [`contracts/`](./contracts/) | Eng |
| **Producto AkoeNet AI** | [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md) | Eng · Product |
| **Histórico / drafts** | [`archive/`](./archive/) | — |

Stubs (compatibilidad): [`SECURITY-OPS.md`](./SECURITY-OPS.md) · [`ADMIN-ACCESS-AUDIT.md`](./ADMIN-ACCESS-AUDIT.md) · [`UPTIME-EXTERNAL.md`](./UPTIME-EXTERNAL.md).

---

## Reglas

1. **Estado y pendientes** → solo [`STATUS.md`](./STATUS.md).
2. **Roadmap** → [`ROADMAP.md`](./ROADMAP.md).
3. **Arquitectura estable** → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · mapa → [`SYSTEMS.md`](./SYSTEMS.md).
4. **Ops** → [`OPERATIONS.md`](./OPERATIONS.md) + [`RUNBOOKS/`](./RUNBOOKS/).
5. **Seguridad** → [`SECURITY.md`](./SECURITY.md).
6. **Networking** → [`PLAYBOOK-NETWORKING.md`](./PLAYBOOK-NETWORKING.md).
7. **Empresa** → una fuente por tema ([`company/README.md`](./company/README.md)).
8. **No editar** stubs ni `archive/` como si fueran vivos.

Snapshot automático:

```bash
node scripts/generate-docs-status.mjs
```

---

*Cleanup docs v1 + v2 — jul 2026.*
