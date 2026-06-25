# Conocimiento corporativo Dakinis (RAG)

Índice de documentación para agentes IA (`Business Advisor`, `Support`, `Coach` con contexto producto).

## Estructura

```
docs/knowledge/
├── README.md          ← este archivo
├── core/              ← CRM, inventario, copilot, planes
├── lifeflow/          ← pilares, score, coach, metas
├── stream/            ← publicaciones, calendario, moderación
├── akoenet/           ← comunidades, voz, normas
├── legal/             ← privacidad, términos, refunds
└── platform/          ← Hub, auth, billing, arquitectura
```

## Fuentes actuales (enlazar en RAG)

| Namespace | Documentos |
|-----------|------------|
| **core** | `docs/contracts/core-*`, `platform/core` README, copilot intents |
| **lifeflow** | `finanzas/` docs, legal LifeFlow, coach reglas |
| **legal** | `docs/legal/*`, páginas `/legal` por producto |
| **platform** | `docs/DAKINIS-ESTRUCTURA-TEMP.md`, `docs/DAKINIS-AI-TEMP.md`, event-bus |
| **stream** | StreamAutomator legal + moderación |
| **akoenet** | transparencia, seguridad, DPO |

## Uso desde Dakinis AI

1. **Ingesta:** workers `ai:rag-index` (planificado) indexan markdown/PDF por namespace.
2. **Consulta:** `POST /v1/rag` con `{ query, namespace: "core" }`.
3. **Agentes:** `core-advisor` y `support-agent` pueden adjuntar chunks RAG al prompt.

## Convenciones

- Un archivo por tema (`inventory-fifo.md`, `plans-pricing.md`).
- Versionar con frontmatter `version: v1`.
- No incluir PII ni secretos; solo documentación pública o interna operativa.

## Próximos pasos

- [ ] Script ingest `node scripts/rag-ingest.mjs docs/knowledge`
- [ ] Embeddings en `ai-workers` con Redis + pgvector
- [ ] Enlazar FAQ Hub desde `packages/shared-brand/hub-modules.json`
