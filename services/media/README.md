# dakinis-media (dev scaffold)

API de referencia para el addon **Dakinis Media Player**. En producción irá a repo `dakinis-media` + Railway `media-api.dakinissystems.com`.

## Dev local

```powershell
# Terminal 1 — API (puerto 4090)
cd services/media
npm run dev

# Terminal 2 — AkoeNet client (proxy /media-api → localhost:4090)
cd apps/akoenet/Client
npm run dev
```

Abrir `http://localhost:5173/media` (requiere login AkoeNet).

## Endpoints

- `GET /health`
- `GET /media/tracks` (Bearer JWT)
- Ver contrato: [`projects/media-player/contracts/media-api.json`](../projects/media-player/contracts/media-api.json)

## UI

Implementación en `apps/akoenet/Client/src/modules/media-player/`.
