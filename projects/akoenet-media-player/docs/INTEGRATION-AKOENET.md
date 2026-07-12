# Integración con AkoeNet

## Add-on vs módulo Assistant

| | Assistant Music | Media Player add-on |
|--|-----------------|---------------------|
| Alcance | Status / now playing | Reproductor completo |
| DMCA | Sin reproducción | Fuentes del usuario / licenciadas |
| UI | Panel servidor | Ventanas flotantes Winamp-style |
| Instalación | Toggle módulo | Marketplace + permisos servidor |

Ambos pueden coexistir: el Assistant muestra *what’s playing*; el add-on es quien reproduce.

---

## Puntos de integración

### 1. Registro del módulo (cliente)

```javascript
// apps/akoenet/Client/src/modules/registry.js
{
  id: 'dakinis-media-player',
  name: 'Media Player',
  route: '/media',
  icon: 'music-winamp',
  lazy: () => import('./media-player'),
  requiredAddon: true,
}
```

### 2. Sidebar / comando

- Entrada **Media** cuando el add-on está activo en el servidor.
- Slash command: `/media play`, `/media join`, `/media room`.

### 3. Voice channels

- Overlay opcional: “🎵 Synchronized” en canal de voz.
- **No** mezclar audio del reproductor en el canal SFU (fase 1); solo sync temporal.
- Fase 3: bot de relay solo en salas privadas con consentimiento.

### 4. Perfil / presencia

```
Friend listening...
▶ Christian — Daft Punk — One More Time
[Join Session]
```

API: `GET /users/:id/media-presence` o campo en presencia WS existente.

### 5. Permisos (servidor)

| Permiso | Descripción |
|---------|-------------|
| `media.use` | Abrir reproductor |
| `media.room.create` | Crear listen together |
| `media.library.upload` | Subir a biblioteca compartida |
| `media.admin` | Configurar add-on |

---

## Variables Railway (futuro)

**akoenet-backend**

```
MEDIA_ENABLED=true
MEDIA_WS_PATH=/media/ws
RADIO_BROWSER_API=https://de1.api.radio-browser.info
```

**akoenet-client (build)**

```
VITE_MEDIA_PLAYER_ENABLED=true
VITE_MEDIA_WS_URL=wss://api.akoenet.dakinissystems.com/media/ws
```

---

## Copiar scaffold → repo producto

1. Copiar `projects/akoenet-media-player/frontend/src/modules/media-player` → `apps/akoenet/Client/src/modules/media-player`.
2. Montar rutas en `App.jsx`.
3. Implementar rutas backend desde `projects/akoenet-media-player/backend/`.
4. Aplicar `database/schema.sql` en Supabase.
