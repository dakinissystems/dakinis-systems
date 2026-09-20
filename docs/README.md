# Documentación Dakinis Systems

Repositorio de **orquestación** (gateway, Docker, SQL, legal, scripts).

---

## Source of truth (empieza aquí)

| Necesitas… | Lee | Audiencia |
|------------|-----|-----------|
| **Estado hoy** | [`STATUS.md`](./STATUS.md) | Eng · Ops · CEO |
| **Mapa de sistemas** | [`SYSTEMS.md`](./SYSTEMS.md) | Eng · Product |
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

---

## Reglas

1. **Estado y pendientes** → solo [`STATUS.md`](./STATUS.md). No hay doc de roadmap separado.
2. **Arquitectura estable** → [`ARCHITECTURE.md`](./ARCHITECTURE.md) · dominios → [`architecture/`](./architecture/) · mapa → [`SYSTEMS.md`](./SYSTEMS.md).
3. **ADRs** = por qué; **changelog técnico** = qué pasó ([`architecture/changelog/`](./architecture/changelog/)).
4. **Ops** → [`OPERATIONS.md`](./OPERATIONS.md) + [`RUNBOOKS/`](./RUNBOOKS/).
5. **Seguridad** → [`SECURITY.md`](./SECURITY.md).
6. **No usar** prefijo `TEMP-` para decisiones de arquitectura.
7. No documentar como “en prod” lo que solo está en una feature branch.

Snapshot automático:

```bash
node scripts/generate-docs-status.mjs
```

---

*Docs hygiene · sep 2026 — solo SoT de sistema / ops / legal / comercial canónico.*
