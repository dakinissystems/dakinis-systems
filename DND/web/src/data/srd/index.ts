import type { Ability, AbilityBonuses, Character, Spell } from "../../types/character";
import type { SrdSpell } from "./types";
import { classByName, findClass, proficiencyBonus } from "./classes";
import { findRace, findSubrace } from "./races";
import { findBackground } from "./backgrounds";
import { itemFromTemplate } from "./equipment";

export { SRD_RACES, findRace, findSubrace } from "./races";
export { SRD_CLASSES, findClass, classByName, proficiencyBonus } from "./classes";
export { SRD_SPELLS, spellsByClass } from "./spells";
export { SRD_BACKGROUNDS, findBackground } from "./backgrounds";
export {
  SRD_WEAPON_TEMPLATES,
  SRD_ARMOR_TEMPLATES,
  SRD_ITEM_TEMPLATES,
  armorFromTemplate,
  itemFromTemplate,
} from "./equipment";

const ZERO_BONUSES: AbilityBonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

function sumBonuses(...parts: Partial<Record<Ability, number>>[]): AbilityBonuses {
  const out = { ...ZERO_BONUSES };
  for (const p of parts) {
    for (const k of Object.keys(p) as Ability[]) {
      out[k] += p[k] ?? 0;
    }
  }
  return out;
}

export function applyRaceToCharacter(char: Character, raceId: string, subraceId?: string): Character {
  const race = findRace(raceId);
  if (!race) return char;

  const subrace = subraceId ? findSubrace(raceId, subraceId) : undefined;
  const abilityBonuses = sumBonuses(race.abilityBonuses, subrace?.abilityBonuses ?? {});

  const raceTraits = race.traits.map((t) => ({ ...t, source: race.name }));
  const subTraits = (subrace?.traits ?? []).map((t) => ({ ...t, source: subrace!.name }));

  return {
    ...char,
    race: race.name,
    heritage: subrace?.name,
    languages: [...new Set([...race.languages, ...char.languages])],
    abilityBonuses,
    traits: [
      ...char.traits.filter((t) => !t.source.startsWith("Raza") && !t.source.includes("Enano") && !t.source.includes("elfo")),
      ...raceTraits.map((t) => ({ name: t.name, description: t.description, source: "Raza" })),
      ...subTraits.map((t) => ({ name: t.name, description: t.description, source: subrace!.name })),
    ],
  };
}

export function applyBackgroundToCharacter(char: Character, backgroundId: string): Character {
  const bg = findBackground(backgroundId);
  if (!bg) return char;

  const inventoryItems = bg.equipment.map((name) =>
    itemFromTemplate({ name, category: "otro", description: "Equipo de trasfondo" }),
  );

  return {
    ...char,
    background: bg.name,
    skillProficiencies: [...new Set([...char.skillProficiencies, ...bg.skillProficiencies])],
    inventory: [...char.inventory, ...inventoryItems],
  };
}

export function applyClassToCharacter(char: Character, classId: string, subclassId?: string): Character {
  const cls = findClass(classId);
  if (!cls) return char;

  const subclass = subclassId ? cls.subclasses.find((s) => s.id === subclassId) : undefined;
  const level = char.level;

  const classTraits: { name: string; description: string; source: string }[] = [];
  for (const f of cls.features) {
    if (f.level <= level) {
      classTraits.push({ name: f.name, description: f.description, source: `${cls.name} ${f.level}` });
    }
  }

  const subclassTraits = (subclass?.features ?? []).map((f) => ({
    name: f.name,
    description: f.description,
    source: subclass!.name,
  }));

  return {
    ...char,
    classes: [{ className: cls.name, subclass: subclass?.name, level: char.level }],
    proficiencyBonus: proficiencyBonus(level),
    savingThrowProficiencies: cls.savingThrows,
    resources: {
      ...char.resources,
      hitDice: `${level}d${cls.hitDie}`,
      layOnHandsRemaining: classId === "paladin" ? level * 5 : char.resources.layOnHandsRemaining,
    },
    traits: [
      ...char.traits.filter((t) => !t.source.includes(cls.name) && !t.source.includes("Paladín")),
      ...classTraits,
      ...subclassTraits,
    ],
  };
}

export function srdSpellToCharacterSpell(spell: SrdSpell, prepared = false): Spell {
  return {
    id: crypto.randomUUID(),
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    isPrepared: prepared,
    source: spell.source,
  };
}

export function resolveClassId(char: Character): string | undefined {
  return classByName(char.classes[0]?.className ?? "")?.id;
}
