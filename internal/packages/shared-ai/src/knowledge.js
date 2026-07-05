/** Fuentes del servicio Knowledge (separado de AI y Search). */
export const KNOWLEDGE_SOURCE_TYPES = [
  { id: "pdf", label: "PDF", ingest: "ocr+chunk" },
  { id: "wiki", label: "Wiki", ingest: "markdown" },
  { id: "documents", label: "Documentos", ingest: "office+text" },
  { id: "faq", label: "FAQ", ingest: "structured" },
  { id: "policies", label: "Policies", ingest: "legal" },
  { id: "products", label: "Product docs", ingest: "catalog" },
  { id: "user-docs", label: "User docs", ingest: "markdown+attachments" },
];

/** AI consulta Knowledge — no almacena corpus en el servicio LLM. */
export const KNOWLEDGE_QUERY_FLOW =
  "product → Knowledge /v1/query → Search index / pgvector → AI RAG";
