# Scaffold — Frontend (akoenet-client)

> Destino: `apps/akoenet/Client/src/modules/media-player/`  
> Copiar/adaptar al iniciar Fase 1.

## Árbol objetivo

```
media-player/
├── index.jsx                 # Entry: lazy route + WindowManagerProvider
├── MediaPlayerApp.jsx        # Shell DWM + skin loader
│
├── components/
│   ├── windows/
│   │   ├── MainWindow.jsx    # Transport, seek, volume, shade
│   │   ├── PlaylistWindow.jsx
│   │   ├── EqualizerWindow.jsx
│   │   ├── LibraryWindow.jsx
│   │   ├── VisualizerWindow.jsx
│   │   ├── LyricsWindow.jsx
│   │   ├── QueueWindow.jsx
│   │   └── SettingsWindow.jsx
│   ├── chrome/
│   │   ├── MiniPlayer.jsx
│   │   ├── TitleBar.jsx
│   │   └── WindowFrame.jsx   # drag, resize, snap
│   ├── player/
│   │   ├── TransportControls.jsx
│   │   ├── SeekBar.jsx
│   │   ├── VolumeSlider.jsx
│   │   └── NowPlayingMarquee.jsx
│   ├── social/
│   │   ├── ListenTogetherPanel.jsx
│   │   └── FriendNowPlaying.jsx
│   └── SkinRenderer.jsx      # manifest → sprites + metrics
│
├── hooks/
│   ├── usePlayer.js
│   ├── usePlaylist.js
│   ├── useEqualizer.js
│   ├── useVisualizer.js
│   ├── useListeningRoom.js
│   └── useSkin.js
│
├── services/
│   ├── audioEngine.js        # Web Audio graph (ver docs/AUDIO-ENGINE.md)
│   ├── websocket.js          # room sync
│   ├── mediaApi.js           # REST /media/v1/*
│   └── localLibrary.js       # IndexedDB + File API
│
├── store/
│   ├── playerStore.js        # zustand: playback state
│   ├── queueStore.js
│   ├── skinStore.js
│   └── windowLayoutStore.js  # positions, visibility, shade
│
├── skins/
│   ├── Classic/
│   ├── Neon/
│   ├── Dakinis/
│   └── Minimal/
│
├── plugins/                    # fase 4 — dynamic import registry
│   └── registry.js
│
└── styles/
    └── media-player.css      # fallback cuando skin no define asset
```

## Dependencias sugeridas

| Paquete | Uso |
|---------|-----|
| `zustand` | stores (ya en client?) |
| `@dakinis/window-manager` | extract DWM (fase 3) |
| `howler` | opcional fallback decode |
| `music-metadata-browser` | tags ID3/FLAC header |

## Montaje

```jsx
// index.jsx
export default function MediaPlayerModule() {
  return (
    <WindowManagerProvider namespace="media-player">
      <MediaPlayerApp />
    </WindowManagerProvider>
  )
}
```

## Env

```
VITE_MEDIA_API_URL=https://api.dakinissystems.com/media
VITE_MEDIA_WS_URL=wss://media-api.dakinissystems.com/v1/ws
```
