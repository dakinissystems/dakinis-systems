# Tabletop (repo `dakinis-tabletop`) — Railway y DNS

## Servicios (2 deployments, mismo repo)

| Servicio | Root | Build | Start | Dominio |
|----------|------|-------|-------|---------|
| **Tabletop Web** | `/` | `npm run build` | `npm run start` | `tabletop.dakinissystems.com` |
| **Tabletop API** | `/` | — | `npm run start:api` | `tabletop-api.dakinissystems.com` |

Alternativa Web con root `web/`: Build `npm run build` · Start `npm run start` (desde `@dakinis/tabletop-web`).

---

## Tabletop Web

| Variable | Valor prod |
|----------|------------|
| `VITE_TABLETOP_API_URL` | `https://tabletop-api.dakinissystems.com` |
| `VITE_API_URL` | alias aceptado (mismo valor, con `https://`) |

⚠️ Tras cambiar variables, **redeploy obligatorio** (Vite las embebe en el build). Sin URL de API, el registro falla en silencio.

Build: `npm run build` · Start: `npm run start` · Salida: `web/dist` · Puerto: `8080`

**Errores habituales**

- Root `web` sin carpeta `web/` en el repo → falla Railpack.
- Start = `npm run build` → el deploy termina tras compilar; no sirve la SPA. Usar **`npm run start`**.

---

## Tabletop API

| Variable | Valor prod |
|----------|------------|
| `TABLETOP_JWT_SECRET` | secreto estable |
| `TABLETOP_DB_PATH` | ruta en volume persistente |
| `TABLETOP_CORS_ORIGINS` | `https://tabletop.dakinissystems.com,https://hub.dakinissystems.com` |

Start: `npm run start:api` · Health: `GET /health` → `{"ok":true,"service":"tabletop-api",...}`

Alias legacy: `DND_JWT_SECRET`, `DND_DB_PATH`, `DND_CORS_ORIGINS`.

---

## Cloudflare — checklist DNS (obligatorio)

`DNS_PROBE_FINISHED_NXDOMAIN` = **no existe registro DNS** para el subdominio. Railway solo no crea el CNAME en Cloudflare.

### 1. Dominio en Railway

Tabletop Web → **Settings → Networking → Custom Domain** → `tabletop.dakinissystems.com`  
Railway muestra un **target** tipo `tabletop-web-production-xxxx.up.railway.app` — cópialo.

### 2. Registro en Cloudflare (zona `dakinissystems.com`)

| Campo | Valor |
|-------|--------|
| Type | **CNAME** |
| Name | `tabletop` |
| Target | el hostname `*.up.railway.app` de Railway |
| Proxy | **DNS only** (nube gris) recomendado al principio |

Repite para la API cuando la despliegues:

| Name | Target |
|------|--------|
| `tabletop-api` | hostname Railway del servicio **Tabletop API** |

### 3. Verificar (espera 1–5 min)

```powershell
nslookup tabletop.dakinissystems.com
curl -4 -sI https://tabletop.dakinissystems.com/
```

Debe resolver (IP Cloudflare o Railway), no «Non-existent domain».

### 4. Railway — Start command

| Campo | Valor correcto |
|-------|----------------|
| Root Directory | `web` |
| Build | `npm run build` |
| **Start** | **`npm run start`** (no `npm run build`) |

O en Settings → **Config-as-code** → `web/railway.toml` (incluido en el repo).

---

## Cloudflare (SSL)

Misma convención que LifeFlow: CNAME a Railway. Preferible **DNS only** (nube gris) para Let's Encrypt de Railway.

No usar `api.tabletop.*` — usar **`tabletop-api.dakinissystems.com`** (wildcard Cloudflare).
