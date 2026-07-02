import { calculateAC, className } from "../../engine/formulas";
import type { Character } from "../../types/character";
import type { TabletopUser } from "../../types/campaign";
import { useLocale } from "../../context/LocaleContext";
import { LanguageSwitcher } from "../LanguageSwitcher";

type Props = {
  characters: Character[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
  onExportAll?: () => void;
  onImport?: () => void;
  onLegal?: () => void;
  user?: TabletopUser | null;
  onLogout?: () => void;
  onSignIn?: () => void;
};

export function CharacterList({
  characters,
  onSelect,
  onCreate,
  onDelete,
  onExport,
  onExportAll,
  onImport,
  onLegal,
  user,
  onLogout,
  onSignIn,
}: Props) {
  const { t } = useLocale();

  return (
    <div className="screen screen--list">
      <header className="list-header">
        <h1>{t("brand.fullName")}</h1>
        <p>{t("list.title")}</p>
        <LanguageSwitcher />
        {(user || onSignIn) && (
          <div className="list-account">
            {user ? (
              <>
                <span className="list-account__name">{user.displayName || user.email}</span>
                {onLogout && (
                  <button type="button" className="btn-link" onClick={onLogout}>
                    {t("list.logout")}
                  </button>
                )}
              </>
            ) : (
              onSignIn && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={onSignIn}>
                  {t("list.signInRegister")}
                </button>
              )
            )}
          </div>
        )}
      </header>

      <div className="character-cards">
        {characters.length === 0 ? (
          <div className="list-empty">
            <span className="list-empty__icon" aria-hidden>
              📜
            </span>
            <p className="list-empty__title">{t("list.emptyTitle")}</p>
            <p className="list-empty__hint">{t("list.emptyHint")}</p>
            <button type="button" className="btn btn-block list-empty__cta" onClick={onCreate}>
              {t("list.createCharacter")}
            </button>
          </div>
        ) : (
          characters.map((c) => (
          <article key={c.id} className="character-card">
            <button type="button" className="character-card__body" onClick={() => onSelect(c.id)}>
              <div className="character-card__top">
                <h2>{c.name || t("list.unnamed")}</h2>
                {!c.setupComplete && <span className="badge badge-custom">{t("list.draft")}</span>}
              </div>
              <p className="character-card__sub">
                {t("list.levelShort")} {c.level} {c.race} · {className(c)}
              </p>
              <div className="character-card__stats">
                <span>
                  {t("list.ac")} {calculateAC(c)}
                </span>
                <span>
                  {t("list.hp")} {c.resources.currentHP}/{c.resources.maxHP}
                </span>
              </div>
            </button>
            {onDelete && (
              <button
                type="button"
                className="character-card__delete btn-icon"
                aria-label={t("list.deleteAria", { name: c.name || t("list.unnamed") })}
                onClick={() => onDelete(c.id)}
              >
                ×
              </button>
            )}
            {onExport && c.setupComplete !== false && (
              <button
                type="button"
                className="character-card__export btn-icon"
                aria-label={t("list.exportAria", { name: c.name || t("list.unnamed") })}
                title={t("list.exportJsonTitle")}
                onClick={(e) => {
                  e.stopPropagation();
                  onExport(c.id);
                }}
              >
                ↓
              </button>
            )}
          </article>
        ))
        )}
      </div>

      {characters.length > 0 && (
        <div className="create-character-bar">
          <button type="button" className="create-character-btn" onClick={onCreate}>
            <span className="create-character-btn__icon" aria-hidden>
              +
            </span>
            <span className="create-character-btn__label">{t("list.newCharacter")}</span>
          </button>
        </div>
      )}

      {onLegal || onImport || onExportAll ? (
        <footer className="list-footer">
          {onImport && (
            <button type="button" className="btn-link" onClick={onImport}>
              {t("list.importJson")}
            </button>
          )}
          {onExportAll && characters.length > 0 && (
            <button type="button" className="btn-link" onClick={onExportAll}>
              {t("list.exportAll")}
            </button>
          )}
          {onLegal && (
            <button type="button" className="btn-link" onClick={onLegal}>
              {t("list.legalShort")}
            </button>
          )}
        </footer>
      ) : null}
    </div>
  );
}
