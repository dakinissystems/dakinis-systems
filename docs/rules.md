# Operational rules — gateway & contracts

These rules apply to **any** change that exposes new HTTP routes from services behind [`gateway/routes/default.conf`](../gateway/routes/default.conf).

## Golden rule (public surface)

All **new** public endpoints **SHOULD** live under one of these URL prefixes on the backend (so the gateway allowlist stays small):

- `/api/public/*`
- `/api/integrations/*` (see also legacy `/api/integration/*`)
- `/api/webhooks/*`
- `/api/oauth/*` (or `/api/user/auth/*` while OAuth paths are migrated — document in the same PR)

If a public route **cannot** use those prefixes yet, **`gateway/routes/default.conf` MUST be updated in the same PR** that adds the route, and [`docs/contracts/`](./contracts/) MUST reflect it.

This prevents silent technical debt and production outages when someone adds an endpoint and forgets the gateway.

## Public routes

If a new **public** route is added in any service (no JWT at the gateway for that path):

1. **Declare it** in `gateway/routes/default.conf` under the correct prefix (e.g. `/streamautomator/api/public/…`, `/streamautomator/api/webhooks/…`, or extend the integration regex). Prefer grouping **new** public APIs under stable prefixes in the backend (`/api/public/*`, `/api/webhooks/*`, `/api/integrations/*`) so the gateway stays a short allowlist.
2. **Document it** under [`docs/contracts/`](./contracts/) (and update [`README.md`](../README.md) if the change is user-facing).

If you skip (1), the gateway will require JWT for that path and **production will break** for unauthenticated callers.

## Protected routes

Routes behind `auth_request` rely on **`GET /auth/verify`** returning **HTTP 2xx** only when the JWT is valid (typically **200** with identity headers). **401/403** from auth cause the gateway to reject the request — no `if` logic inside `location` for `X-Auth-Status`. The header **`X-Auth-Status: ok`** remains useful for logging and debugging, not as the primary control mechanism.

Changes to the JWT payload contract must stay aligned with **platform/auth** and the gateway `auth_request_set` blocks.

## CORS at the gateway

The gateway sets CORS headers on selected paths. **`Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true` is invalid in browsers**; when you need cookies or credentials, replace `*` with explicit origins (env-driven or per-environment). Long term, **remove duplicate CORS from individual services** so only the gateway defines CORS for browser traffic.

### Production-style allowlist (reference)

Replace wildcard origins with an explicit allowlist (example pattern — test before rollout):

```nginx
set $cors_origin "";
if ($http_origin ~* ^https://(app|admin)\.dakinis\.com$) {
    set $cors_origin $http_origin;
}
add_header Access-Control-Allow-Origin $cors_origin always;
```

Prefer maintaining allowed origins via env + templating or a tiny include file rather than hardcoding hostnames.

## Auth cache (gateway)

Nginx caches **`/_auth_check`** using a **short fingerprint** of the Bearer token (`sess:` + first 48 characters), not the full JWT string — see [`gateway/nginx.conf`](../gateway/nginx.conf). Revocation may lag behind **`proxy_cache_valid`** (15s for 200 responses as shipped). Prefer **short-lived access tokens** and avoid relying on instantaneous revocation until you add a shared denylist (e.g. Redis `jti`).

## Rate limiting at the gateway

The zone key **`$sess_or_anon_key`** correlates with the **same truncated JWT prefix** used for auth cache — stable per issued token, bounded memory. It is **not** the same as end-user id from the database (that would require executing `auth_request` before `limit_req` in a way vanilla OpenResty-free nginx does not guarantee for `limit_req`). For per-tenant quotas in SaaS, add **application-layer** or **API gateway** logic later.

## Gateway change discipline

This gateway is the **Dakinis API gateway**, not “just nginx”. Changes require **PR + review**, **contract updates** when routes or headers change, and **log review** when altering `log_format` or auth behaviour.

## Production hostname map (reference)

When moving off `localhost`, a typical layout is:

| Concern | Example host / path |
|--------|----------------------|
| Auth service | `auth.dakinis.example` or path `/auth/` on a shared API host |
| Core API | `api.dakinis.example/core/` |
| StreamAutomator | `api.dakinis.example/streamautomator/` |
| AkoeNet | `api.dakinis.example/akoenet/` or dedicated host |

TLS termination and DNS live in front of this repo’s Nginx gateway or a cloud load balancer; only paths and upstream names need to stay consistent with compose.

## Cloud footprint (minimal)

For current scale: one VM or small instance running Docker Compose (gateway + services), managed PostgreSQL (RDS or equivalent), optional Redis, optional Cloudflare or similar CDN/WAF — no Kubernetes required at this stage.
