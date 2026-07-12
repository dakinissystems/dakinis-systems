# Motor de audio — Web Audio API

---

## Pipeline

```
Archivo / Stream URL
        ↓
   AudioContext
        ↓
  AudioBufferSourceNode  (o MediaElementSource + decode)
        ↓
     GainNode (volume)
        ↓
  BiquadFilterNode ×10  (equalizer bands)
        ↓
  Optional: Convolver (reverb), DynamicsCompressor (limiter)
        ↓
  AnalyserNode  → visualizer
        ↓
  AudioDestinationNode (output)
```

Implementación objetivo: `scaffold/frontend/services/audioEngine.js`.

---

## Formatos

| Formo | v1 | Notas |
|-------|----|-------|
| MP3 | ✅ | decodeAudioData |
| WAV | ✅ | |
| OGG | ✅ | |
| FLAC | ⚠️ | WASM decoder (ej. libflac.js) fase 2 |
| AAC | ⚠️ | Safari native; resto WASM |
| HLS radio | ✅ | `<audio>` hidden → MediaElementSource |

**Local files:** File API → blob URL → decode.  
**Remote:** signed URL desde `dakinis-media` o import Jellyfin plugin (fase 4).

---

## Ecualizador 10 bandas

Frecuencias estándar (Hz): 60, 170, 310, 600, 1k, 3k, 6k, 12k, 14k, 16k.

```js
const BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]
// BiquadFilterNode type 'peaking', Q ≈ 1.4
```

Presets: Flat, Rock, Pop, Jazz, Bass Boost, Vocal, Custom (persist user).

---

## Efectos (fases)

| Efecto | Fase |
|--------|------|
| Crossfade entre pistas | M2 |
| ReplayGain / normalización | M2 |
| Balance L/R | M1 |
| Limiter | M2 |
| Reverb | M3 |

---

## Visualizer

- `AnalyserNode.fftSize = 2048`
- Modos: spectrum bars, oscilloscope, “milkdrop-lite” canvas shader (M3)
- Throttle RAF cuando ventana oculta

---

## Streaming radio

```
GET /media/v1/streams/resolve?url=...
→ { playableUrl, title, format, icyMetadata }
```

Proxy en backend para ICY metadata y CORS; cliente solo reproduce URL permitida.

---

## Performance

- Un solo `AudioContext` por pestaña; resume on user gesture.
- Liberar `AudioBuffer` al cambiar pista.
- Worker opcional para decode off main thread (fase 2).
