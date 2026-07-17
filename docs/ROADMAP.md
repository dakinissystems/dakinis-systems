# Dakinis — Roadmap 2026

> Julio 2026 · **Estado hoy** → [`STATUS.md`](./STATUS.md) · **Negocio** → [`company/STRATEGY.md`](./company/STRATEGY.md)

**Pregunta guía:** *¿Qué necesita un cliente para pagar por Dakinis este mes?*

---

## Negocio (CEO)

| Mes | Objetivo clave |
|-----|----------------|
| **Jul** | Billing E2E · SSO E2E · **primer piloto** Hub+Core |
| **Ago** | Hub como escritorio · screenshot real en landing · **primer cliente de pago** |
| **Sep** | Workspace Admin validado · LifeFlow → PostgreSQL · AkoeNet `@AI` prod |
| **Q4** | Automatizaciones Hub · hire Full Stack · Marketplace **solo si clientes lo piden** |

**Riesgo principal:** más features antes de validación comercial.

---

## Julio 2026 — Go-live

| Hito | Owner | Done cuando |
|------|-------|-------------|
| Billing E2E live | Platform | Ver STATUS § Billing E2E |
| Hub SSO E2E automatizado | Platform | `smoke-prod-suite.ps1 -E2E` |
| Redeploys AkoeNet + Internal API | Social / Platform | Vars + health OK |
| migr. `034` RLS | Platform | Security Advisor limpio |
| Primer piloto (Hub + Core) | GTM + ERP | Ver STATUS § piloto |

**No iniciar:** Marketplace · nuevos servicios Railway · features sin cliente.

---

## Agosto 2026 — Producto vendible

| Hito | Owner | Done cuando |
|------|-------|-------------|
| Hub demo empieza en Mi día | Platform | Acciones + widgets reales |
| Screenshot Hub real en landing | GTM | `showcase/hub.png` |
| migr. `016`–`019` + `027`–`029` | Platform | Mi día sin stub |
| Invitar miembro E2E | Platform | Email + aceptación |
| Portal Billing en `/admin` | Platform | Tras Billing E2E |
| Primer cliente de pago | GTM | MRR &gt; 0 |
| Observabilidad base | Platform | Sentry + alerta smoke |

---

## Septiembre 2026 — Escalar piloto

| Hito | Owner |
|------|-------|
| Hub Workspace Admin con ≥2 workspaces | Platform |
| LifeFlow → PostgreSQL + migr. `030` | Finance |
| AkoeNet `@AI` real en prod | Social |
| Super Admin panel (si &gt;5 clientes) | Platform |
| Staging Railway (espejo prod) | Platform |

---

## Q4 2026 — Post-validación

| Mes | Foco |
|-----|------|
| Oct | Automatizaciones Hub (eventos → webhooks) |
| Nov | Contratar Full Stack #1 |
| Dic | Banking agregado · Marketplace **solo bajo demanda** |

---

## Capacidades — orden de implementación

### 1. Cobrar (jul–ago)

```
Billing → Stripe webhook → Hub /admin → Auth → Gateway
```

### 2. Invitar equipo (ago)

```
Hub /admin → Internal API /workspaces → Notifications → Resend
```

### 3. Hub como OS (ago–sep)

```
Mi día · acciones recomendadas · widgets → Internal API → hub.v1_*
```

### 4. IA unificada (sep–Q4)

```
Copilot global → AI → Knowledge → BullMQ → Assistant
```

### 5. Automatizaciones (Q4+)

```
Events → Internal API → product webhooks
```

---

## Backlog Supabase (orden)

1. ~~`034` RLS~~ ✅ · ~~`016`–`019` Hub~~ ✅ · ~~`027`–`029` Mi día~~ ✅ · ~~`030` LifeFlow links~~ ✅
2. `015b` — AkoeNet backfill (cuando cutover)
3. `dakinis_core_prod` → `core` (sep, con ventana)
4. Cutover LifeFlow goals/tx SQLite → PG (post-piloto)

---

## Métricas técnicas objetivo (Q4)

| Métrica | Hoy | Objetivo |
|---------|-----|----------|
| Deploy success rate | ~95% | 99% |
| Smoke prod diario | manual | CI scheduled |
| Cobertura tests (platform) | baja | 40% rutas críticas |
| MTTR incidencia Billing | — | &lt;1h |
| Workers BullMQ activos | parcial | 100% colas prod |

---

*Revisar semanalmente con [`STATUS.md`](./STATUS.md).*
