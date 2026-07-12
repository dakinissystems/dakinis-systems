# Dakinis Media Player — addon AkoeNet

> Reproductor inspirado en Winamp (estética retro, ventanas flotantes) integrado en AkoeNet como **addon instalable**, no como página tradicional.

**Identidad:** nostálgico por fuera, moderno por dentro — Web Audio API, salas “escuchar juntos”, skins de comunidad, plugins opcionales.

---

## Documentación

| Doc | Contenido |
|-----|-----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Capas, repos, gateway, realtime |
| [docs/WINDOW-MANAGER.md](./docs/WINDOW-MANAGER.md) | Gestor de ventanas reutilizable (DWM) |
| [docs/AUDIO-ENGINE.md](./docs/AUDIO-ENGINE.md) | Pipeline Web Audio + formatos |
| [docs/SKINS.md](./docs/SKINS.md) | Sistema de skins (.dskin / manifest) |
| [docs/DATABASE.md](./docs/DATABASE.md) | Schema `media` en Supabase |
| [docs/INTEGRATION-AKOENET.md](./docs/INTEGRATION-AKOENET.md) | Rutas, voz, amigos, marketplace |
| [docs/MARKETPLACE.md](./docs/MARKETPLACE.md) | Registro del addon y plugins |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Fases MVP → comunidad |

## Artefactos

| Path | Uso |
|------|-----|
| [schemas/001_media.sql](./schemas/001_media.sql) | Migración Supabase inicial |
| [contracts/media-api.json](./contracts/media-api.json) | Contrato gateway `/media/` |
| [examples/skin-classic/](./examples/skin-classic/) | Skin de referencia |
| [scaffold/](./scaffold/) | Árbol de carpetas objetivo (frontend + backend) |

## Repos previstos (fase 2+)

| Repo GitHub | Rol |
|-------------|-----|
| `dakinis-media` (nuevo) | API + WebSocket salas + metadata |
| `akoenet-client` | Módulo UI `modules/media-player/` |
| `dakinis-systems` | Contratos, SQL, gateway `/media/` |

## Quick start (dev)

```powershell
# API + client (desde raíz dakinis-systems)
.\scripts\dev-media-player.ps1

# O por separado:
cd services/media && npm run dev          # :4090
cd apps/akoenet/Client && npm run dev       # :5173 → /media
```

UI integrada en `apps/akoenet/Client/src/modules/media-player/`.

## Nota legal / producto

No clonar Winamp ni usar marca “Winamp”. Inspiración visual + UX propia (**Dakinis Media Player**).  
Música: biblioteca del usuario, streams con licencia, radios públicas — ver [docs/INTEGRATION-AKOENET.md](./docs/INTEGRATION-AKOENET.md) § DMCA.
