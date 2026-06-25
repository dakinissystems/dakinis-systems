import { LEGAL_DOCS, LEGAL_NAV, LEGAL_UPDATED, type LegalDocKey } from "../legal/content";

type Props = {
  docKey: LegalDocKey;
  onBack: () => void;
  onSelect: (key: LegalDocKey) => void;
};

export function LegalScreen({ docKey, onBack, onSelect }: Props) {
  const doc = LEGAL_DOCS[docKey];

  return (
    <div className="screen screen--legal">
      <header className="list-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          ← Volver
        </button>
        <h1>{doc.title}</h1>
        <p className="muted">Actualizado: {LEGAL_UPDATED}</p>
      </header>

      <nav className="legal-tabs" aria-label="Documentos legales">
        {LEGAL_NAV.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`legal-tabs__btn ${item.key === docKey ? "legal-tabs__btn--active" : ""}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <article className="legal-prose">
        {doc.sections.map((section) => (
          <section key={section.h}>
            <h2>{section.h}</h2>
            <p>{section.p}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
