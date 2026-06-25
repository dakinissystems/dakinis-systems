import { useMemo, useState } from "react";
import type { Ability, Character } from "../../types/character";
import {
  SRD_CLASSES,
  SRD_RACES,
  applyClassToCharacter,
  applyRaceToCharacter,
  spellsByClass,
  srdSpellToCharacterSpell,
} from "../../data/srd";
import {
  STANDARD_ARRAY,
  finalizeCharacter,
  suggestedAbilityOrder,
} from "../../data/character-factory";
import { getAbilityMod } from "../../engine/formulas";

const STEPS = ["Nombre", "Raza", "Clase", "Atributos", "Listo"] as const;
const ABILITY_LABELS: Record<Ability, string> = {
  str: "Fuerza",
  dex: "Destreza",
  con: "Constitución",
  int: "Inteligencia",
  wis: "Sabiduría",
  cha: "Carisma",
};

type Props = {
  draft: Character;
  onChange: (char: Character) => void;
  onComplete: (char: Character) => void;
  onCancel: () => void;
};

export function CharacterWizard({ draft, onChange, onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [raceId, setRaceId] = useState("");
  const [subraceId, setSubraceId] = useState("");
  const [classId, setClassId] = useState("");
  const [subclassId, setSubclassId] = useState("");

  const race = SRD_RACES.find((r) => r.id === raceId);
  const cls = SRD_CLASSES.find((c) => c.id === classId);

  const canNext = useMemo(() => {
    if (step === 0) return draft.name.trim().length >= 2;
    if (step === 1) return !!raceId;
    if (step === 2) return !!classId;
    if (step === 3) return true;
    return true;
  }, [step, draft.name, raceId, classId]);

  const applyRace = (rId: string, sId?: string) => {
    setRaceId(rId);
    setSubraceId(sId ?? "");
    onChange(applyRaceToCharacter(draft, rId, sId));
  };

  const applyClass = (cId: string, sId?: string) => {
    setClassId(cId);
    setSubclassId(sId ?? "");
    onChange(applyClassToCharacter(draft, cId, sId));
  };

  const applyStandardArray = () => {
    if (!cls) return;
    const order = suggestedAbilityOrder(cls.primaryAbility);
    const scores = [...STANDARD_ARRAY];
    const abilities = { ...draft.abilities };
    order.forEach((ab, i) => {
      abilities[ab] = scores[i] ?? 10;
    });
    onChange({ ...draft, abilities });
  };

  const finish = () => {
    let char = finalizeCharacter(draft);
    if (classId && cls?.spellcasting) {
      const spells = spellsByClass(classId, 1)
        .filter((s) => s.level <= 1)
        .slice(0, 6)
        .map((s) => srdSpellToCharacterSpell(s, false));
      char = { ...char, spells };
    }
    onComplete(char);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const back = () => {
    if (step === 0) onCancel();
    else setStep(step - 1);
  };

  return (
    <div className="screen screen--wizard">
      <header className="wizard-header">
        <button type="button" className="btn-icon" onClick={back} aria-label="Atrás">
          ←
        </button>
        <div className="wizard-header__center">
          <span className="wizard-header__step">
            Paso {step + 1} de {STEPS.length}
          </span>
          <h1>{STEPS[step]}</h1>
        </div>
        <button type="button" className="btn-text" onClick={onCancel}>
          Salir
        </button>
      </header>

      <div className="wizard-progress" aria-hidden>
        {STEPS.map((_, i) => (
          <span key={i} className={`wizard-progress__dot ${i <= step ? "wizard-progress__dot--on" : ""}`} />
        ))}
      </div>

      <div className="wizard-body">
        {step === 0 && (
          <section className="wizard-panel">
            <p className="wizard-hint">¿Cómo se llama tu aventurero?</p>
            <input
              className="input-lg"
              autoFocus
              placeholder="Ej: Aelindra"
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
            />
            <label className="form-field" style={{ marginTop: "1rem" }}>
              <span>Alineamiento</span>
              <select
                value={draft.alignment}
                onChange={(e) => onChange({ ...draft, alignment: e.target.value })}
              >
                {["Legal Bueno", "Neutral Bueno", "Caótico Bueno", "Legal Neutral", "Neutral", "Caótico Neutral", "Legal Malo", "Neutral Malo", "Caótico Malo"].map(
                  (a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ),
                )}
              </select>
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="wizard-panel">
            <p className="wizard-hint">Elige tu raza</p>
            <div className="card-grid">
              {SRD_RACES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`pick-card ${raceId === r.id ? "pick-card--selected" : ""}`}
                  onClick={() => applyRace(r.id)}
                >
                  <strong>{r.name}</strong>
                  <span>{r.nameEn}</span>
                </button>
              ))}
            </div>
            {race?.subraces && race.subraces.length > 0 && (
              <>
                <p className="wizard-hint" style={{ marginTop: "1rem" }}>
                  Herencia / subraza
                </p>
                <div className="chip-row">
                  <button
                    type="button"
                    className={`chip-btn ${!subraceId ? "chip-btn--on" : ""}`}
                    onClick={() => applyRace(raceId)}
                  >
                    Base
                  </button>
                  {race.subraces.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`chip-btn ${subraceId === s.id ? "chip-btn--on" : ""}`}
                      onClick={() => applyRace(raceId, s.id)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="wizard-panel">
            <p className="wizard-hint">Elige tu clase</p>
            <div className="card-grid">
              {SRD_CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`pick-card ${classId === c.id ? "pick-card--selected" : ""}`}
                  onClick={() => applyClass(c.id)}
                >
                  <strong>{c.name}</strong>
                  <span>d{c.hitDie} · {c.nameEn}</span>
                </button>
              ))}
            </div>
            {cls && cls.subclasses.length > 0 && (
              <>
                <p className="wizard-hint" style={{ marginTop: "1rem" }}>
                  Subclase (nivel 3+, opcional ahora)
                </p>
                <div className="chip-row">
                  <button
                    type="button"
                    className={`chip-btn ${!subclassId ? "chip-btn--on" : ""}`}
                    onClick={() => applyClass(classId)}
                  >
                    Sin subclase
                  </button>
                  {cls.subclasses.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`chip-btn ${subclassId === s.id ? "chip-btn--on" : ""}`}
                      onClick={() => applyClass(classId, s.id)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="wizard-panel">
            <p className="wizard-hint">Atributos base (antes de bonos raciales)</p>
            <button type="button" className="btn btn-secondary btn-block" onClick={applyStandardArray} disabled={!cls}>
              Usar array estándar (15, 14, 13, 12, 10, 8)
            </button>
            <div className="ability-row">
              {(Object.keys(ABILITY_LABELS) as Ability[]).map((key) => {
                const total = draft.abilities[key] + draft.abilityBonuses[key];
                const mod = getAbilityMod(draft, key);
                return (
                  <div key={key} className="ability-cell">
                    <span className="ability-cell__abbr">{key.toUpperCase()}</span>
                    <button
                      type="button"
                      className="ability-cell__btn"
                      onClick={() =>
                        onChange({
                          ...draft,
                          abilities: { ...draft.abilities, [key]: Math.min(20, draft.abilities[key] + 1) },
                        })
                      }
                      aria-label={`Subir ${ABILITY_LABELS[key]}`}
                    >
                      +
                    </button>
                    <span className="ability-cell__score">{total}</span>
                    <span className="ability-cell__mod">{mod >= 0 ? `+${mod}` : mod}</span>
                    <button
                      type="button"
                      className="ability-cell__btn"
                      onClick={() =>
                        onChange({
                          ...draft,
                          abilities: { ...draft.abilities, [key]: Math.max(8, draft.abilities[key] - 1) },
                        })
                      }
                      aria-label={`Bajar ${ABILITY_LABELS[key]}`}
                    >
                      −
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="wizard-panel wizard-panel--summary">
            <div className="summary-hero">
              <h2>{draft.name}</h2>
              <p>
                {draft.race}
                {draft.heritage ? ` · ${draft.heritage}` : ""}
              </p>
              <p>
                {draft.classes[0]?.className}
                {draft.classes[0]?.subclass ? ` — ${draft.classes[0].subclass}` : ""} · Nv {draft.level}
              </p>
            </div>
            <ul className="summary-list">
              <li>PV estimados: {finalizeCharacter(draft).resources.maxHP}</li>
              <li>Rasgos: {draft.traits.length}</li>
              {cls?.spellcasting && <li>Hechizos iniciales importados automáticamente</li>}
            </ul>
          </section>
        )}
      </div>

      <footer className="wizard-footer">
        <button type="button" className="btn btn-block" disabled={!canNext} onClick={next}>
          {step === STEPS.length - 1 ? "Crear personaje" : "Continuar"}
        </button>
      </footer>
    </div>
  );
}
