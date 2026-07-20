## Summary

<!-- Qué cambia y por qué (1–3 frases). -->

## Security Review

Aplicar si el PR toca APIs, datos de tenant, secretos o auth (ver `docs/SECURITY-OPS.md`).

**Nueva API / endpoint**

- [ ] Auth (quién puede llamar)
- [ ] Rate limit (zona nginx o app)
- [ ] Audit (acción sensible → evento)
- [ ] RBAC / scopes (mínimo privilegio)
- [ ] Input validation
- [ ] Output validation (sin campos internos)
- [ ] Logging (sin secretos ni PII innecesaria)
- [ ] Tests (happy path + 401/403)

**Nueva tabla / migración**

- [ ] RLS / deny anon-authenticated si aplica
- [ ] Clasificación de datos (Confidencial / Crítico)
- [ ] Sin secretos en SQL ni seeds de prod

**Nuevo secreto / integración**

- [ ] Solo en Railway / GitHub Secrets
- [ ] Nombre en `docs/railway.env.example` **sin valor**
- [ ] Plan de rotación (tabla P1 en SECURITY-OPS)

## Test plan

- [ ] 
