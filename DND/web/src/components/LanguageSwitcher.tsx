import { useLocale } from "../context/LocaleContext";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="lang-switcher" role="group" aria-label={t("common.languageSwitcher")}>
      <button
        type="button"
        className={`btn btn-secondary btn-sm ${locale === "es" ? "auth-tab--on" : ""}`}
        onClick={() => setLocale("es")}
      >
        ES
      </button>
      <button
        type="button"
        className={`btn btn-secondary btn-sm ${locale === "en" ? "auth-tab--on" : ""}`}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
