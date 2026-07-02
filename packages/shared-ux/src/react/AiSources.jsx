/** Fuentes citadas por la IA. */
export default function AiSources({ sources = [] }) {
  if (!sources.length) return null;
  return (
    <div className="dakinis-ai-sources">
      <span className="dakinis-ai-sources__title">Fuentes</span>
      <ul className="dakinis-ai-sources__list">
        {sources.map((src, i) => (
          <li key={src.id || i}>
            {src.href ? (
              <a href={src.href} target="_blank" rel="noopener noreferrer">
                {src.label || src.href}
              </a>
            ) : (
              src.label
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
