/**
 * Patrones UX reutilizables — mensajes emocionales, estados vacíos, feedback.
 */
export function successMessage({ title, detail, metric }) {
  const parts = [title];
  if (detail) parts.push(detail);
  if (metric) parts.push(metric);
  return parts.join(" ");
}

export const EMPTY_STATES = {
  noData: {
    title: "Aún no hay datos",
    hint: "Cuando empieces a usar la app, verás el resumen aquí.",
  },
  noResults: {
    title: "Sin resultados",
    hint: "Prueba con otros filtros o términos de búsqueda.",
  },
};

export const AI_PLACEHOLDERS = {
  core: "¿Qué necesitas hacer hoy? Pregunta a Dakinis AI…",
  lifeflow: "Pregunta a LifeFlow Coach sobre tus metas o finanzas…",
  akoenet: "Resume conversación, busca por contexto o genera normas…",
};
