import { calculateAC, className, getAbilityMod } from "../../engine/formulas";
import type { Character } from "../../types/character";
import { useLocale } from "../../context/LocaleContext";

type Props = {
  character: Character;
  onBack: () => void;
  onSwitch: () => void;
  onDice?: () => void;
};

export function MobileHeader({ character, onBack, onSwitch, onDice }: Props) {
  const { t } = useLocale();
  const ac = calculateAC(character);
  const hp = `${character.resources.currentHP}/${character.resources.maxHP}`;

  return (
    <header className="mobile-header">
      <button type="button" className="mobile-header__back btn-icon" onClick={onBack} aria-label={t("header.myCharacters")}>
        ←
      </button>
      <button type="button" className="mobile-header__main" onClick={onSwitch}>
        <span className="mobile-header__name">{character.name || t("header.unnamed")}</span>
        <span className="mobile-header__meta">
          {t("header.levelShort")} {character.level} · {character.race || "-"} · {character.classes[0]?.className || "-"}
        </span>
      </button>
      <div className="mobile-header__chips" aria-label={t("header.quickSummary")}>
        {onDice && (
          <button type="button" className="chip chip--dice" onClick={onDice} aria-label={t("header.diceRoller")}>
            🎲
          </button>
        )}
        <span className="chip">{t("header.ac")} {ac}</span>
        <span className="chip chip--hp">{t("header.hp")} {hp}</span>
      </div>
    </header>
  );
}

export function CharacterSummaryChips({ character }: { character: Character }) {
  const { t } = useLocale();
  return (
    <div className="summary-chips">
      <span className="chip">
        {t("header.pb")} +{character.proficiencyBonus}
      </span>
      <span className="chip">FUE {getAbilityMod(character, "str") >= 0 ? "+" : ""}{getAbilityMod(character, "str")}</span>
      <span className="chip">{className(character)}</span>
    </div>
  );
}
