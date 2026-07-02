import type { Ability, Character } from "../types/character";
import { proficiencyBonus } from "./srd/classes";
import { estimateMaxHP } from "../engine/formulas";

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

const ABILITY_ORDER: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

/** Orden sugerido de asignación según atributos primarios de la clase */
export function suggestedAbilityOrder(primary: Ability[]): Ability[] {
  const rest = ABILITY_ORDER.filter((a) => !primary.includes(a));
  return [...primary, ...rest];
}

export function createBlankCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: "",
    race: "",
    alignment: "Neutral",
    languages: ["Común"],
    classes: [{ className: "", level: 1 }],
    level: 1,
    proficiencyBonus: 2,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    savingThrowProficiencies: [],
    skillProficiencies: [],
    skillExpertise: [],
    weapons: [],
    armors: [],
    spells: [],
    inventory: [],
    combatActions: [],
    feats: [],
    fightingStyles: [],
    traits: [],
    sessionNotes: [],
    resources: {
      currentHP: 10,
      maxHP: 10,
      tempHP: 0,
      hitDice: "1d8",
      hitDiceUsed: 0,
      layOnHandsRemaining: 0,
      breathWeaponUsed: false,
      spellSlots: {},
      channelDivinityUsed: 0,
    },
    setupComplete: false,
  };
}

export function finalizeCharacter(char: Character): Character {
  const level = char.level;
  const maxHP = estimateMaxHP(char);
  return {
    ...char,
    level,
    proficiencyBonus: proficiencyBonus(level),
    classes: char.classes.map((c) => ({ ...c, level })),
    resources: {
      ...char.resources,
      currentHP: maxHP,
      maxHP,
    },
    setupComplete: true,
  };
}
