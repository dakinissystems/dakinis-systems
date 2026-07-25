# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts).  
Mapa de repos → [`archive/GITHUB-ORG.md`](./archive/GITHUB-ORG.md) (histórico).

---

## Source of truth (empieza aquí)

| Necesitas… | Lee |
|------------|-----|
| **Estado hoy** | [`STATUS.md`](./STATUS.md) |
| **Mapa de sistemas** | [`SYSTEMS.md`](./SYSTEMS.md) |
| **Qué viene** | [`ROADMAP.md`](./ROADMAP.md) |
| **Arquitectura** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| **Deploy / ops** | [`OPERATIONS.md`](./OPERATIONS.md) |
| **Runbooks** | [`RUNBOOKS/`](./RUNBOOKS/) |
| **Seguridad** | [`SECURITY.md`](./SECURITY.md) |
| **Leak de secretos** | [`SECRET-LEAK-REMEDIATION.md`](./SECRET-LEAK-REMEDIATION.md) |
| **Networking / ventas** | [`PLAYBOOK-NETWORKING.md`](./PLAYBOOK-NETWORKING.md) · [`company/sales/`](./company/sales/) |
| **Estrategia / mensaje** | [`company/STRATEGY.md`](./company/STRATEGY.md) · [`company/MESSAGING.md`](./company/MESSAGING.md) |
| **ADRs** | [`adr/`](./adr/) |
| **Legal** | [`legal/`](./legal/) |
| **SQL** | [`supabase/migrations/`](./supabase/migrations/) · orden [`RUN-ORDER.md`](./supabase/migrations/RUN-ORDER.md) |
| **Contratos HTTP** | [`contracts/`](./contracts/) |
| **Histórico / drafts** | [`archive/`](./archive/) |

Stubs de compatibilidad (enlaces antiguos): [`SECURITY-OPS.md`](./SECURITY-OPS.md) · [`ADMIN-ACCESS-AUDIT.md`](./ADMIN-ACCESS-AUDIT.md) · [`UPTIME-EXTERNAL.md`](./UPTIME-EXTERNAL.md).

---

## Reglas

1. **Estado y pendientes** → solo [`STATUS.md`](./STATUS.md).
2. **Roadmap** → [`ROADMAP.md`](./ROADMAP.md).
3. **Arquitectura estable** → [`ARCHITECTURE.md`](./ARCHITECTURE.md).
4. **Ops** → [`OPERATIONS.md`](./OPERATIONS.md) + [`RUNBOOKS/`](./RUNBOOKS/).
5. **Seguridad** → [`SECURITY.md`](./SECURITY.md).
6. **Networking** → [`PLAYBOOK-NETWORKING.md`](./PLAYBOOK-NETWORKING.md).

Snapshot automático:

```bash
node scripts/generate-docs-status.mjs
```

---

*Cleanup docs v1 — 25 jul 2026.*
