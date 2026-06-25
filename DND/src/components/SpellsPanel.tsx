import { useMemo, useState } from "react";
import type { Character, Spell } from "../types/character";
import {
  SRD_SPELLS,
  resolveClassId,
  srdSpellToCharacterSpell,
  spellsByClass,
} from "../data/srd";
import type { SpellBook } from "../data/srd/types";
import { maxPreparedSpells } from "../engine/formulas";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

export function SpellsPanel({ character, onChange }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<Spell | null>(null);
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [showClassOnly, setShowClassOnly] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SpellBook | "">("");

  const classId = resolveClassId(character);
  const prepared = character.spells.filter((s) => s.isPrepared);
  const maxPrep = maxPreparedSpells(character);
  const knownNames = new Set(character.spells.map((s) => s.name.toLowerCase()));

  const catalog = useMemo(() => {
    let list = classId && showClassOnly ? spellsByClass(classId, 9) : SRD_SPELLS;
    if (sourceFilter) list = list.filter((s) => s.source === sourceFilter);
    if (levelFilter !== "") list = list.filter((s) => s.level === +levelFilter);
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [classId, showClassOnly, levelFilter, filter, sourceFilter]);

  const openCustom = () => {
    setDraft({
      id: crypto.randomUUID(),
      name: "",
      level: 1,
      school: "Evocation",
      castingTime: "1 Action",
      range: "Self",
      components: "V, S",
      duration: "Instantaneous",
      description: "",
      isPrepared: false,
      source: "custom",
    });
    setShowModal(true);
  };

  const addFromSrd = (spellId: string) => {
    const t = SRD_SPELLS.find((s) => s.id === spellId);
    if (!t || knownNames.has(t.name.toLowerCase())) return;
    onChange((c) => ({
      ...c,
      spells: [...c.spells, srdSpellToCharacterSpell(t)],
    }));
  };

  const addAllClassSpells = () => {
    if (!classId) return;
    const toAdd = spellsByClass(classId, character.level >= 17 ? 5 : character.level >= 13 ? 4 : character.level >= 7 ? 3 : character.level >= 3 ? 2 : 1)
      .filter((s) => !knownNames.has(s.name.toLowerCase()))
      .map((s) => srdSpellToCharacterSpell(s));
    if (toAdd.length === 0) return;
    onChange((c) => ({ ...c, spells: [...c.spells, ...toAdd] }));
  };

  const saveSpell = () => {
    if (!draft?.name.trim()) return;
    onChange((c) => {
      const exists = c.spells.some((s) => s.id === draft.id);
      return {
        ...c,
        spells: exists
          ? c.spells.map((s) => (s.id === draft.id ? draft : s))
          : [...c.spells, draft],
      };
    });
    setShowModal(false);
    setDraft(null);
  };

  const characterSpells = character.spells.filter(
    (s) =>
      !filter ||
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.school.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="grid-2">
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
            Mis hechizos — {prepared.length}/{maxPrep} preparados
          </h2>
          <button className="btn btn-sm" onClick={openCustom}>
            + Hechizo custom
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Prep.</th>
                <th>Nombre</th>
                <th>Nivel</th>
                <th>Escuela</th>
                <th>Origen</th>
                <th></th>
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
                      onChange={(e) => {
                        const next = e.target.checked;
                        if (next && prepared.length >= maxPrep && !s.isPrepared) return;
                        onChange((c) => ({
                          ...c,
                          spells: c.spells.map((x) =>
                            x.id === s.id ? { ...x, isPrepared: next } : x,
                          ),
                        }));
                      }}
                    />
                  </td>
                  <td>
                    <strong>{s.name}</strong>
                    {s.isAlwaysReady && <span className="badge badge-active"> Siempre listo</span>}
                  </td>
                  <td>{s.level === 0 ? "Truco" : s.level}</td>
                  <td>{s.school}</td>
                  <td>
                    {s.source === "custom" ? (
                      <span className="badge badge-custom">Custom</span>
                    ) : (
                      <span className="badge badge-custom" style={{ opacity: s.source === "srd" ? 0.75 : 1 }}>
                        {s.source.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td>
                    {s.source === "custom" && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setDraft({ ...s });
                            setShowModal(true);
                          }}
                        >
                          Editar
                        </button>{" "}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            onChange((c) => ({
                              ...c,
                              spells: c.spells.filter((x) => x.id !== s.id),
                            }))
                          }
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

      <section className="panel">
        <h2>Catálogo SRD ({catalog.length})</h2>
        <div className="form-row" style={{ marginBottom: "0.75rem" }}>
          <div className="form-field">
            <label>Buscar</label>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Nombre, escuela..." />
          </div>
          <div className="form-field">
            <label>Fuente</label>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as SpellBook | "")}>
              <option value="">Todas</option>
              <option value="srd">SRD</option>
              <option value="xge">Xanathar</option>
              <option value="tce">Tasha</option>
            </select>
          </div>
          <div className="form-field">
            <label>Nivel</label>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="0">Trucos</option>
              {[1, 2, 3, 4, 5].map((l) => (
                <option key={l} value={l}>
                  Nivel {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="checkbox-label" style={{ marginBottom: "0.75rem" }}>
          <input
            type="checkbox"
            checked={showClassOnly}
            onChange={(e) => setShowClassOnly(e.target.checked)}
            disabled={!classId}
          />
          Solo hechizos de mi clase{classId ? "" : " (selecciona clase en Ficha)"}
        </label>
        {classId && (
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: "0.75rem" }} onClick={addAllClassSpells}>
            Importar todos los de mi clase (nivel actual)
          </button>
        )}
        <div className="table-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Niv</th>
                <th>Nombre</th>
                <th>Fuente</th>
                <th>Escuela</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {catalog.slice(0, 80).map((s) => {
                const owned = knownNames.has(s.name.toLowerCase());
                return (
                  <tr key={s.id}>
                    <td>{s.level === 0 ? "T" : s.level}</td>
                    <td>{s.name}</td>
                    <td>
                      <span className="tag">{s.source.toUpperCase()}</span>
                    </td>
                    <td>{s.school}</td>
                    <td>
                      <button
                        className="btn btn-sm"
                        disabled={owned}
                        onClick={() => addFromSrd(s.id)}
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
              Usa el buscador para acotar ({catalog.length} resultados)
            </p>
          )}
        </div>
      </section>

      {showModal && draft && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Hechizo personalizado</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Nombre</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Nivel</label>
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={draft.level}
                  onChange={(e) => setDraft({ ...draft, level: +e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Escuela</label>
                <input value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Tiempo de lanzamiento</label>
                <input
                  value={draft.castingTime}
                  onChange={(e) => setDraft({ ...draft, castingTime: e.target.value })}
                />
              </div>
            </div>
            <div className="form-field">
              <label>Descripción</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn" onClick={saveSpell}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
