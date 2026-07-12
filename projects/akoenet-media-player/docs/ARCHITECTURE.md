# Arquitectura — Dakinis Media Player

## Posición en la plataforma

```
Dakinis Platform
│
├── Core · Auth · Billing · AI · Gateway
│
├── AkoeNet
│   ├── Chat · Voice · Friends · Communities
│   ├── Assistant (módulos nativos)
│   └── Media Player ◄── add-on instalable (este proyecto)
│
└── Marketplace
        └── skins · plugins · “Listen together” packs
```

El reproductor **no sustituye** el módulo Music del Assistant (status / now playing sin DMCA). El add-on es **opt-in** por usuario o por servidor, con biblioteca propia y fuentes configurables (local, Jellyfin, radio, etc.).

---

## Capas

### 1. Cliente (AkoeNet)

```
apps/akoenet/Client/src/modules/media-player/
├── index.jsx                 # Registro add-on + lazy route
├── MediaPlayerRoot.jsx       # Provider + WindowManager host
├── components/               # Ventanas Winamp-style
├── hooks/                    # Player, playlist, EQ, visualizer
├── services/                 # audioEngine, mediaApi, syncSocket
├── store/                    # Zustand o context slices
└── skins/                    # Bundled + descargables
```

**Motor de audio:** Web Audio API (no `<audio>` plano).

```
Archivo / Stream
      ↓
  decodeAudioData (MP3/OGG/WAV vía browser; FLAC vía wasm opcional)
      ↓
  SourceNode → GainNode → BiquadFilterNode[] (10 bandas)
      ↓
  DynamicsCompressor (opcional) → AnalyserNode (visualizer)
      ↓
  AudioContext.destination
```

### 2. Backend (`services/media` o prefijo `/media` en akoenet-backend)

| Área | Responsabilidad |
|------|-----------------|
| `tracks` | Metadatos, URLs firmadas, no almacenar binarios en Fase 1 |
| `playlists` | CRUD + orden |
| `rooms` | “Listen together” — estado sincronizado |
| `streams` | Catálogo radios (Radio Browser API proxy) |
| `skins` | Manifest + CDN URL |
| `websocket` | Sync posición, play/pause, queue |

### 3. Dakinis Window Manager (compartido)

Paquete `@dakinis/window-manager` — ver [WINDOW-MANAGER.md](./WINDOW-MANAGER.md).

Ventanas del reproductor:

| ID | Ventana | Acoplable |
|----|---------|-----------|
| `player.main` | Reproductor principal | Sí (playlist, EQ) |
| `player.playlist` | Lista de reproducción | Sí |
| `player.eq` | Ecualizador 10 bandas | Sí |
| `player.library` | Biblioteca / carpetas | No |
| `player.visualizer` | Visualización | Sí |
| `player.queue` | Cola | Sí |
| `player.lyrics` | Letras (fase 2) | No |
| `player.mini` | Modo compacto | — |

### 4. Plugins (fase 3+)

```
plugins/
├── spotify-bridge/
├── jellyfin/
├── radio-browser/
├── lastfm-scrobble/
└── discord-presence/   # Rich presence vía AkoeNet, no Discord oficial
```

Contrato: manifest JSON + `registerSource()`, `registerUiPanel()`.

---

## Flujos clave

### Reproducción local / URL

1. Usuario elige track → cliente pide URL (o usa blob local).
2. `audioEngine.load(url)` → decode → graph.
3. Estado en `playerStore` → UI + opcional `PATCH /media/now-playing`.

### Escuchar juntos (Listen Together)

1. Host crea `listening_room` → WS room id.
2. Miembros del canal AkoeNet o amigos se unen (`room_members`).
3. Host es **leader**: emite `sync:state` (trackId, positionMs, playing).
4. Followers aplican drift correction (<500 ms) vía `audioEngine.seek()`.

### Add-on en servidor AkoeNet

1. Admin activa módulo **Media Player** en ajustes del servidor.
2. Aparece entrada en sidebar / comando `/media`.
3. Permisos: quién puede crear salas, subir biblioteca compartida, etc.

---

## Seguridad y legal

- **No** redistribuir catálogo con copyright; URLs del usuario o integraciones licenciadas (Spotify SDK, Jellyfin self-hosted).
- Signed URLs para archivos en storage Dakinis (fase 2).
- Rate limit en proxy de radio.
- CSP: `media-src` acotado en AkoeNet client.

---

## Dependencias de plataforma

| Servicio | Uso |
|----------|-----|
| `dakinis-auth` | JWT usuario |
| `akoenet-backend` | Servidor, canales, permisos |
| `dakinis-ai` (opcional) | Playlists generadas por IA |
| `dakinis-billing` (opcional) | Skins premium / storage |

---

## Referencia de implementación

Código scaffold en `../frontend/` y `../backend/` de este directorio.
