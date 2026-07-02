# dakinis-tabletop

**Producto público:** Dakinis Tabletop · **Hub:** 🎲 Tabletop  
**Web:** `tabletop.dakinissystems.com` · **API:** `tabletop-api.dakinissystems.com`  
**Estado:** MVP (reglas SRD 5e como primer ruleset)

Modern tabletop RPG platform with character management, campaigns, and cross-device synchronization.

Plataforma de rol de mesa para Dakinis Systems: gestión de personajes, campañas compartidas, sincronización en nube y modo offline.

> Carpeta local en el monorepo de orquestación: `DND/` (nombre interno). Repositorio GitHub: [`dakinissystems/dakinis-tabletop`](https://github.com/dakinissystems/dakinis-tabletop).

## Características

- **Cuenta opcional** — registro/login, personajes en nube, merge con datos locales
- **Modo offline** — continuar sin cuenta (`localStorage`)
- **Ficha completa** — atributos, clase, raza, combate, magia, arsenal (SRD 5e MVP)
- **Campañas** — código de invitación, notas de sesión y botín compartido
- **Notas y dados** — diario por personaje, tirador d4–d100
- **Backup** — export/import JSON, PDF, migrador legacy Flask

## Arranque local

```powershell
cd DND   # o clon: dakinis-tabletop
npm install
npm run dev
```

- Web: `http://localhost:5174`
- API: `http://localhost:4200` (proxy Vite `/api` → API)

## Estructura (MVP)

```
dakinis-tabletop/
├── api/                # @dakinis/tabletop-api — Express + SQLite
├── web/                # @dakinis/tabletop-web — React 19 + Vite PWA
│   └── src/
├── scripts/
└── package.json        # workspaces
```

Evolución: `packages/shared/` · Supabase schema `tabletop`.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `TABLETOP_JWT_SECRET` | JWT producción (alias legacy: `DND_JWT_SECRET`) |
| `TABLETOP_DB_PATH` | Ruta SQLite con volume (alias: `DND_DB_PATH`) |
| `TABLETOP_CORS_ORIGINS` | Orígenes CORS (alias: `DND_CORS_ORIGINS`) |
| `VITE_TABLETOP_API_URL` | URL API en build web (vacío = proxy dev) |

## Build producción

```powershell
npm run build
npm run preview
```

## Legal

Privacidad, términos, aviso legal y atribución OGL/SRD in-app. El producto **Tabletop** no está afiliado a Wizards of the Coast; el MVP incluye contenido SRD 5e bajo OGL.

## Supabase (roadmap)

Schema reservado: `tabletop` — migración desde SQLite cuando el MVP esté en prod.
