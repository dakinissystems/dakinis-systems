# ADR-003 — Gateway routing

## Contexto

Múltiples APIs públicas (Core, finance, billing, AI, …) requieren TLS único, JWT validation y rate limits coherentes.

## Decisión

**Gateway único** en `api.dakinissystems.com` (Nginx). Prefijos por servicio (`/core/`, `/finance/`, `/billing/`, `/ai/`, `/internal/`, …). Validación JWT vía `/_auth_check` contra Auth. Productos web en subdominios propios; APIs detrás del gateway salvo excepciones documentadas (p. ej. StreamAutomator).

## Consecuencias

- Config canónica: `gateway/routes/default.conf`.
- Rate limit **granular** (`nginx.conf` zones):
  | Zone | Key | Rate | Uso |
  |------|-----|------|-----|
  | `public_limit` | IP | 5r/s | `/core/api/public/`, `/streamautomator/api/public/` |
  | `api_limit` | sess/IP | 10r/s | APIs autenticadas genéricas (`/core/`, `/streamautomator/`) |
  | `bff_limit` | sess/IP | 30r/s | `/internal/hub/`, `/internal/workspace/`, resto `/internal/` |
  | `admin_limit` | sess/IP | 10r/s | `/internal/admin/` |
  | `events_limit` | sess/IP | 20r/s | `/internal/events` |
- Internal refuerza tiers Redis (`public`/`bff`/`admin`/`events`) en `enforceServiceRateLimit`.
- Servicios internos (Internal API `:4083`) accesibles por red privada Railway desde Hub/Core.
- Nuevos servicios platform registran upstream + health check antes de prod.
