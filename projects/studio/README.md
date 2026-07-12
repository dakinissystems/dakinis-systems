# Dakinis Studio — backend & catalog

> **Developer OS** cloud: Studio API + servicios desacoplados + runtimes multi-lenguaje.

| Path | Rol |
|------|-----|
| [`api/`](./api/) | Studio API facade (sessions, file sync) — Node 20+ |
| [`catalog/`](./catalog/) | Runtimes Docker + registro LSP (extensible) |
| [`docs/LANGUAGE-COMPATIBILITY.md`](./docs/LANGUAGE-COMPATIBILITY.md) | Compatibilidad con lenguajes actuales |

## Contratos

- OpenAPI 3.1: [`api/openapi.yaml`](./api/openapi.yaml)
- Referencia monorepo: [`../../docs/contracts/studio-api.json`](../../docs/contracts/studio-api.json)

## Gateway (futuro)

```
https://api.dakinissystems.com/studio/v1/*
wss://api.dakinissystems.com/studio/ws
```

Auth: JWT Dakinis (`platform/auth`) — mismo token que Hub/AkoeNet.

## Desarrollo local

```powershell
cd projects/studio/api
cp .env.example .env
npm install
npm run dev
# http://127.0.0.1:4090/health
```

## Cliente móvil

[`../dakinis-studio-mobile/`](../dakinis-studio-mobile/) consume este API.

## Principio multi-lenguaje

El API es **language-agnostic**:

- Archivos = paths UTF-8 + ops (patch/rename/move)
- `languageId` = convención VS Code (`.ts` → `typescript`)
- Build/run = comandos definidos por **runtime** en catálogo, no hardcoded en API
- Cualquier lenguaje con toolchain Linux → runtime `custom` o Docker Compose

Ver [`docs/LANGUAGE-COMPATIBILITY.md`](./docs/LANGUAGE-COMPATIBILITY.md).
