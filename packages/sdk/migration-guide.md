# Migrar a `@dakinis/sdk`

Guía corta: de `fetch` directo a Internal API → cliente de plataforma.

## Por qué

- Un solo lugar para auth de servicio, base URL y módulos (billing, workspace, events, metrics).
- QueryMap / CommandBus viven en Internal; el SDK es la puerta de productos.
- Lazy getters: cada producto carga solo lo que usa.

## Env

| Variable | Uso |
|----------|-----|
| `DAKINIS_INTERNAL_URL` | Base Internal (o gateway `/internal`) |
| `DAKINIS_INTERNAL_SERVICE_KEY` | Bearer service key |

## Antes (raw fetch)

```js
const res = await fetch(`${process.env.DAKINIS_INTERNAL_URL}/workspace/summary/${userId}`, {
  headers: { Authorization: `Bearer ${process.env.DAKINIS_INTERNAL_SERVICE_KEY}` },
});
const body = await res.json();
```

## Después (SDK)

```js
import { createDakinisPlatform } from "@dakinis/sdk";

const platform = createDakinisPlatform({
  baseUrl: process.env.DAKINIS_INTERNAL_URL,
  apiKey: process.env.DAKINIS_INTERNAL_SERVICE_KEY,
});

const summary = await platform.workspace.summary(userId);
const dash = await platform.hub.dashboardAggregated(userId, { fresh: true });
await platform.billing.plans();
platform.metrics();
```

## Hub (BFF Next)

Hub no empaqueta el monorepo SDK en Docker; usa el cliente liviano:

```js
import { createHubPlatform } from "../lib/dakinis-platform.js";

const platform = createHubPlatform({
  baseUrl: process.env.DAKINIS_INTERNAL_URL,
  apiKey: process.env.DAKINIS_INTERNAL_SERVICE_KEY,
});

await platform.workspace.acceptInvite(token, { userId });
await platform.hub.dashboard(userId);
```

Preferir ampliar `createHubPlatform` antes de nuevos `fetch` a Internal.

## StreamAutomator API

Sustituir `dakinisInternalFetch` por bootstrap local (o `@dakinis/sdk` cuando el Docker lo permita):

```js
// apps/api/src/lib/dakinis-platform.js
import { getPlatform } from "./dakinis-platform.js";

const platform = getPlatform();
await platform.knowledge.query({ query, context });
```

Luego outbox / billing sync / copilot usan `getPlatform()` en lugar de fetch ad-hoc.

## Background jobs

```js
import { background } from "@dakinis/shared-platform/background";

await background.enqueue("notifications.requested", { userId, template: "invite" });
await background.schedule("billing.reconcile", {}, Date.now() + 60_000);
await background.cancel(jobId);
```

No importar BullMQ desde productos.

## Checklist por PR

1. ¿El endpoint nuevo existe en Internal y (si aplica) en QueryMap / CommandBus?
2. ¿El producto llama SDK / Hub platform client — no `fetch` suelto?
3. ¿Eventos de dominio van a outbox (`*.v1`) en vez de acoplar productos?

## Orden de cutover sugerido

1. Hub server proxies restantes  
2. StreamAutomator `dakinisInternalClient`  
3. Core / LifeFlow (cuando toque integración Internal)
