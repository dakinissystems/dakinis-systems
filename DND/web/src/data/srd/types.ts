import type { Ability } from "../../types/character";

export interface SrdTrait {
  name: string;
  description: string;
}

export interface SrdSubrace {
  id: string;
  name: string;
  abilityBonuses: Partial<Record<Ability, number>>;
  traits: SrdTrait[];
}

export interface SrdRace {
  id: string;
  name: string;
  nameEn: string;
  abilityBonuses: Partial<Record<Ability, number>>;
  speed: number;
  size: string;
  languages: string[];
  traits: SrdTrait[];
  subraces?: SrdSubrace[];
}

export type SpellBook = "srd" | "xge" | "tce";

export interface SrdSubclass {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  features: SrdTrait[];
  source?: SpellBook;
}

export interface SrdClass {
  id: string;
  name: string;
  nameEn: string;
  hitDie: number;
  primaryAbility: Ability[];
  savingThrows: Ability[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies?: string[];
  skillChoices: { count: number; from: string[] };
  spellcasting?: {
    ability: Ability;
    type: "full" | "half" | "pact" | "none";
  };
  features: (SrdTrait & { level: number })[];
  subclasses: SrdSubclass[];
  fightingStyles?: string[];
}

export interface SrdSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  source: SpellBook;
  ritual?: boolean;
  concentration?: boolean;
}
