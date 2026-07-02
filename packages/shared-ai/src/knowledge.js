/** Fuentes del servicio Knowledge (separado de AI). */
export const KNOWLEDGE_SOURCE_TYPES = [
  { id: "pdf", label: "PDF", ingest: "ocr+chunk" },
  { id: "wiki", label: "Wiki", ingest: "markdown" },
  { id: "documents", label: "Documentos", ingest: "office+text" },
  { id: "faq", label: "FAQ", ingest: "structured" },
  { id: "policies", label: "Policies", ingest: "legal" },
  { id: "products", label: "Productos", ingest: "catalog" },
];

/** AI consulta Knowledge — no almacena corpus en el servicio LLM. */
export const KNOWLEDGE_QUERY_FLOW = "product → internal/knowledge/query → embeddings index → AI RAG";
