# Compatibilidad multi-lenguaje — Dakinis Studio

> **Respuesta corta:** sí — la arquitectura es compatible con **cualquier lenguaje de programación actual** que pueda ejecutarse en Linux (directamente o vía contenedor). El editor, Git, terminal y file sync son **agnósticos al lenguaje**. IntelliSense depende del **LSP** registrado para ese `languageId`.

---

## Tres niveles de soporte

| Nivel | Qué incluye | Lenguajes |
|-------|-------------|-----------|
| **A — Full IDE** | Editor + LSP + runtime + build + debug (futuro) | TS/JS, Python, Go, Rust, Java, PHP, C/C++, C#, Dart… |
| **B — Dev shell** | Editor + terminal + git + build manual | Cualquier runtime Docker / Compose / custom |
| **C — Text only** | Editor + syntax básico (CodeMirror) sin LSP | Cualquier texto, configs, DSLs raros, legacy |

**Regla:** si corre en un contenedor Linux o tiene LSP en el ecosistema VS Code, encaja en Dakinis Studio sin cambiar el API.

---

## Por qué el API es language-agnostic

| Capa | Acoplamiento al lenguaje |
|------|--------------------------|
| **File Sync** | Ninguno — operaciones sobre bytes/UTF-8 (`patch`, `insert`, `rename`) |
| **Session Manager** | Ninguno — estado UI (tabs, cursor, terminales) |
| **Git Service** | Ninguno — cualquier repo |
| **Terminal / PTY** | Ninguno — el usuario ejecuta el CLI del runtime |
| **Runtime Manager** | Por catálogo — imagen Docker + comandos default |
| **LSP Service** | Por `languageId` — registro extensible |
| **Deploy Engine** | Por artefacto — npm, cargo, maven, flutter build… |

No hay endpoints tipo `/only-javascript`. Todo pasa por **workspace + runtimeId + languageId**.

---

## Catálogos extensibles

| Archivo | Contenido |
|---------|-----------|
| [`catalog/runtimes.json`](../catalog/runtimes.json) | Node, Python, PHP, Java, Go, Rust, .NET, Flutter, custom… |
| [`catalog/lsp-servers.json`](../catalog/lsp-servers.json) | 35+ language servers mapeados |

Añadir un lenguaje nuevo = **entrada en JSON** + imagen Docker — **sin cambiar** OpenAPI.

---

## Lenguajes — matriz de compatibilidad (2026)

### Tier 1 — MVP / Growth (LSP + runtime oficial planificado)

| Lenguaje | Runtime | LSP | Notas |
|----------|---------|-----|-------|
| JavaScript / TypeScript | `node-22`, `bun-1`, `deno-2` | typescript-language-server | React, Vue, Node, Deno |
| Python | `python-3.13` | pyright | FastAPI, Django, ML, notebooks* |
| Go | `go-1.24` | gopls | Microservicios, CLI |
| Rust | `rust-1` | rust-analyzer | Systems, WASM |
| Java | `java-24` | jdtls | Spring, Android backend |
| PHP | `php-8.4` | intelephense | Laravel, WordPress |
| C# / F# | `dotnet-9` | csharp-ls / fsautocomplete | .NET APIs |
| C / C++ | `cpp-gcc` | clangd | Native, embedded |
| Dart / Flutter | `dart-flutter` | dart-language-server | Mobile + Live Device APK |
| HTML / CSS / JSON | (any web runtime) | vscode-* servers | Frontends |
| Shell | `shell` | bash-language-server | Scripts DevOps |

\* Jupyter: terminal + Python runtime; UI notebook = addon futuro.

### Tier 2 — Future catalog (misma arquitectura)

Kotlin, Swift (Linux LSP), Ruby, Elixir, Scala, Zig, Haskell, R, Julia, Lua, Perl, Terraform, Protobuf, GraphQL, Vue, Svelte…

### Tier 3 — Siempre posible vía runtime custom

| Caso | Cómo |
|------|------|
| **Cualquier lenguaje niche** | `runtime: custom` + Dockerfile del usuario |
| **Polyglot monorepo** | `docker-compose` runtime |
| **COBOL, Fortran, Ada…** | Imagen legacy + editor texto; LSP si existe |
| **Solidity / Move** | Plugin marketplace + LSP community |
| **SQL / PL/pgSQL** | Sidecar Postgres + sqls |
| **iOS (Swift UI)** | Build en macOS runner remoto* — no en Xiaomi directo |

\* Live Device Android sí; App Store build requiere runner macOS en cloud.

---

## Lo que NO depende del lenguaje (100% compatible)

- Multi-workspace / Session Manager
- File sync incremental
- Múltiples terminales PTY
- Git (commit, push, branches)
- Agentes IA (leen archivos como texto)
- Deploy Railway / Docker
- Observabilidad (logs, CPU, containers)
- Secrets / env vars
- Marketplace plugins
- Offline cache en móvil

---

## Identificación de lenguaje en el cliente

Convención **VS Code** (`languageId`):

1. Extensión de archivo (`.py` → `python`)
2. Override en `.dakinis/studio.json` del workspace:

```json
{
  "files.associations": {
    "*.astro": "astro",
    "Dockerfile.prod": "dockerfile"
  },
  "runtime": "node-22"
}
```

3. Modeline o shebang (opcional, fase 2)

El API transporta `languageId` como string opaco — no valida semántica del lenguaje.

---

## File Sync y archivos binarios

| Tipo | Estrategia |
|------|------------|
| Texto (código) | Ops `patch` / `insert` / `delete` |
| Binario (png, apk, wasm) | Op `blob` — chunk base64 o upload presigned (Storage Dakinis) |
| Large files | Git LFS en runtime; cliente muestra pointer |

Compatible con cualquier lenguaje que mezcle texto y binarios (Rust, Go, mobile assets).

---

## Limitaciones reales (no del API)

| Limitación | Mitigación |
|------------|------------|
| iOS build sin Mac | Runner macOS en cloud |
| Windows-only (.NET Framework legacy) | VM Windows container |
| IDE visual (Unity, Unreal) | Terminal + git; editor para scripts |
| LSP inexistente | Nivel C — editor + terminal |
| Batería / CPU móvil | Todo build en Workspace Runtime |

---

## Conclusión

**Dakinis Studio es compatible con el ecosistema de lenguajes actual** porque:

1. Separa **UI** (cliente) de **toolchain** (runtime Docker).
2. Usa **LSP** como plugin registry, no lógica fija.
3. File sync y sesiones son **independientes del lenguaje**.
4. **`custom` + Compose** cubren cualquier caso no listado en catálogo.

El 10/10 de extensibilidad = catálogos versionados + marketplace de runtimes/LSP/agents — ya reflejado en [`catalog/`](../catalog/) y [`api/openapi.yaml`](../api/openapi.yaml).

---

## Enlaces

- [Visión Studio Mobile](../../dakinis-studio-mobile/docs/VISION.md)
- [Arquitectura](../../dakinis-studio-mobile/docs/ARCHITECTURE.md)
- [Runtimes catalog](../catalog/runtimes.json)
- [LSP catalog](../catalog/lsp-servers.json)
