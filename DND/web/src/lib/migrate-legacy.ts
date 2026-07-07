import type { Character, InventoryItem, Weapon, Armor, Spell } from "../types/character";
import { createBlankCharacter } from "../data/character-factory";
import {
  applyRaceToCharacter,
  applyClassToCharacter,
  applyBackgroundToCharacter,
} from "../data/srd";
import { findBackground } from "../data/srd/backgrounds";
import { estimateMaxHP } from "../engine/formulas";
import { proficiencyBonus } from "../data/srd/classes";

interface LegacyClassLevel {
  name: string;
  level: number;
  subclass?: string;
}

interface LegacyEquipment {
  weapons?: LegacyWeapon[];
  armor?: LegacyArmor[];
  items?: LegacyItem[];
}

interface LegacyWeapon {
  name: string;
  damage?: string;
  damageType?: string;
  properties?: string[];
}

interface LegacyArmor {
  name: string;
  armorClass?: number;
  category?: string;
}

interface LegacyItem {
  name: string;
  description?: string;
  category?: string;
}

export interface LegacyCharacter {
  id?: string;
  name?: string;
  playerName?: string;
  background?: string;
  alignment?: string;
  race?: string;
  subrace?: string;
  classes?: LegacyClassLevel[];
  attributes?: Record<string, number>;
  abilities?: Record<string, number>;
  equipment?: LegacyEquipment;
  homebrewEquipment?: LegacyItem[];
  spells?: LegacySpell[];
  notes?: string;
}

interface LegacySpell {
  name: string;
  level?: number;
  school?: string;
  description?: string;
}

const LEGACY_RACE_MAP: Record<string, string> = {
  humano: "human",
  elfo: "elf",
  enano: "dwarf",
  mediano: "halfling",
  draconido: "dragonborn",
  gnome: "gnome",
  semielfo: "half-elf",
  semiorco: "half-orc",
  tiefling: "tiefling",
};

const LEGACY_SUBRACE_MAP: Record<string, string> = {
  "alto-elfo": "high",
  "elfo-del-bosque": "wood",
  "elfo-oscuro": "drow",
  "enano-de-colinas": "hill",
  "enano-de-montaña": "mountain",
  "mediano-pies-ligeros": "lightfoot",
  "mediano-robusto": "stout",
  "gnomo-de-los-bosques": "forest",
  "gnomo-de-las-rocas": "rock",
};

const LEGACY_CLASS_MAP: Record<string, string> = {
  bárbaro: "barbarian",
  barbaro: "barbarian",
  bardo: "bard",
  clérigo: "cleric",
  clerigo: "cleric",
  druida: "druid",
  guerrero: "fighter",
  monje: "monk",
  paladín: "paladin",
  paladin: "paladin",
  pícaro: "rogue",
  picaro: "rogue",
  hechicero: "sorcerer",
  brujo: "warlock",
  mago: "wizard",
  explorador: "ranger",
};

const LEGACY_BACKGROUND_MAP: Record<string, string> = {
  acolito: "acolyte",
  artesano: "artisan",
  artista: "entertainer",
  charlatán: "charlatan",
  charlatan: "charlatan",
  criminal: "criminal",
  erudito: "sage",
  forastero: "outlander",
  héroe: "folk-hero",
  heroe: "folk-hero",
  marinero: "sailor",
  noble: "noble",
  sabio: "hermit",
  soldado: "soldier",
};

const LEGACY_ALIGNMENT_MAP: Record<string, string> = {
  neutral: "Neutral",
  "legal-bueno": "Legal Bueno",
  "neutral-bueno": "Neutral Bueno",
  "caótico-bueno": "Caótico Bueno",
  "caotico-bueno": "Caótico Bueno",
  "legal-neutral": "Legal Neutral",
  "caótico-neutral": "Caótico Neutral",
  "caotico-neutral": "Caótico Neutral",
  "legal-maligno": "Legal Malo",
  "legal-malo": "Legal Malo",
  "neutral-maligno": "Neutral Malo",
  "neutral-malo": "Neutral Malo",
  "caótico-maligno": "Caótico Malo",
  "caotico-maligno": "Caótico Malo",
};

export function isLegacyCharacter(value: unknown): value is LegacyCharacter {
  if (!value || typeof value !== "object") return false;
  const c = value as LegacyCharacter;
  return (
    ("attributes" in c ||
      (Array.isArray(c.classes) && !!c.classes[0]?.name && !("abilities" in c))) &&
    !("abilityBonuses" in c)
  );
}

export function migrateLegacyExport(data: Record<string, unknown>): Character[] {
  const chars: Character[] = [];
  for (const value of Object.values(data)) {
    if (isLegacyCharacter(value)) {
      chars.push(migrateLegacyCharacter(value));
    }
  }
  return chars;
}

export function migrateLegacyCharacter(legacy: LegacyCharacter): Character {
  let char = createBlankCharacter();
  char.id = legacy.id ?? crypto.randomUUID();
  char.name = legacy.name ?? "Sin nombre";
  char.alignment = mapAlignment(legacy.alignment);
  char.setupComplete = true;

  const attrs = legacy.attributes ?? legacy.abilities ?? {};
  char.abilities = {
    str: attrs.str ?? 10,
    dex: attrs.dex ?? 10,
    con: attrs.con ?? 10,
    int: attrs.int ?? 10,
    wis: attrs.wis ?? 10,
    cha: attrs.cha ?? 10,
  };

  const raceId = legacy.race ? LEGACY_RACE_MAP[legacy.race.toLowerCase()] : undefined;
  const subraceId = legacy.subrace ? LEGACY_SUBRACE_MAP[legacy.subrace.toLowerCase()] : undefined;
  if (raceId) {
    char = applyRaceToCharacter(char, raceId, subraceId);
  } else if (legacy.race) {
    char.race = legacy.race;
  }

  const legacyClass = legacy.classes?.[0];
  if (legacyClass) {
    const classId = LEGACY_CLASS_MAP[legacyClass.name.toLowerCase()] ?? legacyClass.name.toLowerCase();
    const level = legacyClass.level ?? 1;
    char.level = level;
    char = applyClassToCharacter(char, classId, legacyClass.subclass);
    char.classes = char.classes.map((c) => ({ ...c, level }));
    char.proficiencyBonus = proficiencyBonus(level);
  }

  if (legacy.background) {
    const bgId = LEGACY_BACKGROUND_MAP[legacy.background.toLowerCase()] ?? legacy.background.toLowerCase();
    if (findBackground(bgId)) {
      char = applyBackgroundToCharacter(char, bgId);
    } else {
      char.background = legacy.background;
    }
  }

  char.weapons = convertWeapons(legacy.equipment?.weapons ?? []);
  char.armors = convertArmors(legacy.equipment?.armor ?? []);
  char.inventory = convertItems(legacy.equipment?.items ?? [], legacy.homebrewEquipment ?? []);
  char.spells = convertSpells(legacy.spells ?? []);

  const maxHP = estimateMaxHP(char);
  char.resources = {
    ...char.resources,
    maxHP,
    currentHP: maxHP,
    hitDice: char.resources.hitDice,
  };

  if (legacy.notes) char.notes = legacy.notes;
  if (legacy.playerName) {
    char.notes = [char.notes, `Jugador: ${legacy.playerName}`].filter(Boolean).join("\n");
  }

  return char;
}

function mapAlignment(raw?: string): string {
  if (!raw) return "Neutral";
  const key = raw.toLowerCase().replace(/\s+/g, "-");
  return LEGACY_ALIGNMENT_MAP[key] ?? raw;
}

function convertWeapons(list: LegacyWeapon[]): Weapon[] {
  return list.map((w) => ({
    id: crypto.randomUUID(),
    name: w.name,
    isCustom: true,
    isActive: false,
    attackBonus: 0,
    damageDice: w.damage ?? "1d6",
    damageBonus: 0,
    damageType: w.damageType ?? "—",
    range: "Melee",
    properties: w.properties ?? [],
  }));
}

function convertArmors(list: LegacyArmor[]): Armor[] {
  return list.map((a) => ({
    id: crypto.randomUUID(),
    name: a.name,
    isCustom: true,
    isEquipped: false,
    baseAC: a.armorClass ?? 10,
    acBonus: 0,
    type: mapArmorType(a.category),
  }));
}

function mapArmorType(category?: string): Armor["type"] {
  const c = (category ?? "").toLowerCase();
  if (c.includes("escudo")) return "escudo";
  if (c.includes("pesad") || c.includes("placa")) return "pesada";
  if (c.includes("medi")) return "media";
  if (c.includes("ligera") || c.includes("cuero")) return "ligera";
  return "otro";
}

function convertItems(items: LegacyItem[], homebrew: LegacyItem[]): InventoryItem[] {
  return [...items, ...homebrew].map((item) => ({
    id: crypto.randomUUID(),
    name: item.name,
    category: "otro",
    quantity: 1,
    description: item.description,
    isCustom: true,
    tags: item.category ? [item.category] : undefined,
  }));
}

function convertSpells(spells: LegacySpell[]): Spell[] {
  return spells.map((s) => ({
    id: crypto.randomUUID(),
    name: s.name,
    level: s.level ?? 0,
    school: s.school ?? "—",
    castingTime: "—",
    range: "—",
    components: "—",
    duration: "—",
    description: s.description ?? "",
    isPrepared: false,
    source: "custom" as const,
  }));
}
