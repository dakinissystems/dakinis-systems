# Integración AkoeNet

---

## Montaje en el cliente

```jsx
// apps/akoenet/Client/src/App.jsx (futuro)
const MediaPlayerApp = lazy(() => import('./modules/media-player'))

<Route path="/media/*" element={<MediaPlayerApp />} />
```

Launcher:

- Sidebar: icono 🎵 “Media” (si addon instalado).
- Assistant panel: módulo **Music Player** reemplaza “solo status”.
- Amigo: “Christian está escuchando…” en presence card.

---

## Presencia “Now Playing”

```json
{
  "activity": "listening",
  "media": {
    "trackId": "uuid",
    "title": "One More Time",
    "artist": "Daft Punk",
    "roomId": "uuid-or-null",
    "startedAt": "2026-07-12T06:00:00Z"
  }
}
```

Publicado vía:

1. Client → `PATCH /auth/presence` (akoenet-backend) o
2. WebSocket media → backend bridge (fase 2).

UI amigo:

```
▶ Christian
Now Playing: Daft Punk — One More Time
[Join Session]
```

---

## Canales de voz

Panel en canal activo:

```
🎵 Música sincronizada
Hans Zimmer — Time
[Escuchar juntos]  [Abrir player]
```

- `voice_channel.media_room_id` en metadata de canal (JSON).
- No inyectar audio en SFU v1 — sync por WebSocket (ver ARCHITECTURE).

---

## Permisos

| Acción | Rol mínimo |
|--------|------------|
| Abrir player | miembro servidor |
| Crear sala sync | Connect + |
| DJ (skip track) | rol `dj` o owner sala |
| Subir tracks a servidor | Admin o canal dedicado #music |

Reutilizar `akoenet.server_members` + flags en `media.server_settings`.

---

## DMCA / contenido

| Permitido v1 | Evitar v1 |
|--------------|-----------|
| Archivos locales del usuario | Scraping Spotify/YT |
| Radio streams licenciados | Bot música en canal 24/7 con catálogo comercial |
| Metadata scrobble | Re-host MP3 de terceros |

Plugins Spotify/Jellyfin (fase 4) usan OAuth del usuario — el stream va del proveedor al cliente, no por servidor Dakinis.

---

## Variables Railway (futuro)

**dakinis-media**

| Variable | Ejemplo |
|----------|---------|
| `DATABASE_URL` | Supabase pooler |
| `POSTGRES_SCHEMA` | `media` |
| `CORS_ORIGINS` | `https://akoenet.dakinissystems.com` |
| `DAKINIS_AUTH_URL` | `https://auth.dakinissystems.com` |
| `REDIS_URL` | salas WS pub/sub |
| `R2_*` | opcional uploads |

**akoenet-client**

| Variable | Ejemplo |
|----------|---------|
| `VITE_MEDIA_API_URL` | `https://api.dakinissystems.com/media` |
| `VITE_MEDIA_WS_URL` | `wss://media-api.../v1/ws` |

---

## Gateway

Añadir en `gateway/routes/default.conf`:

```
location /media/ {
  proxy_pass https://media-api.dakinissystems.com;
  ...
}
```

Contrato: [../contracts/media-api.json](../contracts/media-api.json).
