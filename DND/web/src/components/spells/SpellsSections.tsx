import type { Character, Spell } from "../../types/character";
import type { SrdSpell } from "../../data/srd/types";
import type { SpellBook } from "../../data/srd/types";
import { useLocale } from "../../context/LocaleContext";

type MySpellsProps = {
  character: Character;
  characterSpells: Spell[];
  preparedCount: number;
  maxPrep: number;
  onChange: (fn: (c: Character) => Character) => void;
  onEdit: (spell: Spell) => void;
  onOpenCustom: () => void;
};

export function SpellsMyList({
  character,
  characterSpells,
  preparedCount,
  maxPrep,
  onChange,
  onEdit,
  onOpenCustom,
}: MySpellsProps) {
  const { t } = useLocale();
  const prepared = character.spells.filter((s) => s.isPrepared);

  return (
    <section className="panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <h2>
          {t("spells.mySpells")} - {t("spells.preparedCount", { prepared: preparedCount, max: maxPrep })}
        </h2>
        <button type="button" className="btn btn-sm" onClick={onOpenCustom}>
          {t("spells.customSpell")}
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("spells.prepared")}</th>
              <th>{t("spells.name")}</th>
              <th>{t("spells.level")}</th>
              <th>{t("spells.school")}</th>
              <th>{t("spells.source")}</th>
              <th>{t("inventory.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {characterSpells.map((s) => (
              <tr key={s.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={s.isPrepared}
                    disabled={s.isAlwaysReady}
                    aria-label={`${t("spells.prepared")}: ${s.name}`}
                    onChange={(e) => {
                      const next = e.target.checked;
                      if (next && prepared.length >= maxPrep && !s.isPrepared) return;
                      onChange((c) => ({
                        ...c,
                        spells: c.spells.map((x) => (x.id === s.id ? { ...x, isPrepared: next } : x)),
                      }));
                    }}
                  />
                </td>
                <td>
                  <strong>{s.name}</strong>
                  {s.isAlwaysReady && <span className="badge badge-active"> {t("spells.alwaysReady")}</span>}
                </td>
                <td>{s.level === 0 ? t("spells.cantrip") : s.level}</td>
                <td>{s.school}</td>
                <td>
                  {s.source === "custom" ? (
                    <span className="badge badge-custom">{t("spells.customTag")}</span>
                  ) : (
                    <span className="badge badge-custom" style={{ opacity: s.source === "srd" ? 0.75 : 1 }}>
                      {s.source.toUpperCase()}
                    </span>
                  )}
                </td>
                <td>
                  {s.source === "custom" && (
                    <>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit({ ...s })}>
                        {t("spells.edit")}
                      </button>{" "}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        aria-label={t("list.deleteAria", { name: s.name })}
                        onClick={() => onChange((c) => ({ ...c, spells: c.spells.filter((x) => x.id !== s.id) }))}
                      >
                        ×
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type CatalogProps = {
  catalog: SrdSpell[];
  knownNames: Set<string>;
  filter: string;
  levelFilter: string;
  sourceFilter: SpellBook | "";
  showClassOnly: boolean;
  classId: string | null | undefined;
  onFilterChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onSourceFilterChange: (value: SpellBook | "") => void;
  onShowClassOnlyChange: (value: boolean) => void;
  onAddFromSrd: (spellId: string) => void;
  onAddAllClassSpells: () => void;
};

export function SpellsCatalog({
  catalog,
  knownNames,
  filter,
  levelFilter,
  sourceFilter,
  showClassOnly,
  classId,
  onFilterChange,
  onLevelFilterChange,
  onSourceFilterChange,
  onShowClassOnlyChange,
  onAddFromSrd,
  onAddAllClassSpells,
}: CatalogProps) {
  const { t } = useLocale();

  return (
    <section className="panel">
      <h2>{t("spells.catalog", { count: catalog.length })}</h2>
      <div className="form-row" style={{ marginBottom: "0.75rem" }}>
        <div className="form-field">
          <label htmlFor="spells-search">{t("spells.search")}</label>
          <input
            id="spells-search"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder={t("spells.searchPlaceholder")}
          />
        </div>
        <div className="form-field">
          <label htmlFor="spells-source">{t("spells.source")}</label>
          <select
            id="spells-source"
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange(e.target.value as SpellBook | "")}
          >
            <option value="">{t("spells.sourceAll")}</option>
            <option value="srd">{t("spells.sourceSrd")}</option>
            <option value="xge">{t("spells.sourceXge")}</option>
            <option value="tce">{t("spells.sourceTce")}</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="spells-level">{t("spells.level")}</label>
          <select id="spells-level" value={levelFilter} onChange={(e) => onLevelFilterChange(e.target.value)}>
            <option value="">{t("spells.levelAll")}</option>
            <option value="0">{t("spells.cantrips")}</option>
            {[1, 2, 3, 4, 5].map((l) => (
              <option key={l} value={l}>
                {t("spells.levelN", { level: l })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="checkbox-label" style={{ marginBottom: "0.75rem" }}>
        <input
          type="checkbox"
          checked={showClassOnly}
          onChange={(e) => onShowClassOnlyChange(e.target.checked)}
          disabled={!classId}
        />
        {t("spells.classOnly")}
        {!classId ? t("spells.classOnlyNeedSheet") : ""}
      </label>
      {classId && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: "0.75rem" }}
          onClick={onAddAllClassSpells}
        >
          {t("spells.importClassSpells")}
        </button>
      )}
      <div className="table-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>{t("spells.level")}</th>
              <th>{t("spells.name")}</th>
              <th>{t("spells.source")}</th>
              <th>{t("spells.school")}</th>
              <th>{t("inventory.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {catalog.slice(0, 80).map((s) => {
              const owned = knownNames.has(s.name.toLowerCase());
              return (
                <tr key={s.id}>
                  <td>{s.level === 0 ? "C" : s.level}</td>
                  <td>{s.name}</td>
                  <td>
                    <span className="tag">{s.source.toUpperCase()}</span>
                  </td>
                  <td>{s.school}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={owned}
                      aria-label={owned ? s.name : `${t("combat.add")} ${s.name}`}
                      onClick={() => onAddFromSrd(s.id)}
                    >
                      {owned ? "✓" : "+"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {catalog.length > 80 && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "center" }}>
            {t("spells.narrowResults", { count: catalog.length })}
          </p>
        )}
      </div>
    </section>
  );
}
