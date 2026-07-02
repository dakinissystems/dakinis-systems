import { Fragment, useMemo, useState } from "react";
import { SRD_CLASSES, SRD_RACES, SRD_SPELLS } from "../data/srd";
import type { SpellBook } from "../data/srd/types";
import { useLocale } from "../context/LocaleContext";
import { srdDisplayName } from "../lib/locale-utils";

type CompendiumSection = "razas" | "clases" | "hechizos";

const SOURCE_LABEL: Record<SpellBook, string> = {
  srd: "SRD",
  xge: "XGE",
  tce: "TCE",
};

export function CompendiumPanel() {
  const { locale, t } = useLocale();
  const [section, setSection] = useState<CompendiumSection>("hechizos");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<SpellBook | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const spellCounts = useMemo(
    () => ({
      srd: SRD_SPELLS.filter((s) => s.source === "srd").length,
      xge: SRD_SPELLS.filter((s) => s.source === "xge").length,
      tce: SRD_SPELLS.filter((s) => s.source === "tce").length,
    }),
    [],
  );

  const filteredSpells = useMemo(() => {
    const q = search.toLowerCase();
    return SRD_SPELLS.filter((s) => {
      if (sourceFilter && s.source !== sourceFilter) return false;
      if (classFilter && !s.classes.includes(classFilter)) return false;
      if (levelFilter !== "" && s.level !== +levelFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [search, classFilter, levelFilter, sourceFilter]);

  const filteredRaces = useMemo(() => {
    const q = search.toLowerCase();
    return SRD_RACES.filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.nameEn.toLowerCase().includes(q) ||
        r.traits.some((t) => t.name.toLowerCase().includes(q)),
    );
  }, [search]);

  const filteredClasses = useMemo(() => {
    const q = search.toLowerCase();
    return SRD_CLASSES.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.features.some((f) => f.name.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <div>
      <section className="panel" style={{ marginBottom: "1rem" }}>
        <h2>{t("compendium.title")}</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          {t("compendium.hint")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {(["razas", "clases", "hechizos"] as const).map((s) => (
            <button
              key={s}
              className={`tab ${section === s ? "active" : ""}`}
              style={{ margin: 0 }}
              onClick={() => {
                setSection(s);
                setSearch("");
                setExpandedId(null);
              }}
            >
              {s === "razas" && t("compendium.racesTab", { count: SRD_RACES.length })}
              {s === "clases" && t("compendium.classesTab", { count: SRD_CLASSES.length })}
              {s === "hechizos" && t("compendium.spellsTab", { count: SRD_SPELLS.length })}
            </button>
          ))}
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 2 }}>
            <label>{t("compendium.search")}</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("compendium.searchPlaceholder")}
            />
          </div>
          {section === "hechizos" && (
            <>
              <div className="form-field">
                <label>{t("compendium.source")}</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as SpellBook | "")}
                >
                  <option value="">{t("compendium.sourceAll", { count: SRD_SPELLS.length })}</option>
                  <option value="srd">SRD ({spellCounts.srd})</option>
                  <option value="xge">Xanathar ({spellCounts.xge})</option>
                  <option value="tce">Tasha ({spellCounts.tce})</option>
                </select>
              </div>
              <div className="form-field">
                <label>{t("compendium.class")}</label>
                <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                  <option value="">{t("compendium.classAll")}</option>
                  {SRD_CLASSES.filter((c) => c.spellcasting).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>{t("compendium.level")}</label>
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                  <option value="">{t("compendium.levelAll")}</option>
                  <option value="0">{t("compendium.cantrips")}</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                    <option key={l} value={l}>
                      {t("compendium.levelN", { level: l })}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {section === "razas" && (
        <div className="grid-2">
          {filteredRaces.map((race) => (
            <article key={race.id} className="combo-card">
              <h3>
                {srdDisplayName(race, locale)}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.9rem" }}>
                  ({locale === "en" ? race.name : race.nameEn})
                </span>
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {race.size} · {race.speed} ft · {t("compendium.racesLanguages")}: {race.languages.join(", ")}
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                {t("compendium.racesBonuses")}:{" "}
                {Object.entries(race.abilityBonuses)
                  .map(([k, v]) => `${k.toUpperCase()} +${v}`)
                  .join(", ") || "-"}
              </p>
              <ul className="steps">
                {race.traits.map((t) => (
                  <li key={t.name}>
                    <strong>{t.name}:</strong> {t.description}
                  </li>
                ))}
              </ul>
              {race.subraces && race.subraces.length > 0 && (
                <details style={{ marginTop: "0.5rem" }}>
                  <summary style={{ cursor: "pointer", color: "var(--gold)" }}>
                    {t("compendium.racesSubraces", { count: race.subraces.length })}
                  </summary>
                  <ul className="steps">
                    {race.subraces.map((s) => (
                      <li key={s.id}>
                        <strong>{s.name}</strong>
                        {Object.keys(s.abilityBonuses).length > 0 &&
                          ` — ${Object.entries(s.abilityBonuses)
                            .map(([k, v]) => `${k.toUpperCase()} +${v}`)
                            .join(", ")}`}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          ))}
        </div>
      )}

      {section === "clases" && (
        <div className="grid-2">
          {filteredClasses.map((cls) => (
            <article key={cls.id} className="combo-card">
              <h3>
                {srdDisplayName(cls, locale)}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.9rem" }}>
                  d{cls.hitDie} · {locale === "en" ? cls.name : cls.nameEn}
                </span>
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {t("compendium.classesSaves")}: {cls.savingThrows.map((a) => a.toUpperCase()).join(", ")} ·{" "}
                {cls.spellcasting
                  ? `${t("compendium.classesSpells")} (${cls.spellcasting.type}, ${cls.spellcasting.ability.toUpperCase()})`
                  : t("compendium.classesNoSpells")}
              </p>
              <ul className="steps">
                {cls.features.slice(0, 5).map((f) => (
                  <li key={f.name}>
                    <strong>Niv {f.level} — {f.name}:</strong> {f.description}
                  </li>
                ))}
              </ul>
              <details style={{ marginTop: "0.5rem" }}>
                <summary style={{ cursor: "pointer", color: "var(--gold)" }}>
                  {t("compendium.classesSubclasses", { count: cls.subclasses.length })}
                </summary>
                <ul className="steps">
                  {cls.subclasses.map((s) => (
                    <li key={s.id}>
                      <strong>{s.name}</strong>
                      {s.source && (
                        <span className="tag" style={{ marginLeft: 6 }}>
                          {SOURCE_LABEL[s.source]}
                        </span>
                      )}{" "}
                      — {s.description}
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      )}

      {section === "hechizos" && (
        <section className="panel">
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            {t("compendium.showingSpells", { shown: filteredSpells.length, total: SRD_SPELLS.length })}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("compendium.source")}</th>
                  <th>{t("compendium.level")}</th>
                  <th>{t("spells.name")}</th>
                  <th>{t("spells.school")}</th>
                  <th>{t("compendium.castingTime")}</th>
                  <th>{t("compendium.classes")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredSpells.map((spell) => (
                  <Fragment key={spell.id}>
                    <tr>
                      <td>
                        <span className={`badge badge-custom`} style={{ opacity: spell.source === "srd" ? 0.7 : 1 }}>
                          {SOURCE_LABEL[spell.source]}
                        </span>
                      </td>
                      <td>{spell.level === 0 ? t("spells.cantrip") : spell.level}</td>
                      <td>
                        <strong>{spell.name}</strong>
                        {spell.ritual && <span className="tag">{t("compendium.ritual")}</span>}
                        {spell.concentration && <span className="tag">{t("compendium.concentration")}</span>}
                      </td>
                      <td>{spell.school}</td>
                      <td>{spell.castingTime}</td>
                      <td>
                        {spell.classes
                          .map((id) => SRD_CLASSES.find((c) => c.id === id)?.name ?? id)
                          .join(", ")}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            setExpandedId(expandedId === spell.id ? null : spell.id)
                          }
                        >
                          {expandedId === spell.id ? "−" : "+"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === spell.id && (
                      <tr>
                        <td colSpan={7} style={{ background: "var(--surface-2)" }}>
                          <p style={{ margin: "0.25rem 0" }}>
                            <strong>{t("compendium.range")}:</strong> {spell.range} · <strong>{t("compendium.components")}:</strong>{" "}
                            {spell.components} · <strong>{t("compendium.duration")}:</strong> {spell.duration}
                          </p>
                          <p style={{ margin: 0, color: "var(--muted)" }}>{spell.description}</p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
