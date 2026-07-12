# Marketplace — addon y plugins

---

## Addon principal

| Campo | Valor |
|-------|-------|
| slug | `akoenet-media-player` |
| type | `akoenet-addon` |
| name | Dakinis Media Player |
| requires | AkoeNet ≥ 1.6, Auth IdP |
| billing_sku | `addon_media_player` (opcional Pro) |

Instalación:

1. Usuario → Hub Marketplace o AkoeNet Store.
2. `POST /internal/marketplace/install` → flag en `akoenet.server_modules`.
3. Client carga chunk `media-player` lazy.

Desinstalación: oculta UI; datos `media.*` del usuario persisten.

---

## Tipos de extensiones

| type | Ejemplo |
|------|---------|
| `media-skin` | Cyberpunk, Matrix |
| `media-plugin-source` | Jellyfin, Radio Browser |
| `media-plugin-export` | Last.fm scrobble |
| `media-plugin-presence` | Discord Rich Presence (desktop) |

Manifest plugin:

```json
{
  "id": "plugin/jellyfin",
  "type": "media-plugin-source",
  "permissions": ["network:jellyfin.example.com", "storage:preferences"],
  "entry": "dist/index.js",
  "apiVersion": 1
}
```

Sandbox v1: plugins solo **source providers** (lista tracks), sin eval arbitrario en web — iframe/worker en fase posterior.

---

## Skins en marketplace

- Pack oficial Dakinis (gratis).
- Community (review queue).
- Revenue share 70/30 futuro (Billing).

---

## API marketplace (Internal)

```
GET  /internal/marketplace/addons?product=akoenet
POST /internal/marketplace/servers/:id/modules/media-player
```

Estado en DB:

```sql
akoenet.server_modules (server_id, module_key, enabled, config jsonb)
-- module_key = 'media_player'
```

---

## Relación con Hub

Hub tile opcional “Media” → deep link `akoenet://media` o URL `https://akoenet.../media`.

Widget “Now playing en el servidor” para admins (fase 3).
