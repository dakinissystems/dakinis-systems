# \<Nombre del servicio\>

> **Plantilla** para servicios de plataforma. Copiar a `README.md` del repo y rellenar. Vocabulario → [`DOC-STANDARDS.md`](./DOC-STANDARDS.md).

**Una línea:** qué hace y quién lo consume.

> **Estado:** 🟢 / 🟡 / 🟠 / ⚪ — una frase de limitaciones. Fuente: [STATUS](./STATUS.md).

| | |
|---|---|
| **GitHub** | `dakinissystems/<repo>` |
| **Gateway** | `https://api.dakinissystems.com/<prefix>/` |
| **Health** | `GET /<prefix>/health` |
| **Consumidores** | Hub, Core, … |
| **Contrato** | [`contracts/<name>.json`](./contracts/) |

## Propósito

- Problema que resuelve
- Qué **no** hace (límites)

## Estado de producción

| Capacidad | Madurez | Notas |
|-----------|---------|-------|
| … | 🟢/🟡/🟠/⬜ | … |

## Contrato HTTP (ejemplos)

```http
GET /health
Authorization: Bearer <service-key>   # si aplica
```

Errores relevantes, timeouts, auth entre servicios.

## Dependencias

- DB / Redis / colas / otros servicios
- Variables: ver `.env.example` (nunca secretos en el README)

## Local

```bash
npm install
cp .env.example .env
npm run dev
# worker si aplica:
npm run worker
```

Cómo verificar: `curl` health + un happy-path.

## Deploy

- Railway (API ± worker)
- Healthcheck path
- Runbook: enlace a `docs/RUNBOOKS/…`

## Seguridad

- Quién puede llamar (service key, JWT, roles)
- Qué no hacer (p. ej. no exponer al browser)

## Tests / aceptación

- Comando de test
- Criterio mínimo antes de merge/deploy

## Docs canónicas

Estado → [STATUS](./STATUS.md) · Mapa → [SYSTEMS](./SYSTEMS.md) · Ops → [OPERATIONS](./OPERATIONS.md) · Índice → [docs](./README.md)
