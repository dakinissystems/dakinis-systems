# Scaffold — Backend (dakinis-media)

> Destino: repo `dakinis-media` → `services/media/` o raíz del repo  
> Copiar al crear el servicio Railway.

## Árbol objetivo

```
dakinis-media/
├── src/
│   ├── index.js              # Fastify/Express bootstrap
│   ├── config.js
│   │
│   ├── routes/
│   │   ├── health.js
│   │   ├── tracks.js
│   │   ├── playlists.js
│   │   ├── favorites.js
│   │   ├── rooms.js
│   │   ├── streams.js
│   │   └── skins.js
│   │
│   ├── controllers/
│   │   ├── tracksController.js
│   │   ├── playlistsController.js
│   │   └── roomsController.js
│   │
│   ├── services/
│   │   ├── trackService.js
│   │   ├── playlistService.js
│   │   ├── roomService.js
│   │   ├── streamResolver.js   # ICY / radio metadata
│   │   └── storageService.js   # R2 signed URLs
│   │
│   ├── websocket/
│   │   ├── server.js
│   │   ├── roomHandler.js
│   │   └── syncProtocol.js
│   │
│   ├── workers/
│   │   └── scanLibrary.js      # optional: metadata scan
│   │
│   ├── models/
│   │   └── queries.js          # SQL schema media.*
│   │
│   └── middleware/
│       ├── auth.js             # JWT IdP
│       └── rateLimit.js
│
├── Dockerfile
├── railway.toml
├── package.json
└── .env.example
```

## Stack sugerido

| Pieza | Elección |
|-------|----------|
| Runtime | Node 22 |
| HTTP | Fastify |
| WS | `@fastify/websocket` o `ws` + Redis pub/sub |
| DB | `pg` pool → schema `media` |
| Auth | verify JWT vía `DAKINIS_AUTH_URL` |

## Env (.env.example)

```env
PORT=4090
DATABASE_URL=
POSTGRES_SCHEMA=media
DAKINIS_AUTH_URL=https://auth.dakinissystems.com
CORS_ORIGINS=https://akoenet.dakinissystems.com
REDIS_URL=
R2_ENDPOINT=
R2_BUCKET=
R2_ACCESS_KEY=
R2_SECRET_KEY=
```

## Gateway

Prefijo: `/media/` → ver [contracts/media-api.json](../../contracts/media-api.json)

## Health

```
GET /health → 200 { "ok": true, "service": "dakinis-media" }
```
