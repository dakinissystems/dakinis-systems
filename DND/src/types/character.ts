export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type ItemCategory =
  | "arma"
  | "armadura"
  | "escudo"
  | "curacion"
  | "herreria"
  | "magia"
  | "ornamento"
  | "supervivencia"
  | "otro";

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface AbilityBonuses {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface ClassLevel {
  className: string;
  subclass?: string;
  level: number;
}

export interface Weapon {
  id: string;
  name: string;
  isCustom: boolean;
  isActive: boolean;
  baseWeapon?: string;
  attackBonus: number;
  damageDice: string;
  damageBonus: number;
  damageType: string;
  range: string;
  properties: string[];
  notes?: string;
}

export interface Armor {
  id: string;
  name: string;
  isCustom: boolean;
  isEquipped: boolean;
  baseAC: number;
  acBonus: number;
  type: "ligera" | "media" | "pesada" | "escudo" | "otro";
  notes?: string;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  isPrepared: boolean;
  isAlwaysReady?: boolean;
  source: "srd" | "xge" | "tce" | "custom";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  description?: string;
  isCustom: boolean;
  tags?: string[];
}

export interface CombatAction {
  id: string;
  name: string;
  origin: string;
  description: string;
  obtainedAtLevel: number;
  uses: string;
  actionType: string;
  range: string;
  recharge: string;
  attackRoll?: string;
  saveEffect?: string;
  damage?: string;
}

export interface ResourceTracker {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  hitDice: string;
  hitDiceUsed: number;
  layOnHandsRemaining: number;
  breathWeaponUsed: boolean;
  spellSlots: Record<number, { max: number; used: number }>;
  channelDivinityUsed: number;
}

export interface Feat {
  id: string;
  name: string;
  description: string;
  isTaken: boolean;
  abilityBonus?: Ability;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  heritage?: string;
  alignment: string;
  age?: string;
  height?: string;
  weight?: string;
  languages: string[];
  background?: string;
  classes: ClassLevel[];
  level: number;
  proficiencyBonus: number;
  abilities: AbilityScores;
  abilityBonuses: AbilityBonuses;
  savingThrowProficiencies: Ability[];
  skillProficiencies: string[];
  skillExpertise: string[];
  weapons: Weapon[];
  armors: Armor[];
  spells: Spell[];
  inventory: InventoryItem[];
  combatActions: CombatAction[];
  feats: Feat[];
  resources: ResourceTracker;
  fightingStyles: string[];
  traits: { name: string; description: string; source: string }[];
  notes?: string;
  /** false hasta completar el asistente de creación */
  setupComplete?: boolean;
}

export interface ComboSuggestion {
  id: string;
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
  tags: string[];
  requirements: string[];
  steps: string[];
  synergyScore: number;
}

export type CharacterTab =
  | "ficha"
  | "combate"
  | "armas"
  | "hechizos"
  | "inventario"
  | "combos"
  | "compendio";
