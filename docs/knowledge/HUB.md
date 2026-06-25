# Knowledge Hub — usuarios + IA

Extensión de [`README.md`](./README.md) para **self-service** y soporte.

## Flujo

```
Usuario (Hub / Ayuda / Ctrl+K)
    │  «¿Cómo configuro WhatsApp?»
    ▼
Knowledge Hub UI  (roadmap)
    │  namespace: core | lifeflow | legal | stream | akoenet
    ▼
Dakinis AI  POST /v1/rag  { query, namespace }
    │  chunks desde docs/knowledge/
    ▼
Respuesta citando fuente + enlace doc
```

## Preguntas objetivo

| Pregunta | Namespace |
|----------|-----------|
| ¿Cómo configuro WhatsApp? | `core` |
| ¿Cómo importar clientes? | `core` |
| ¿Cómo funciona LifeFlow Score? | `lifeflow` |
| ¿Política de reembolsos? | `legal` |
| ¿Moderación en Stream? | `stream` |

## Implementación

1. **Ingesta:** `node scripts/rag-ingest.mjs docs/knowledge` (pendiente).
2. **UI:** pestaña Ayuda en Hub + scope `knowledge` en Command Palette.
3. **Agentes:** `support-agent` con RAG obligatorio antes de LLM libre.

Principios UX: [`experience-principles.md`](../experience-principles.md).
