# ADR-004 — Knowledge service

## Contexto

RAG, documentación de producto y búsqueda semántica comparten ingest de documentos pero tienen ciclos de vida distintos a Search y AI chat.

## Decisión

**Knowledge** es servicio platform independiente (`dakinis-knowledge`, puerto 4084). Pipeline: Documents → Chunks → Embeddings → Search Index. **Search** consume el índice; **AI** consume contexto vía RAG sin ser dueño de los documentos.

## Consecuencias

- Schema `knowledge` en Supabase con RLS (`025`, `026`).
- Worker de ingest separado del API.
- Contrato: `docs/contracts/knowledge.json`.
