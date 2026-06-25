import { Fragment, useMemo, useState } from "react";
import { SRD_CLASSES, SRD_RACES, SRD_SPELLS } from "../data/srd";
import type { SpellBook } from "../data/srd/types";

type CompendiumSection = "razas" | "clases" | "hechizos";

const SOURCE_LABEL: Record<SpellBook, string> = {
  srd: "SRD",
  xge: "XGE",
  tce: "TCE",
};

export function CompendiumPanel() {
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
        <h2>Compendio SRD 5e</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Referencia completa de razas, clases y hechizos del System Reference Document.
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
              {s === "razas" && `Razas (${SRD_RACES.length})`}
              {s === "clases" && `Clases (${SRD_CLASSES.length})`}
              {s === "hechizos" && `Hechizos (${SRD_SPELLS.length})`}
            </button>
          ))}
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 2 }}>
            <label>Buscar</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, escuela, rasgo..."
            />
          </div>
          {section === "hechizos" && (
            <>
              <div className="form-field">
                <label>Fuente</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as SpellBook | "")}
                >
                  <option value="">Todas ({SRD_SPELLS.length})</option>
                  <option value="srd">SRD ({spellCounts.srd})</option>
                  <option value="xge">Xanathar ({spellCounts.xge})</option>
                  <option value="tce">Tasha ({spellCounts.tce})</option>
                </select>
              </div>
              <div className="form-field">
                <label>Clase</label>
                <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                  <option value="">Todas</option>
                  {SRD_CLASSES.filter((c) => c.spellcasting).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Nivel</label>
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="0">Trucos</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                    <option key={l} value={l}>
                      Nivel {l}
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
                {race.name}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.9rem" }}>
                  ({race.nameEn})
                </span>
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {race.size} · {race.speed} ft · Idiomas: {race.languages.join(", ")}
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                Bonos:{" "}
                {Object.entries(race.abilityBonuses)
                  .map(([k, v]) => `${k.toUpperCase()} +${v}`)
                  .join(", ") || "—"}
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
                    {race.subraces.length} subrazas
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
                {cls.name}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.9rem" }}>
                  d{cls.hitDie} · {cls.nameEn}
                </span>
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Salvaciones: {cls.savingThrows.map((a) => a.toUpperCase()).join(", ")} ·{" "}
                {cls.spellcasting
                  ? `Conjuros (${cls.spellcasting.type}, ${cls.spellcasting.ability.toUpperCase()})`
                  : "Sin conjuros"}
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
                  {cls.subclasses.length} subclases
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
            Mostrando {filteredSpells.length} de {SRD_SPELLS.length} hechizos
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Nivel</th>
                  <th>Nombre</th>
                  <th>Escuela</th>
                  <th>Tiempo</th>
                  <th>Clases</th>
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
                      <td>{spell.level === 0 ? "Truco" : spell.level}</td>
                      <td>
                        <strong>{spell.name}</strong>
                        {spell.ritual && <span className="tag">Ritual</span>}
                        {spell.concentration && <span className="tag">Conc.</span>}
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
                            <strong>Alcance:</strong> {spell.range} · <strong>Componentes:</strong>{" "}
                            {spell.components} · <strong>Duración:</strong> {spell.duration}
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
