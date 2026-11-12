# Inventario en D:\ — tecnologías y mejoras

La carpeta principal es `D:\dakinis-systems`. El workspace es `dakinis-systems.code-workspace` (Core, Docs, AkoeNet, StreamAutomator). `D:\dakinis-systems-wt-ops` queda aparte: es otro checkout del mismo repo y no se usa como tercera copia. Este archivo no sustituye a [`STATUS.md`](./STATUS.md).

Decisión de producto: no se amplía el ecosistema. El circuito que hay que cerrar está en [`RUNBOOKS/circuito-comercial.md`](./RUNBOOKS/circuito-comercial.md). Esfuerzo mientras no haya un cliente de pago: One 60 %, productos independientes 20 %, juegos 15 %, experimentos 5 %.

Fuentes: carpetas de `D:\dakinis-systems` el 11 nov 2026.

## Una sola copia

Se quitó `dakinis-systems-control\`, un clon del propio repo parado en mayo 2026. El commit ya estaba en el historial de esta carpeta. El cambio está en el índice y no está commiteado.

Estas parejas son el mismo remoto y **no** se borraron: las historias no se contienen una a la otra. Borrar una pierde commits.

| Queda como copia de trabajo | La otra copia | Por qué siguen las dos |
|---|---|---|
| `platform\ai` | `ai\` | Mismo repo `dakinis-ai`, commits distintos del 10 oct, las dos limpias |
| `apps\streamautomator` | `D:\dakinis-streamautomator` | La de dentro es del 10 oct; la de `D:\` es del 5 jul e incluye Hub SSO que no está en la otra |
| `platform\shared` | `D:\dakinis-shared` | La de `D:\` es más nueva (9 jul) y está limpia. La de `platform\shared` es de mayo y tiene un cambio local |
| `apps\akoenet` | `D:\AkoNet` | No es el mismo remoto. `D:\AkoNet` apunta a `ChristianDVillar/Akoenet` y tiene cambios sin commit |
| `DND\` | `D:\DND` | El de dentro es `dakinis-tabletop`. `D:\DND` es el generador Flask, sin git |

`billing\`, `notifications\`, `search\`, `internal\`, `knowledge\`, `hub\`, `finanzas\` y `platform\auth` aparecen una sola vez dentro de esta carpeta.

La preparación técnica de la plataforma está en ~90 %. La comercial, en ~55 %, con 0 clientes de pago. Los juegos no sustituyen ese frente.

---

## Plataforma

| Sistema | Dónde en D:\ | Tecnologías | Mejora |
|---|---|---|---|
| Orquestación | `D:\dakinis-systems` | Node.js, Docker, gateway nginx, scripts PowerShell, Supabase, Railway, Cloudflare | La fuente de despliegue de Billing, Notifications, Search, Knowledge e Internal es el repo privado homónimo, no una segunda carpeta. |
| Gateway | dentro de este repo | nginx, `api.dakinissystems.com` | Sin hueco de producto. El mapa de producción es Railway + Cloudflare. |
| Auth | `D:\dakinis-systems\platform\auth` | Node.js, Express, PostgreSQL, JWT (`sub`, `tenantId`, `role`), bcrypt | El README manda a ejecutar `docs/supabase-schema.sql` y esa carpeta no está en el repo. Corregir la guía, no rediseñar el servicio. |
| Hub | `D:\dakinis-systems\hub` | Vite, Node, BFF propio, Internal API. `web/` sigue en el árbol | Mi día con datos reales de al menos dos productos. Quitar `web/` si sigue marcado obsoleto. |
| Billing | `billing/` en este worktree y repo `dakinis-billing` | Node, Stripe 22, PostgreSQL, Redis, BullMQ | Checkout, webhook de producción en 200, plan en Core y portal en Hub. No mergear Stripe 23 (PR #63). |
| Internal API | `internal/` en este worktree y repo `dakinis-internal-api` | Node, Docker, worker | Sigue siendo server-to-server. El seed de Calle Brava sigue abierto. |
| Notifications | `notifications/` en este worktree y repo `dakinis-notifications` | Node, BullMQ, Redis, Railway worker | Resend en producción y el worker entregando de verdad. |
| Search | `search/` en este worktree y repo `dakinis-search` | Node, worker Railway | Worker y pgvector cuando un producto consulte el índice. |
| Knowledge | `D:\dakinis-systems\knowledge` y también en este worktree | Node, Docker Compose, Redis worker, schema `knowledge` | Ingest masivo cuando AI o Hub lo usen. |
| AI | `D:\dakinis-systems\ai` y `D:\dakinis-systems\platform\ai` | Node, contrato `/v1/chat` y `/v1/lifeflow/coach` | Hay dos checkouts. Cuotas por workspace y tool-calling. Confirmar cuál despliega Railway antes de editar los dos. |
| DES / shared | `D:\dakinis-shared` y `D:\dakinis-systems\platform\shared` | Paquetes JS: brand, layouts, ux, charts, icons, sdk. En `packages/` de este checkout también hay `shared-*` y `sdk-*` | Tres árboles. El README de `D:\dakinis-shared` no coincide con la raíz del repo de GitHub. |
| Nómina | `packages/payroll` en la rama `feat/payroll` (PR #64), no en este worktree | Motor JS propio, dinero en unidades menores, tipos en basis points | Merge del PR y API más UI en Core. El SQL `061` ya está aplicado. No inventar tablas fiscales por país. |
| Fiscal | SQL y runbook en este worktree. UI en `D:\dakinis-systems\platform\core` | SQL `060`, hash SHA-256, QR, adaptador AEAT en stub | `059` y `060` ya están en Supabase (12 nov 2026). Core `1c67ec5` está en Railway desde las 19:03 CET. La pantalla es Config → Fiscal. No es un SIF certificado. |
| Landing | `D:\dakinis-systems\apps\landing` | Sitio estático, Railway, Cloudflare | La ficha de AkoeNet sigue en `akoenet-frontend.onrender.com` (503, suspendido). La web es `akoenet.dakinissystems.com`. El WhatsApp es un placeholder. La sección de servicios sigue contando una agencia. |
| Perfil de la org | `D:\dakinis-systems\.github-profile-tmp` y `D:\dakinis-systems\.github-org` | Markdown del perfil | Borradores locales. El publicado sigue en el repo `.github`. Merge del PR #1: la página enlaza repos que devuelven 404. |
| Ops | Railway, Cloudflare, Supabase | — | MFA en Cloudflare y un staging mínimo. No hay staging (riesgo R1 en STATUS). |

---

## Productos

| Sistema | Dónde en D:\ | Tecnologías | Mejora |
|---|---|---|---|
| Core / Dakinis One | `D:\dakinis-systems\platform\core` (`api/`, `web/`, `shared/`) | Node workspaces, React + Vite, API Node, PostgreSQL/Supabase | Piloto Copérnico: invitar personal, demo y feedback. Glovo y Uber siguen en stub. |
| LifeFlow | `D:\dakinis-systems\finanzas` | Node, React, Vite, SQLite, JWT. Raíz `api/` + `web/`. Producción en `finance.dakinissystems.com` | Desde `D:\dakinis-systems`, `cd finanzas` es la carpeta correcta. No migrar a Postgres hasta que haya datos reales. |
| AkoeNet | `D:\AkoNet` y `D:\dakinis-systems\apps\akoenet` (`Client/`, `Server/`) | Vite, Capacitor, Tauri, Node, PostgreSQL, WebSockets | `apps\akoenet` no tiene `.git`. `D:\AkoNet\ESTRUCTURA_ACTUAL.md` ya marca `render.yaml` como histórico. Los Assistant siguen en scaffold. |
| StreamAutomator | `D:\dakinis-streamautomator` y `D:\dakinis-systems\apps\streamautomator` | Express en `apps/api`, React en `apps/web` | Dos checkouts. Bajar el backlog de dependencias (aviso del 9 nov: 346 alertas, 10 críticas y 145 altas) antes de añadir cuotas. |
| Tabletop | `D:\dakinis-systems\DND` y `D:\DND` | El de dentro del checkout tiene `api/`, `web/` y su propio `.git`. `D:\DND` es el generador Flask | Elegir un solo árbol. Los dos siguen en SQLite. |
| Dakinis Vault | `D:\Dakinis Vault` | pnpm 10, TypeScript, Vite, Vitest, Playwright, Dexie/IndexedDB, hash-wasm, TOTP | Revisión independiente del formato y prueba de recuperación en un dispositivo limpio. El README ya dice que los CSV no viven en esa carpeta. `*.csv` está en `.gitignore`. Passkeys y Steam Guard siguen en investigación. |
| AI Studio | `D:\Dakinis AI Studio` | Python 3, Pillow, Express mínimo, Node 20 | P0 cerrado el 11 nov: pruebas del pipeline y export `mythos/{id}_idle.png` y `{id}_attack.png`. Lo siguiente es la interfaz React (P1), no más IA. |

---

## Juegos

| Juego | Dónde en D:\ | Tecnologías | Mejora |
|---|---|---|---|
| MYTHOS: ReGenesis | `D:\Simil Pokemon\mythos_regenesis` | TypeScript, Vite 7, PixiJS 8, WebSocket propio, PostgreSQL (`pg`), jose, Electron. v0.2.1-room | No sumar especies, regiones ni jefes. Astra, Pyrix y Luphar tienen que pasar la Prueba 2. |
| Eclipse: Ecos de la libertad | `D:\ECLIPSE Ecos de la libertad` | TypeScript, Vite 8, PixiJS 8, Vitest, ESLint, Prettier | El combate del prototipo 7.9 está cerrado. Probarlo con otra persona antes de sigilo, Resonancia o la misión completa. |
| Aesir of the Nile | `D:\aesir-of-the-nile` | Godot 4.6, GDScript, sprites PNG, localización ES/EN | Loot de armadura, tiras de caminar y atacar, más enemigos del spritesheet y traducir los nombres de armas generadas. |
| Settlement Directive | no hay carpeta en `D:\`. Repo `DAKINIS-SETTLEMENT-DIRECTIVE` | C#, 7 Days to Die 3.1.0 b14, Harmony, XML | Seguir el ROADMAP: malla DCRC, armas 3D, Vehicles y Security. El README dice alpha 0.42.0 y el último commit (28 oct) anuncia Core 0.44.92. |
| Ashen Path | no hay carpeta en `D:\`. Repo `DAKINIS-ASHEN-PATH` | C#, 7 Days to Die 3.1.0 b14, XML | Aparcarlo. Parado el 22 ago en 0.28.73, playtest privado, sin coop. |
| Cifras y Letras | `D:\Cifras y Letras` | Python, FastAPI, Uvicorn, Pydantic, Pillow, Tesseract; frontend React 19, Vite 6, tesseract.js, Capacitor 8 | El README 2.0 no deja un ítem abierto. |
| JoyMaker | `D:\JoyMaker\JoyMakerGame` | No hay escenas ni roadmap legibles | Nada que implementar hasta que haya fuente. |

---

## Qué no hacer ahora

- Stripe 23 en Billing.
- Tablas fiscales oficiales por país dentro de nómina.
- APIs reales de Glovo o Uber, SSE/WebSocket de plataforma y System Health unificado.
- Nuevas especies o regiones en Mythos.
- Sigilo y misión completa de Eclipse antes de la prueba del combate.
- Usar Vault como bóveda principal.
- Redesplegar en Render. `akoenet-frontend.onrender.com` responde 503 con `suspend-by-user`.
