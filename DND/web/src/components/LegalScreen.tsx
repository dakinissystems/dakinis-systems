import { LEGAL_UPDATED, getLegalDocs, getLegalNav, type LegalDocKey } from "../legal/content";
import { useLocale } from "../context/LocaleContext";

type Props = {
  docKey: LegalDocKey;
  onBack: () => void;
  onSelect: (key: LegalDocKey) => void;
};

export function LegalScreen({ docKey, onBack, onSelect }: Props) {
  const { locale, t } = useLocale();
  const docs = getLegalDocs(locale);
  const nav = getLegalNav(locale);
  const doc = docs[docKey];

  return (
    <div className="screen screen--legal">
      <header className="list-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          ← {t("legal.back")}
        </button>
        <h1>{doc.title}</h1>
        <p className="muted">{t("legal.updated", { date: LEGAL_UPDATED })}</p>
      </header>

      <nav className="legal-tabs" aria-label={t("legal.navAria")}>
        {nav.map((item) => (
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
