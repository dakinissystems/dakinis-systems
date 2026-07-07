import { useMemo, useState } from "react";
import { SRD_CLASSES, SRD_RACES, SRD_SPELLS } from "../data/srd";
import type { SpellBook } from "../data/srd/types";
import { useLocale } from "../context/LocaleContext";
import {
  CompendiumClassesSection,
  CompendiumRacesSection,
} from "./compendium/CompendiumSections";
import { CompendiumSpellsSection } from "./compendium/CompendiumSpellsSection";

type CompendiumSection = "razas" | "clases" | "hechizos";

export function CompendiumPanel() {
  const { t } = useLocale();
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
        r.traits.some((trait) => trait.name.toLowerCase().includes(q)),
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

  const spellcastingClasses = useMemo(
    () => SRD_CLASSES.filter((c) => c.spellcasting),
    [],
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
              type="button"
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
            <label htmlFor="compendium-search">{t("compendium.search")}</label>
            <input
              id="compendium-search"
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
                  {spellcastingClasses.map((c) => (
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

      {section === "razas" && <CompendiumRacesSection races={filteredRaces} />}
      {section === "clases" && <CompendiumClassesSection classes={filteredClasses} />}
      {section === "hechizos" && (
        <CompendiumSpellsSection
          spells={filteredSpells}
          expandedId={expandedId}
          onToggleExpand={toggleExpand}
        />
      )}
    </div>
  );
}
