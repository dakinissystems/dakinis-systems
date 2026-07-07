import { useMemo, useState } from "react";
import type { Character } from "../../types/character";
import {
  SRD_CLASSES,
  SRD_RACES,
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
import { generateRandomAttributes } from "../../engine/dice";
import { useLocale } from "../../context/LocaleContext";
import {
  WizardAbilitiesStep,
  WizardBackgroundStep,
  WizardClassStep,
  WizardNameStep,
  WizardRaceStep,
  WizardSummaryStep,
} from "./WizardSteps";

type Props = {
  draft: Character;
  onChange: (char: Character) => void;
  onComplete: (char: Character) => void;
  onCancel: () => void;
};

export function CharacterWizard({ draft, onChange, onComplete, onCancel }: Props) {
  const { t } = useLocale();
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
    if (step < steps.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const back = () => {
    if (step === 0) onCancel();
    else setStep((s) => s - 1);
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
        {step === 0 && <WizardNameStep draft={draft} onChange={onChange} />}
        {step === 1 && (
          <WizardRaceStep
            draft={draft}
            onChange={onChange}
            raceId={raceId}
            subraceId={subraceId}
            race={race}
            onApplyRace={applyRace}
          />
        )}
        {step === 2 && (
          <WizardClassStep
            draft={draft}
            onChange={onChange}
            classId={classId}
            subclassId={subclassId}
            cls={cls}
            onApplyClass={applyClass}
          />
        )}
        {step === 3 && (
          <WizardBackgroundStep
            draft={draft}
            onChange={onChange}
            backgroundId={backgroundId}
            onApplyBackground={applyBackground}
          />
        )}
        {step === 4 && (
          <WizardAbilitiesStep
            draft={draft}
            onChange={onChange}
            cls={cls}
            onStandardArray={applyStandardArray}
            onRollAttributes={rollAttributes}
          />
        )}
        {step === 5 && <WizardSummaryStep draft={draft} onChange={onChange} cls={cls} />}
      </div>

      <footer className="wizard-footer">
        <button type="button" className="btn btn-block" disabled={!canNext} onClick={next}>
          {step === steps.length - 1 ? t("wizard.createCharacter") : t("wizard.continue")}
        </button>
      </footer>
    </div>
  );
}
