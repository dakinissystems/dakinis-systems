# Sentry — configuración Dakinis

> **No commitear el DSN** en Git. Usa variables de entorno en Railway y `.env.local`.

## Prioridad (tu stack)

| Servicio | SDK | Variable | Cuándo |
|----------|-----|----------|--------|
| **Core Back** | `@sentry/node` | `SENTRY_DSN` | Ya cableado — solo pegar DSN en Railway |
| **dakinis-auth** | `@sentry/node` | `SENTRY_DSN` | Ya cableado |
| **Core Front** (React) | `@sentry/react` | `VITE_SENTRY_DSN` | Build Vite — redeploy **Core Front** tras cambiar |
| AkoeNet Client | `@sentry/react` | `VITE_SENTRY_DSN` | ✅ Cableado — redeploy build |
| AkoeNet Server | `@sentry/node` | `SENTRY_DSN` | ✅ Cableado — health `sentry` |
| StreamAutomator API | `@sentry/node` | `SENTRY_DSN` | ✅ API + worker + scheduler |
| StreamAutomator Web | `@sentry/react` | `VITE_SENTRY_DSN` | ✅ Cableado — redeploy build |

**Health:** con DSN activo verás `"sentry": true` en `/health` (auth) y `/api/health` (core).

---

## 1. Crear proyectos en Sentry

Recomendado: **un proyecto por runtime**, no uno solo para todo:

- `dakinis-core-api` (Node)
- `dakinis-auth` (Node)
- `dakinis-core-web` (React)

O un solo proyecto Node si quieres simplificar al inicio (misma org, distintos `environment`).

Copia el **DSN** de cada proyecto (Settings → Client Keys).

---

## 2. Railway — backend (runtime)

### dakinis-auth

```env
SENTRY_DSN=https://...@....ingest.de.sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

Redeploy → `GET https://auth.dakinissystems.com/health` → `"sentry": true`.

### Core Back

```env
SENTRY_DSN=https://...@....ingest.de.sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_RELEASE=${{RAILWAY_GIT_COMMIT_SHA}}
```

Redeploy → `/api/health` → `"sentry": true`.

**No uses** `sendDefaultPii: true` en backend (ya está en `false` por defecto en nuestro init).

---

## 3. Railway — Core Front (React / Vite)

Variables de **build** (obligatorio redeploy del servicio Front):

```env
VITE_SENTRY_DSN=https://...@....ingest.de.sentry.io/...
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=${{RAILWAY_GIT_COMMIT_SHA}}
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE=0.05
VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE=1
```

Código: `platform/core/web/src/lib/sentry.js` + init en `main.jsx`.

Local: copia `platform/core/web/.env.example` → `.env.local` y rellena `VITE_SENTRY_DSN`.

```powershell
cd platform/core/web
npm install
npm run dev
```

---

## 4. Qué hace cada sample rate

| Variable | Valor recomendado | Efecto |
|----------|-------------------|--------|
| `SENTRY_TRACES_SAMPLE_RATE` / `VITE_*` | `0.1` | 10% performance traces (ahorra cuota Free) |
| `VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE` | `0.05` | 5% sesiones con replay |
| `VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE` | `1` | 100% replay cuando hay error |

---

## 5. Verify (botón Sentry)

Componente: `platform/core/web/src/components/DevSentryErrorButton.jsx`

| Entorno | Cuándo aparece "Break the world" |
|---------|----------------------------------|
| `npm run dev` | Sí, si `VITE_SENTRY_DSN` está en `.env.local` |
| Producción | **No** (salvo `VITE_SENTRY_TEST_BUTTON=true` en Railway — solo para verify puntual) |

Pasos:

1. `.env.local` con `VITE_SENTRY_DSN=...`
2. `npm run dev` → abre Core → botón rojo abajo a la derecha
3. Pulsa → revisa **Sentry → Issues**
4. En prod: no pongas `VITE_SENTRY_TEST_BUTTON` (o `false`)  

---

## 6. Qué ignorar al inicio

- Source maps avanzados (fase 2)
- `sendDefaultPii: true` (RGPD — evitar al principio)
- OpenTelemetry completo

---

## 7. AkoeNet y StreamAutomator (implementado)

| Producto | Archivo init | Health / verify |
|----------|--------------|-----------------|
| **AkoeNet Server** | `apps/akoenet/Server/src/lib/sentry.js` | `GET /health` → `sentry: true/false` |
| **AkoeNet Client** | `apps/akoenet/Client/src/lib/sentry.js` | `DevSentryErrorButton` (dev o `VITE_SENTRY_TEST_BUTTON=true`) |
| **StreamAutomator API** | `apps/streamautomator/apps/api/src/utils/sentry.js` | `GET /api/health` → `sentry` |
| **SA worker / scheduler** | mismo módulo, tags `streamautomator-worker` / `streamautomator-scheduler` | — |
| **StreamAutomator Web** | `apps/streamautomator/apps/web/src/lib/sentry.js` | botón test igual que Core |

Variables Railway (tras Core estable):

| Servicio | Variables |
|----------|-----------|
| akoenet-backend | `SENTRY_DSN`, `SENTRY_ENVIRONMENT=production` |
| akoenet-client | `VITE_SENTRY_DSN` (build) |
| streamautomator-api / worker / scheduler | `SENTRY_DSN` (mismo DSN; tag `service` en scope) |
| streamautomator-web | `VITE_SENTRY_DSN` (build) |

Patrón copiado de `platform/core/api/src/lib/sentry.js` y `platform/core/web/src/lib/sentry.js`.

---

## Referencias

- Init Core API: `platform/core/api/src/lib/sentry.js`
- Init Auth: `platform/auth/src/utils/sentry.js`
- Init Core Web: `platform/core/web/src/lib/sentry.js`
- AkoeNet: `apps/akoenet/Server/src/lib/sentry.js`, `apps/akoenet/Client/src/lib/sentry.js`
- StreamAutomator: `apps/streamautomator/apps/api/src/utils/sentry.js`, `apps/streamautomator/apps/web/src/lib/sentry.js`
