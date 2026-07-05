/**
 * Fetch document content from Knowledge API (Search worker backfill).
 */

const KNOWLEDGE_URL = (process.env.DAKINIS_KNOWLEDGE_URL || "").replace(/\/$/, "");

/**
 * @param {string} documentId
 * @returns {Promise<{ id: string; title: string; content: string } | null>}
 */
export async function fetchKnowledgeDocument(documentId) {
  if (!KNOWLEDGE_URL) return null;
  const id = String(documentId || "").trim();
  if (!id) return null;

  const headers = { Accept: "application/json" };
  const key = String(process.env.DAKINIS_INTERNAL_SERVICE_KEY || "").trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  try {
    const res = await fetch(`${KNOWLEDGE_URL}/v1/documents/${encodeURIComponent(id)}`, {
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data?.document || data?.item || data;
    if (!doc?.id) return null;
    return {
      id: doc.id,
      title: doc.title || "",
      content: doc.content || doc.content_text || "",
    };
  } catch (err) {
    console.warn("[search/knowledge]", err instanceof Error ? err.message : err);
    return null;
  }
}
