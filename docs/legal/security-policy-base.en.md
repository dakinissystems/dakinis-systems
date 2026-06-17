# Security policy (Dakinis ecosystem)

**Last updated:** 19 May 2026 · **Scope:** Dakinis Systems, Dakinis One, AkoeNet, StreamAutomator, and shared infrastructure

## 1. Technical security

| Area | Practice |
|------|----------|
| **Transport** | Mandatory HTTPS/TLS in production |
| **Passwords** | Secure hashing (bcrypt or equivalent); never stored in plain text |
| **Access control** | Role-based permissions (user, tenant/server admin, platform admin) |
| **Multi-tenant** | Isolation by `business_id` / tenant in API and database (Dakinis One) |
| **Backups** | Periodic PostgreSQL backups per operational procedure |
| **Monitoring** | Structured logging, incident review, and operational alerts |
| **API keys** | Hashed storage where applicable |

## 2. Organizational measures

- Production access limited to the operator
- Secret rotation if credentials leak
- Documented incident review

## 3. Vulnerabilities and incidents

Report security vulnerabilities or incidents to:

- **security@dakinis-systems.com**
- **legal@dakinis-systems.com**

B2B customers under a master agreement follow agreed notification timelines.

## 4. Limitation

No system is 100% secure. This policy describes reasonable measures, not an absolute guarantee.

## 5. Products

Each product may publish additional details on its domain (e.g. `/legal/seguridad` on AkoeNet, `/security` on Dakinis One).
