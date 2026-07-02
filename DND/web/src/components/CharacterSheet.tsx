import type { Character } from "../types/character";

import {

  calculateAC,

  className,

  extraAttacks,

  getAbilityMod,

  getAbilityScore,
  spellSaveDC,
} from "../engine/formulas";
import { useLocale } from "../context/LocaleContext";



type Props = {

  character: Character;

  onChange: (fn: (c: Character) => Character) => void;

  compact?: boolean;

};



const ABILITIES = [

  { key: "str" as const },

  { key: "dex" as const },

  { key: "con" as const },

  { key: "int" as const },

  { key: "wis" as const },

  { key: "cha" as const },

];



export function CharacterSheet({ character, onChange, compact }: Props) {
  const { t } = useLocale();

  const ac = calculateAC(character);



  return (

    <div className="sheet-sections">

      <section className="panel panel--flush">

        <div className="form-row form-row--2">

          <div className="form-field">

            <label>{t("characterSheet.name")}</label>

            <input

              value={character.name}

              onChange={(e) => onChange((c) => ({ ...c, name: e.target.value }))}

            />

          </div>

          <div className="form-field form-field--narrow">

            <label>{t("characterSheet.level")}</label>

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

          {character.background ? ` · ${character.background}` : ""}

        </p>

      </section>



      <section className="panel">

        <h2 className="panel-title">{t("characterSheet.combat")}</h2>

        <div className="stat-row">

          <div className="stat-block stat-block--sm">

            <div className="label">{t("header.ac")}</div>

            <div className="value">{ac}</div>

          </div>

          <div className="stat-block stat-block--sm">

            <div className="label">{t("characterSheet.pb")}</div>

            <div className="value">+{character.proficiencyBonus}</div>

          </div>

          <div className="stat-block stat-block--sm">

            <div className="label">{t("characterSheet.attacksShort")}</div>

            <div className="value">{extraAttacks(character)}</div>

          </div>

          <div className="stat-block stat-block--sm">

            <div className="label">{t("characterSheet.dc")}</div>

            <div className="value">{spellSaveDC(character)}</div>

          </div>

        </div>

      </section>



      <section className="panel">

        <h2 className="panel-title">{t("characterSheet.abilities")}</h2>

        <div className="ability-row ability-row--sheet">

          {ABILITIES.map(({ key }) => {

            const score = getAbilityScore(character, key);

            const mod = getAbilityMod(character, key);

            return (

              <div key={key} className="ability-cell ability-cell--readonly">

                <span className="ability-cell__abbr">{t(`abilities.abbr.${key}`)}</span>

                <span className="ability-cell__score">{score}</span>

                <span className="ability-cell__mod">{mod >= 0 ? `+${mod}` : mod}</span>

              </div>

            );

          })}

        </div>

        {!compact && (

          <details className="collapse">

            <summary>{t("characterSheet.editBaseValues")}</summary>

            <div className="ability-edit-grid">

              {ABILITIES.map(({ key }) => (

                <label key={key} className="form-field">

                  {t(`abilities.abbr.${key}`)}

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

          <h2 className="panel-title">{t("characterSheet.traits")}</h2>

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

          <h2 className="panel-title">{t("characterSheet.feats")}</h2>

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


