# Documentación — índice

Documentación del **control repo** (`dakinis-systems`). Separación clara:

| Tipo | Documentos |
|------|------------|
| **Control interno (operador)** | [`OPERATIONS.md`](./OPERATIONS.md) — único doc de estado, prod, tenants, precios BOS |
| **Infra y datos** | [`supabase/SETUP.md`](./supabase/SETUP.md) · [`railway.env.example`](./railway.env.example) |
| **Arquitectura** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`WORKSPACE-STRATEGY.md`](./WORKSPACE-STRATEGY.md) · [`LANDING-CORE-STRUCTURE.md`](./LANDING-CORE-STRUCTURE.md) |
| **Contratos y gateway** | [`rules.md`](./rules.md) · [`contracts/`](./contracts/) |
| **Producto (integraciones)** | [`WHATSAPP-INTEGRATION.md`](./WHATSAPP-INTEGRATION.md) · [`I18N-ECOSYSTEM.md`](./I18N-ECOSYSTEM.md) |
| **Observabilidad** | [`observability/`](./observability/) |
| **Decisiones** | [`adr/`](./adr/) |
| **Cliente (legal)** | [`legal/`](./legal/) — privacidad, términos, avisos; no mezclar con OPERATIONS |

**SQL Supabase:** `supabase/schemas/` (`00`→`09`) + `004` / `006` / `006b` — orden en [SETUP.md](./supabase/SETUP.md).

**Fusionados en OPERATIONS.md (eliminados):** `CORE-TENANTS-TEMP.md`, `PRODUCTION-CHECKLIST-TEMP.md`, `DAKINIS-HUB-VISION.md`, `RAILWAY-PRODUCTION.md`, `ARCHITECTURE-DECISIONS.md`, `DAKINIS-ESTRUCTURA-TEMP.md`, `SUPABASE-SECURITY.md`.
