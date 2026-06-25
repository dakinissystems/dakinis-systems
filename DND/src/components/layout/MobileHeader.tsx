import { calculateAC, className, getAbilityMod } from "../../engine/formulas";
import type { Character } from "../../types/character";

type Props = {
  character: Character;
  onBack: () => void;
  onSwitch: () => void;
};

export function MobileHeader({ character, onBack, onSwitch }: Props) {
  const ac = calculateAC(character);
  const hp = `${character.resources.currentHP}/${character.resources.maxHP}`;

  return (
    <header className="mobile-header">
      <button type="button" className="mobile-header__back btn-icon" onClick={onBack} aria-label="Mis personajes">
        ←
      </button>
      <button type="button" className="mobile-header__main" onClick={onSwitch}>
        <span className="mobile-header__name">{character.name || "Sin nombre"}</span>
        <span className="mobile-header__meta">
          Nv {character.level} · {character.race || "—"} · {character.classes[0]?.className || "—"}
        </span>
      </button>
      <div className="mobile-header__chips" aria-label="Resumen rápido">
        <span className="chip">CA {ac}</span>
        <span className="chip chip--hp">PV {hp}</span>
      </div>
    </header>
  );
}

export function CharacterSummaryChips({ character }: { character: Character }) {
  return (
    <div className="summary-chips">
      <span className="chip">PB +{character.proficiencyBonus}</span>
      <span className="chip">FUE {getAbilityMod(character, "str") >= 0 ? "+" : ""}{getAbilityMod(character, "str")}</span>
      <span className="chip">{className(character)}</span>
    </div>
  );
}
