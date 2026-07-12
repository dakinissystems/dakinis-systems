# Dakinis Media Player — Add-on AkoeNet

> Reproductor inspirado en Winamp (estética retro, UX moderna) · módulo instalable del ecosistema Dakinis.

**No es un clon de Winamp.** Es un **Dakinis Media Player** con ventanas flotantes, skins, Web Audio API e integración social de AkoeNet.

---

## Repos y despliegue (objetivo)

| Pieza | Repo / servicio | Notas |
|-------|-----------------|-------|
| UI + motor cliente | `akoenet-client` → `src/modules/media-player/` | Add-on; ruta `/media` o panel flotante |
| API + salas | Nuevo `akoenet-media` o extensión `akoenet-backend` | Fase 1: playlists + biblioteca |
| Esquema DB | `dakinis-systems` → `supabase/migrations/` | Schema `akoenet` o `media` |
| Skins marketplace | Hub Marketplace (futuro) | Manifest `.dskin` / JSON |
| Window Manager | `@dakinis/window-manager` (este monorepo) | Reutilizable en CRM, Terminal, etc. |

---

## Documentación

| Doc | Contenido |
|-----|-----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Capas, flujos, integración plataforma |
| [docs/WINDOW-MANAGER.md](./docs/WINDOW-MANAGER.md) | Gestor de ventanas flotantes (Dakinis WM) |
| [docs/DATABASE.md](./docs/DATABASE.md) | Tablas y relaciones |
| [docs/API.md](./docs/API.md) | REST + WebSocket |
| [docs/INTEGRATION-AKOENET.md](./docs/INTEGRATION-AKOENET.md) | Voice, canales, “escuchar juntos” |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Fases MVP → Marketplace |
| [docs/SKINS.md](./docs/SKINS.md) | Formato de skins y assets |

---

## Scaffold en esta carpeta

```
projects/akoenet-media-player/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── WINDOW-MANAGER.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── INTEGRATION-AKOENET.md
│   ├── ROADMAP.md
│   └── SKINS.md
├── database/schema.sql
├── backend/                    # API referencia (Node, puerto 4090)
│   ├── openapi.yaml
│   └── src/
├── frontend/                   # Módulo React (copiar a akoenet-client)
│   └── src/modules/media-player/
├── packages/window-manager/    # @dakinis/window-manager
└── skins/classic/              # Skin Classic (.dskin manifest)
```

Migración Supabase: `docs/supabase/migrations/034_akoenet_media_player.sql`

---

## Quick start (desarrollo local)

```powershell
# Backend referencia
cd projects/akoenet-media-player/backend
npm run dev
# GET http://localhost:4090/health
# GET http://localhost:4090/media/tracks  (Header: Authorization: Bearer demo)

# Frontend — copiar frontend/src/modules/media-player/ a akoenet-client y registrar ruta /media
cd apps/akoenet/Client
npm run dev
```

---

## Identidad visual

- Paleta **Dakinis** + modo **Classic** (verde fosforescente sobre gris oscuro).
- Tipografía: bitmap-style opcional en skins retro; Inter/system en skin Dakinis.
- Iconografía: ventanas acoplables, barra de título clásica, ecualizador de 10 bandas.

---

*Julio 2026 · Dakinis Systems*
