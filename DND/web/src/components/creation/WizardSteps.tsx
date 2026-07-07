import type { Ability, Character } from "../../types/character";
import type { SrdClass, SrdRace } from "../../data/srd/types";
import {
  SRD_CLASSES,
  SRD_RACES,
  SRD_BACKGROUNDS,
} from "../../data/srd";
import { finalizeCharacter } from "../../data/character-factory";
import { getAbilityMod } from "../../engine/formulas";
import { generateRandomName } from "../../engine/dice";
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

type DraftProps = {
  draft: Character;
  onChange: (char: Character) => void;
};

export function WizardNameStep({ draft, onChange }: DraftProps) {
  const { t } = useLocale();

  return (
    <section className="wizard-panel">
      <p className="wizard-hint">{t("wizard.nameQuestion")}</p>
      <div className="wizard-inline-actions">
        <input
          className="input-lg"
          aria-label={t("wizard.nameQuestion")}
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
  );
}

type RaceStepProps = DraftProps & {
  raceId: string;
  subraceId: string;
  race: SrdRace | undefined;
  onApplyRace: (raceId: string, subraceId?: string) => void;
};

export function WizardRaceStep({ raceId, subraceId, race, onApplyRace }: RaceStepProps) {
  const { locale, t } = useLocale();

  return (
    <section className="wizard-panel">
      <p className="wizard-hint">{t("wizard.raceHint")}</p>
      <div className="card-grid">
        {SRD_RACES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`pick-card ${raceId === r.id ? "pick-card--selected" : ""}`}
            onClick={() => onApplyRace(r.id)}
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
              onClick={() => onApplyRace(raceId)}
            >
              {t("wizard.base")}
            </button>
            {race.subraces.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`chip-btn ${subraceId === s.id ? "chip-btn--on" : ""}`}
                onClick={() => onApplyRace(raceId, s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

type ClassStepProps = DraftProps & {
  classId: string;
  subclassId: string;
  cls: SrdClass | undefined;
  onApplyClass: (classId: string, subclassId?: string) => void;
};

export function WizardClassStep({ classId, subclassId, cls, onApplyClass }: ClassStepProps) {
  const { locale, t } = useLocale();

  return (
    <section className="wizard-panel">
      <p className="wizard-hint">{t("wizard.classHint")}</p>
      <div className="card-grid">
        {SRD_CLASSES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`pick-card ${classId === c.id ? "pick-card--selected" : ""}`}
            onClick={() => onApplyClass(c.id)}
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
              onClick={() => onApplyClass(classId)}
            >
              {t("wizard.noSubclass")}
            </button>
            {cls.subclasses.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`chip-btn ${subclassId === s.id ? "chip-btn--on" : ""}`}
                onClick={() => onApplyClass(classId, s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

type BackgroundStepProps = DraftProps & {
  backgroundId: string;
  onApplyBackground: (backgroundId: string) => void;
};

export function WizardBackgroundStep({ backgroundId, onApplyBackground }: BackgroundStepProps) {
  const { t } = useLocale();
  const background = SRD_BACKGROUNDS.find((b) => b.id === backgroundId);

  return (
    <section className="wizard-panel">
      <p className="wizard-hint">{t("wizard.backgroundHint")}</p>
      <div className="chip-row" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className={`chip-btn ${!backgroundId ? "chip-btn--on" : ""}`}
          onClick={() => onApplyBackground("")}
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
            onClick={() => onApplyBackground(b.id)}
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
  );
}

type AbilitiesStepProps = DraftProps & {
  cls: SrdClass | undefined;
  onStandardArray: () => void;
  onRollAttributes: () => void;
};

export function WizardAbilitiesStep({ draft, onChange, cls, onStandardArray, onRollAttributes }: AbilitiesStepProps) {
  const { t } = useLocale();

  return (
    <section className="wizard-panel">
      <p className="wizard-hint">{t("wizard.abilitiesHint")}</p>
      <div className="wizard-action-row">
        <button type="button" className="btn btn-secondary btn-block" onClick={onStandardArray} disabled={!cls}>
          {t("wizard.standardArray")}
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={onRollAttributes}>
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
  );
}

type SummaryStepProps = DraftProps & {
  cls: SrdClass | undefined;
};

export function WizardSummaryStep({ draft, cls }: SummaryStepProps) {
  const { t } = useLocale();

  return (
    <section className="wizard-panel wizard-panel--summary">
      <div className="summary-hero">
        <h2>{draft.name}</h2>
        <p>
          {draft.race}
          {draft.heritage ? ` · ${draft.heritage}` : ""}
        </p>
        <p>
          {draft.classes[0]?.className}
          {draft.classes[0]?.subclass ? ` — ${draft.classes[0].subclass}` : ""} · {t("list.levelShort")}{" "}
          {draft.level}
        </p>
        {draft.background && <p>{t("wizard.backgroundLabel", { name: draft.background })}</p>}
      </div>
      <ul className="summary-list">
        <li>{t("wizard.estimatedHp", { value: finalizeCharacter(draft).resources.maxHP })}</li>
        <li>{t("wizard.traits", { count: draft.traits.length })}</li>
        {cls?.spellcasting && <li>{t("wizard.autoSpells")}</li>}
      </ul>
    </section>
  );
}
