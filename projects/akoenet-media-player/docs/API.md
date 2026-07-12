# API — Media Player

Base: `https://api.akoenet.dakinissystems.com/media` (o gateway `/akoenet/media/`)

Auth: Bearer JWT AkoeNet / Dakinis IdP.

---

## REST

### Tracks

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tracks` | Biblioteca del usuario (paginado) |
| POST | `/tracks` | Registrar metadatos + upload URL |
| GET | `/tracks/:id` | Detalle |
| DELETE | `/tracks/:id` | Borrar registro |

### Playlists

| Método | Ruta |
|--------|------|
| GET | `/playlists` |
| POST | `/playlists` |
| GET | `/playlists/:id` |
| PATCH | `/playlists/:id` |
| DELETE | `/playlists/:id` |
| PUT | `/playlists/:id/tracks` | Reordenar (array de track ids) |

### Favorites

| Método | Ruta |
|--------|------|
| GET | `/favorites` |
| POST | `/favorites/:trackId` |
| DELETE | `/favorites/:trackId` |

### Listening rooms

| Método | Ruta |
|--------|------|
| POST | `/rooms` | Crear sala |
| GET | `/rooms/:id` | Estado actual |
| POST | `/rooms/:id/join` |
| POST | `/rooms/:id/leave` |
| PATCH | `/rooms/:id/state` | Solo leader |

### Streams (radio)

| Método | Ruta |
|--------|------|
| GET | `/streams/search?q=` | Proxy Radio Browser |
| GET | `/streams/favorites` | Radios guardadas |

### Skins

| Método | Ruta |
|--------|------|
| GET | `/skins` | Listado instalados + marketplace |
| GET | `/skins/:slug/manifest` |
| POST | `/skins/:slug/install` |

---

## WebSocket

Canal: `wss://api.akoenet.../media/ws?room=:roomId`

### Cliente → servidor

```json
{ "type": "sync:state", "trackId": "...", "positionMs": 120000, "playing": true }
{ "type": "sync:seek", "positionMs": 90000 }
{ "type": "chat:react", "emoji": "🎵" }
```

### Servidor → cliente

```json
{ "type": "room:state", "leaderId": "...", "state": { ... } }
{ "type": "member:join", "userId": "..." }
{ "type": "member:leave", "userId": "..." }
```

---

## Eventos plataforma (BullMQ, fase 2)

- `media.room.created`
- `media.track.played` → Assistant “now playing” en canal

Contrato OpenAPI: generar desde `backend/openapi.yaml` (pendiente).
