# Estándar documental Dakinis

> Cómo deben hablar los README y la docs canónica · madurez → [`STATUS.md`](./STATUS.md) · mapa → [`SYSTEMS.md`](./SYSTEMS.md)

## Vocabulario oficial

| Término | Significado |
|---------|-------------|
| **Dakinis Systems** | Empresa / organización |
| **Plataforma** | Capacidades compartidas (Auth, Gateway, Billing, Internal API, AI, Search, Notifications, Knowledge, DES) |
| **Producto** | Aplicación orientada a usuarios finales (Dakinis One, LifeFlow, StreamAutomator, AkoeNet, Hub, Landing, Tabletop…) |
| **Servicio** | Proceso desplegable (API, worker) que implementa plataforma o producto |
| **Paquete compartido** | Librería npm (DES / `dakinis-shared`), no un servicio Railway |
| **Dakinis One** | Nombre comercial del producto ERP / Business OS |
| **Core** | Nombre del código y repo (`dakinis-core`) de Dakinis One |
| **Orquestación** | Repo `dakinis-systems`: gateway, Docker, contratos, SQL, legal, scaffolds |

## Madurez (no mezclar)

| Símbolo | Significado |
|---------|-------------|
| 🟢 Production | En uso real / estable para el alcance documentado |
| 🟡 Beta | Desplegado; limitaciones conocidas |
| 🟠 MVP | Funcional acotado; no vender como completo |
| ⚪ Experimental | Prototipo; puede cambiar o apagarse |
| ⬜ Roadmap | Planificado; **no** afirmar que está listo |

**Regla:** código o endpoint ≠ producción. Solo [`STATUS.md`](./STATUS.md) es fuente de estado.

## Dominios HTTP canónicos

| Uso | URL |
|-----|-----|
| Gateway público | `https://api.dakinissystems.com/<prefix>/` |
| Prefijos | `/auth/`, `/core/`, `/billing/`, `/internal/`, `/search/`, `/notifications/`, `/knowledge/`, … |
| Productos | Dominios propios (`core.`, `hub.`, `akoenet.`, `streamautomator.com`, …) |

Usar **gateway** entre servicios cuando exista contrato. URLs directas Railway/DNS internos solo en ops privadas — no como API pública de producto.

Infra canónica de plataforma: **Railway** + **Cloudflare**. Mencionar Render u otros solo si sigue siendo un despliegue activo de ese producto, y etiquetarlo (canónico vs histórico).

## Jerarquía de docs

1. **Org GitHub** (`.github` profile) — marca y enlaces públicos  
2. **Orquestación** (`dakinis-systems`) — arquitectura, contratos, integración  
3. **Producto / servicio** — qué es, estado, uso, local  
4. **Canónica** (`docs/`) — STATUS, SYSTEMS, OPERATIONS, SECURITY, contracts, runbooks  

Los README de servicio/producto enlazan a canónica; no duplican tablas largas de todo el ecosistema.

## Plantilla README (servicios de plataforma)

Ver [`README-TEMPLATE-SERVICE.md`](./README-TEMPLATE-SERVICE.md).

## Enlace corto al ecosistema (copiar al final de README)

```markdown
## Docs canónicas

Estado → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) ·
Mapa → [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) ·
Ops → [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) ·
Índice → [docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs)
```
