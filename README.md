# Dakinis Systems — orquestación

Repositorio remoto: [github.com/dakinissystems/dakinis-systems](https://github.com/dakinissystems/dakinis-systems).

**No es el README de marca** (eso es el [perfil de organización](https://github.com/dakinissystems)). Aquí se versiona cómo se **conectan y operan** las piezas: gateway HTTP, Docker local, contratos, esquemas SQL, legal y scaffolds de plataforma.

Vocabulario y plantillas: [`docs/DOC-STANDARDS.md`](./docs/DOC-STANDARDS.md) · Estado real: [`docs/STATUS.md`](./docs/STATUS.md).

---

## Capas

| Capa | Qué es | Dónde vive |
|------|--------|------------|
| **Edge / infra** | Cloudflare, Gateway, Docker | `gateway/`, `docker/`, `infrastructure/` |
| **Plataforma** | Auth, Billing, Internal, AI, Search, Notifications, Knowledge, DES | repos propios + scaffolds aquí (`billing/`, `notifications/`, `search/`, …) |
| **Productos** | One (Core), LifeFlow, StreamAutomator, AkoeNet, Hub, Landing | repos Git bajo `apps/`, `platform/`, `hub/`, `finanzas/` (checkouts locales; no siempre en el remoto de orquestación) |
| **Paquetes** | DES / shared npm | `packages/` → canónico [`dakinis-shared`](https://github.com/dakinissystems/dakinis-shared) |

```text
Cloudflare → Gateway (api.dakinissystems.com)
                 │
    Auth · Hub · Productos (One · LifeFlow · SA · AkoeNet · …)
                 │
    Billing · Internal · AI · Search · Notifications · Knowledge
                 │
              DES (paquetes; no un servicio Railway)
```

Mapa detallado: [`docs/SYSTEMS.md`](./docs/SYSTEMS.md).

---

## Canónico vs copia de trabajo

| Componente | Fuente de verdad | Cómo sincronizar |
|------------|------------------|------------------|
| Contratos HTTP | `docs/contracts/` en este repo | Actualizar en el mismo PR que el gateway |
| Gateway rutas | `gateway/` | + `docs/rules.md` |
| DES / shared UI | [`dakinis-shared`](https://github.com/dakinissystems/dakinis-shared) | `packages/` es working copy → `.\scripts\push-dakinis-shared.ps1` / sync scripts |
| SQL / migraciones | `docs/supabase/migrations/` | Orden en `RUN-ORDER.md` |
| Estado go-live | `docs/STATUS.md` | Solo aquí |

---

## Arranque local

Requisitos: Docker Desktop, PowerShell.

```powershell
.\scripts\dev.ps1
```

Qué hace: crea `docker/.env` / `.env.dev` si faltan y levanta `compose.full.yml` + `compose.dev.yml` (stack local detrás del gateway).

Detalle: [`docker/README.md`](./docker/README.md) · Gateway: [`gateway/README.md`](./gateway/README.md)

Prefijos en `localhost:80` (dev): `/auth/`, `/core/`, `/streamautomator/`, `/akoenet/`, `/fitness/`, …

Comprobar: health del gateway y de un prefijo (p. ej. `/core/api/health` según compose).

---

## Integración — checklist

Antes de merge/deploy si tocas el borde HTTP:

1. [ ] Ruta en [`gateway/`](./gateway/)
2. [ ] Contrato en [`docs/contracts/`](./docs/contracts/)
3. [ ] Reglas en [`docs/rules.md`](./docs/rules.md)
4. [ ] Auth: JWT `sub` / `tenantId` / `role`; verify vía `/auth/verify` cuando aplique
5. [ ] Smoke health del servicio + prefijo gateway
6. [ ] Actualizar [`STATUS.md`](./docs/STATUS.md) si cambia madurez

Servicios de plataforma: plantilla [`docs/README-TEMPLATE-SERVICE.md`](./docs/README-TEMPLATE-SERVICE.md).

---

## Documentación

| Recurso | Contenido |
|---------|-----------|
| [`docs/README.md`](./docs/README.md) | Índice (source of truth) |
| [`docs/DOC-STANDARDS.md`](./docs/DOC-STANDARDS.md) | Vocabulario, madurez, dominios |
| [`docs/STATUS.md`](./docs/STATUS.md) | Estado / go-live |
| [`docs/SYSTEMS.md`](./docs/SYSTEMS.md) | Mapa productos y plataforma |
| [`docs/OPERATIONS.md`](./docs/OPERATIONS.md) | Deploy, health, monitorización |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Checklist seguridad |
| [`docs/RUNBOOKS/`](./docs/RUNBOOKS/) | Procedimientos |
| [`docs/contracts/`](./docs/contracts/) | Contratos HTTP |

> Este repo puede mencionar DNS internos y puertos para ops. **No** documentar secretos ni claves. En forks públicos, revisar qué detalle operativo se expone.
