import type { Character } from "../types/character";

import {

  calculateAC,

  className,

  extraAttacks,

  getAbilityMod,

  getAbilityScore,
  spellSaveDC,
} from "../engine/formulas";



type Props = {

  character: Character;

  onChange: (fn: (c: Character) => Character) => void;

  compact?: boolean;

};



const ABILITIES = [

  { key: "str" as const, label: "FUE" },

  { key: "dex" as const, label: "DES" },

  { key: "con" as const, label: "CON" },

  { key: "int" as const, label: "INT" },

  { key: "wis" as const, label: "SAB" },

  { key: "cha" as const, label: "CAR" },

];



export function CharacterSheet({ character, onChange, compact }: Props) {

  const ac = calculateAC(character);



  return (

    <div className="sheet-sections">

      <section className="panel panel--flush">

        <div className="form-row form-row--2">

          <div className="form-field">

            <label>Nombre</label>

            <input

              value={character.name}

              onChange={(e) => onChange((c) => ({ ...c, name: e.target.value }))}

            />

          </div>

          <div className="form-field form-field--narrow">

            <label>Nivel</label>

            <input

              type="number"

              inputMode="numeric"

              min={1}

              max={20}

              value={character.level}

              onChange={(e) =>

                onChange((c) => ({

                  ...c,

                  level: Math.max(1, Math.min(20, +e.target.value || 1)),

                  proficiencyBonus: Math.floor((Math.max(1, Math.min(20, +e.target.value || 1)) - 1) / 4) + 2,

                }))

              }

            />

          </div>

        </div>

        <p className="meta-line">

          {character.race}

          {character.heritage ? ` · ${character.heritage}` : ""} · {className(character)}

        </p>

      </section>



      <section className="panel">

        <h2 className="panel-title">Combate</h2>

        <div className="stat-row">

          <div className="stat-block stat-block--sm">

            <div className="label">CA</div>

            <div className="value">{ac}</div>

          </div>

          <div className="stat-block stat-block--sm">

            <div className="label">PB</div>

            <div className="value">+{character.proficiencyBonus}</div>

          </div>

          <div className="stat-block stat-block--sm">

            <div className="label">ATQ</div>

            <div className="value">{extraAttacks(character)}</div>

          </div>

          <div className="stat-block stat-block--sm">

            <div className="label">CD</div>

            <div className="value">{spellSaveDC(character)}</div>

          </div>

        </div>

      </section>



      <section className="panel">

        <h2 className="panel-title">Atributos</h2>

        <div className="ability-row ability-row--sheet">

          {ABILITIES.map(({ key, label }) => {

            const score = getAbilityScore(character, key);

            const mod = getAbilityMod(character, key);

            return (

              <div key={key} className="ability-cell ability-cell--readonly">

                <span className="ability-cell__abbr">{label}</span>

                <span className="ability-cell__score">{score}</span>

                <span className="ability-cell__mod">{mod >= 0 ? `+${mod}` : mod}</span>

              </div>

            );

          })}

        </div>

        {!compact && (

          <details className="collapse">

            <summary>Editar valores base</summary>

            <div className="ability-edit-grid">

              {ABILITIES.map(({ key, label }) => (

                <label key={key} className="form-field">

                  {label}

                  <input

                    type="number"

                    inputMode="numeric"

                    min={1}

                    max={30}

                    value={character.abilities[key]}

                    onChange={(e) =>

                      onChange((c) => ({

                        ...c,

                        abilities: { ...c.abilities, [key]: +e.target.value || 10 },

                      }))

                    }

                  />

                </label>

              ))}

            </div>

          </details>

        )}

      </section>



      {character.traits.length > 0 && (

        <section className="panel">

          <h2 className="panel-title">Rasgos</h2>

          <div className="trait-list">

            {character.traits.map((t, i) => (

              <details key={i} className="trait-card">

                <summary>

                  <strong>{t.name}</strong>

                  <span className="trait-card__src">{t.source}</span>

                </summary>

                <p>{t.description}</p>

              </details>

            ))}

          </div>

        </section>

      )}



      {!compact && character.feats.length > 0 && (

        <section className="panel">

          <h2 className="panel-title">Dotes</h2>

          <div className="check-list">

            {character.feats.map((f) => (

              <label key={f.id} className="checkbox-label checkbox-label--card">

                <input

                  type="checkbox"

                  checked={f.isTaken}

                  onChange={(e) =>

                    onChange((c) => ({

                      ...c,

                      feats: c.feats.map((ft) =>

                        ft.id === f.id ? { ...ft, isTaken: e.target.checked } : ft,

                      ),

                    }))

                  }

                />

                <span>

                  <strong>{f.name}</strong>

                  <small>{f.description}</small>

                </span>

              </label>

            ))}

          </div>

        </section>

      )}

    </div>

  );

}


