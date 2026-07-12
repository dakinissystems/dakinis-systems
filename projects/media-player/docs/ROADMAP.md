# Roadmap — Dakinis Media Player

---

## Fase 0 — Diseño (actual)

- [x] Carpeta proyecto + arquitectura
- [x] Schema SQL + contrato API
- [x] Scaffold árbol frontend/backend
- [ ] ADR en `docs/adr/ADR-0xx-media-player.md`
- [ ] Aprobación producto / legal DMCA

---

## Fase 1 — MVP “Winamp feel” (8–10 semanas)

**Objetivo:** reproductor personal usable, sin salas sync.

| Entrega | Detalle |
|---------|---------|
| DWM básico | drag, persist layout |
| Main + Playlist + EQ | 10 bandas Web Audio |
| Local files | drag-drop, cola |
| Mini player | shade mode |
| Skin Dakinis + Classic | 2 temas |
| API mínima | playlists CRUD metadata |
| Ruta `/media` | lazy en akoenet-client |

**No incluye:** plugins, marketplace, listen together.

---

## Fase 2 — AkoeNet social (4–6 semanas)

| Entrega | Detalle |
|---------|---------|
| Listening rooms | WebSocket sync |
| Presence | now playing en amigos |
| Canal voz | panel “escuchar juntos” |
| Radio | stream resolver + ICY |
| FLAC decode | WASM |

---

## Fase 3 — Pulido + IA (4 semanas)

| Entrega | Detalle |
|---------|---------|
| Visualizer milkdrop-lite | |
| AI playlists | Dakinis AI |
| Letras sincronizadas | LRCLIB / AI |
| Marketplace skins | install flow |
| `@dakinis/window-manager` | package extract |

---

## Fase 4 — Plugins + desktop (ongoing)

| Entrega | Detalle |
|---------|---------|
| Jellyfin / Plex source | |
| Spotify Connect (OAuth) | |
| Tauri mini player always-on-top | |
| Community plugins SDK | |
| Modo “Dakinis Desktop” | multi-app DWM |

---

## Métricas éxito

| Métrica | MVP | 6 meses |
|---------|-----|---------|
| Usuarios con addon activo | 50 beta | 500 |
| Tiempo sesión media | 15 min | 25 min |
| Salas sync / semana | — | 100 |
| Skins community | 2 | 20 |

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| DMCA | solo user content + licensed radio |
| Performance mobile | visualizer off, mini UI |
| Sync drift | NTP + leader correction |
| Scope creep | Fase 1 estricta |
