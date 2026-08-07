# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts).  
Mapa de repos (histórico) → [`archive/GITHUB-ORG.md`](./archive/GITHUB-ORG.md).

---

## Source of truth (empieza aquí)

| Necesitas… | Lee | Audiencia |
|------------|-----|-----------|
| **Estado hoy** | [`STATUS.md`](./STATUS.md) | Eng · Ops · CEO |
| **Mapa de sistemas** | [`SYSTEMS.md`](./SYSTEMS.md) | Eng · Product |
| **Qué viene** | [`ROADMAP.md`](./ROADMAP.md) | CEO · Product |
| **Arquitectura** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Eng |
| **Arquitectura por dominios** | [`architecture/README.md`](./architecture/README.md) | Eng |
| **Hospitality / CRM / Connectors** | [`domains/`](./domains/) · [`platform/core.md`](./platform/core.md) | Eng · Product |
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
| **Guías eng** | [`guides/`](./guides/) | Eng |
| **Contratos HTTP** | [`contracts/`](./contracts/) | Eng |
| **Producto AkoeNet AI** | [`AKOENET-ASSISTANT.md`](./AKOENET-ASSISTANT.md) | Eng · Product |
| **Histórico / drafts** | [`archive/`](./archive/) — **no SoT** | — |

Copy marketing borrador: [`company/LANDING-COPY.md`](./company/LANDING-COPY.md) (no es landing live).

---

## Reglas

1. **Estado y pendientes** → solo [`STATUS.md`](./STATUS.md).
2. **Roadmap** → [`ROADMAP.md`](./ROADMAP.md) (plan; no afirma “ya cobramos”).
3. **Arquitectura estable** → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · dominios → [`architecture/`](./architecture/) · mapa → [`SYSTEMS.md`](./SYSTEMS.md).
4. **ADRs** = por qué; **changelog técnico** = qué pasó ([`architecture/changelog/`](./architecture/changelog/)).
5. **Ops** → [`OPERATIONS.md`](./OPERATIONS.md) + [`RUNBOOKS/`](./RUNBOOKS/).
6. **Seguridad** → [`SECURITY.md`](./SECURITY.md).
7. **No usar** prefijo `TEMP-` para decisiones de arquitectura.
8. **No editar** `archive/` como si fuera vivo; enlaces internos del archive pueden estar rotos a propósito.
9. No documentar como “en prod” lo que solo está en una feature branch.

Snapshot automático:

```bash
node scripts/generate-docs-status.mjs
```

---

*Docs hygiene · ago 2026.*
