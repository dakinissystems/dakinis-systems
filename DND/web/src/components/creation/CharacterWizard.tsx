import { useMemo, useState } from "react";
import type { Ability, Character } from "../../types/character";
import {
  SRD_CLASSES,
  SRD_RACES,
  SRD_BACKGROUNDS,
  applyClassToCharacter,
  applyRaceToCharacter,
  applyBackgroundToCharacter,
  spellsByClass,
  srdSpellToCharacterSpell,
} from "../../data/srd";
import {
  STANDARD_ARRAY,
  finalizeCharacter,
  suggestedAbilityOrder,
} from "../../data/character-factory";
import { getAbilityMod } from "../../engine/formulas";
import { generateRandomAttributes, generateRandomName } from "../../engine/dice";
import { useLocale } from "../../context/LocaleContext";
import {
  ALIGNMENT_KEYS,
  alignmentLabel,
  normalizeAlignmentKey,
  srdDisplayName,
} from "../../lib/locale-utils";

const ABILITY_KEYS: Record<Ability, string> = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
};

type Props = {
  draft: Character;
  onChange: (char: Character) => void;
  onComplete: (char: Character) => void;
  onCancel: () => void;
};

export function CharacterWizard({ draft, onChange, onComplete, onCancel }: Props) {
  const { locale, t } = useLocale();
  const steps = [
    t("wizard.steps.name"),
    t("wizard.steps.race"),
    t("wizard.steps.class"),
    t("wizard.steps.background"),
    t("wizard.steps.abilities"),
    t("wizard.steps.ready"),
  ] as const;
  const [step, setStep] = useState(0);
  const [raceId, setRaceId] = useState("");
  const [subraceId, setSubraceId] = useState("");
  const [classId, setClassId] = useState("");
  const [subclassId, setSubclassId] = useState("");
  const [backgroundId, setBackgroundId] = useState("");

  const race = SRD_RACES.find((r) => r.id === raceId);
  const cls = SRD_CLASSES.find((c) => c.id === classId);
  const background = SRD_BACKGROUNDS.find((b) => b.id === backgroundId);

  const canNext = useMemo(() => {
    if (step === 0) return draft.name.trim().length >= 2;
    if (step === 1) return !!raceId;
    if (step === 2) return !!classId;
    if (step === 3) return true;
    if (step === 4) return true;
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

  const applyBackground = (bId: string) => {
    setBackgroundId(bId);
    if (bId) onChange(applyBackgroundToCharacter(draft, bId));
    else onChange({ ...draft, background: undefined });
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

  const rollAttributes = () => {
    onChange({ ...draft, abilities: generateRandomAttributes() });
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
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const back = () => {
    if (step === 0) onCancel();
    else setStep(step - 1);
  };

  return (
    <div className="screen screen--wizard">
      <header className="wizard-header">
        <button type="button" className="btn-icon" onClick={back} aria-label={t("wizard.back")}>
          ←
        </button>
        <div className="wizard-header__center">
          <span className="wizard-header__step">
            {t("wizard.stepPrefix")} {step + 1} {t("wizard.stepOf")} {steps.length}
          </span>
          <h1>{steps[step]}</h1>
        </div>
        <button type="button" className="btn-text" onClick={onCancel}>
          {t("wizard.exit")}
        </button>
      </header>

      <div className="wizard-progress" aria-hidden>
        {steps.map((_, i) => (
          <span key={i} className={`wizard-progress__dot ${i <= step ? "wizard-progress__dot--on" : ""}`} />
        ))}
      </div>

      <div className="wizard-body">
        {step === 0 && (
          <section className="wizard-panel">
            <p className="wizard-hint">{t("wizard.nameQuestion")}</p>
            <div className="wizard-inline-actions">
              <input
                className="input-lg"
                autoFocus
                placeholder="Ex: Aelindra"
                value={draft.name}
                onChange={(e) => onChange({ ...draft, name: e.target.value })}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onChange({ ...draft, name: generateRandomName() })}
              >
                {t("wizard.random")}
              </button>
            </div>
            <label className="form-field" style={{ marginTop: "1rem" }}>
              <span>{t("wizard.alignment")}</span>
              <select
                value={normalizeAlignmentKey(draft.alignment)}
                onChange={(e) => onChange({ ...draft, alignment: e.target.value })}
              >
                {ALIGNMENT_KEYS.map((a) => (
                  <option key={a} value={a}>
                    {alignmentLabel(a, t)}
                  </option>
                ))}
              </select>
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="wizard-panel">
            <p className="wizard-hint">{t("wizard.raceHint")}</p>
            <div className="card-grid">
              {SRD_RACES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`pick-card ${raceId === r.id ? "pick-card--selected" : ""}`}
                  onClick={() => applyRace(r.id)}
                >
                  <strong>{srdDisplayName(r, locale)}</strong>
                  <span>{locale === "en" ? r.name : r.nameEn}</span>
                </button>
              ))}
            </div>
            {race?.subraces && race.subraces.length > 0 && (
              <>
                <p className="wizard-hint" style={{ marginTop: "1rem" }}>
                  {t("wizard.heritageHint")}
                </p>
                <div className="chip-row">
                  <button
                    type="button"
                    className={`chip-btn ${!subraceId ? "chip-btn--on" : ""}`}
                    onClick={() => applyRace(raceId)}
                  >
                    {t("wizard.base")}
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
            <p className="wizard-hint">{t("wizard.classHint")}</p>
            <div className="card-grid">
              {SRD_CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`pick-card ${classId === c.id ? "pick-card--selected" : ""}`}
                  onClick={() => applyClass(c.id)}
                >
                  <strong>{srdDisplayName(c, locale)}</strong>
                  <span>
                    {t("wizard.hitDie", { die: c.hitDie })} · {locale === "en" ? c.name : c.nameEn}
                  </span>
                </button>
              ))}
            </div>
            {cls && cls.subclasses.length > 0 && (
              <>
                <p className="wizard-hint" style={{ marginTop: "1rem" }}>
                  {t("wizard.subclassHint")}
                </p>
                <div className="chip-row">
                  <button
                    type="button"
                    className={`chip-btn ${!subclassId ? "chip-btn--on" : ""}`}
                    onClick={() => applyClass(classId)}
                  >
                    {t("wizard.noSubclass")}
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
            <p className="wizard-hint">{t("wizard.backgroundHint")}</p>
            <div className="chip-row" style={{ marginBottom: "1rem" }}>
              <button
                type="button"
                className={`chip-btn ${!backgroundId ? "chip-btn--on" : ""}`}
                onClick={() => applyBackground("")}
              >
                {t("wizard.noBackground")}
              </button>
            </div>
            <div className="card-grid">
              {SRD_BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`pick-card ${backgroundId === b.id ? "pick-card--selected" : ""}`}
                  onClick={() => applyBackground(b.id)}
                >
                  <strong>{b.name}</strong>
                  <span>{b.skillProficiencies.join(", ")}</span>
                </button>
              ))}
            </div>
            {background && (
              <p className="wizard-hint" style={{ marginTop: "1rem" }}>
                {background.description}
              </p>
            )}
          </section>
        )}

        {step === 4 && (
          <section className="wizard-panel">
            <p className="wizard-hint">{t("wizard.abilitiesHint")}</p>
            <div className="wizard-action-row">
              <button type="button" className="btn btn-secondary btn-block" onClick={applyStandardArray} disabled={!cls}>
                {t("wizard.standardArray")}
              </button>
              <button type="button" className="btn btn-secondary btn-block" onClick={rollAttributes}>
                {t("wizard.roll4d6")}
              </button>
            </div>
            <div className="ability-row">
              {(Object.keys(ABILITY_KEYS) as Ability[]).map((key) => {
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
                      aria-label={t("wizard.increaseAbility", {
                        ability: t(`abilities.full.${ABILITY_KEYS[key]}`),
                      })}
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
                      aria-label={t("wizard.decreaseAbility", {
                        ability: t(`abilities.full.${ABILITY_KEYS[key]}`),
                      })}
                    >
                      −
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="wizard-panel wizard-panel--summary">
            <div className="summary-hero">
              <h2>{draft.name}</h2>
              <p>
                {draft.race}
                {draft.heritage ? ` · ${draft.heritage}` : ""}
              </p>
              <p>
                {draft.classes[0]?.className}
                {draft.classes[0]?.subclass ? ` — ${draft.classes[0].subclass}` : ""} · {t("list.levelShort")} {draft.level}
              </p>
              {draft.background && <p>{t("wizard.backgroundLabel", { name: draft.background })}</p>}
            </div>
            <ul className="summary-list">
              <li>{t("wizard.estimatedHp", { value: finalizeCharacter(draft).resources.maxHP })}</li>
              <li>{t("wizard.traits", { count: draft.traits.length })}</li>
              {cls?.spellcasting && <li>{t("wizard.autoSpells")}</li>}
            </ul>
          </section>
        )}
      </div>

      <footer className="wizard-footer">
        <button type="button" className="btn btn-block" disabled={!canNext} onClick={next}>
          {step === steps.length - 1 ? t("wizard.createCharacter") : t("wizard.continue")}
        </button>
      </footer>
    </div>
  );
}
