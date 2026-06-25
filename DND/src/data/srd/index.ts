import type { Ability, AbilityBonuses, Character, Spell } from "../../types/character";
import type { SrdSpell } from "./types";
import { classByName, findClass, proficiencyBonus } from "./classes";
import { findRace, findSubrace, raceByName } from "./races";
import { SRD_SPELLS } from "./spells";

export { SRD_RACES, findRace, findSubrace, raceByName } from "./races";
export { SRD_CLASSES, findClass, classByName, proficiencyBonus } from "./classes";
export { SRD_SPELLS, findSpell, spellsByClass, spellsByLevel, searchSpells } from "./spells";

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

export function applyClassToCharacter(char: Character, classId: string, subclassId?: string): Character {
  const cls = findClass(classId);
  if (!cls) return char;

  const subclass = subclassId ? cls.subclasses.find((s) => s.id === subclassId) : undefined;
  const level = char.level;

  const classTraits = cls.features
    .filter((f) => f.level <= level)
    .map((f) => ({ name: f.name, description: f.description, source: `${cls.name} ${f.level}` }));

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

export function resolveRaceId(char: Character): string | undefined {
  return raceByName(char.race)?.id;
}

export function getSpellCount(): number {
  return SRD_SPELLS.length;
}

// Spell slots half-caster (paladin, ranger) simplified from PHB
export const HALF_CASTER_SLOTS: Record<number, Record<number, number>> = {
  2: { 1: 2 },
  3: { 1: 3 },
  4: { 1: 3 },
  5: { 1: 4, 2: 2 },
  6: { 1: 4, 2: 2 },
  7: { 1: 4, 2: 3 },
  8: { 1: 4, 2: 3 },
  9: { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 },
  11: { 1: 4, 2: 3, 3: 3 },
  12: { 1: 4, 2: 3, 3: 3 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

export function spellSlotsForClass(classId: string, level: number): Record<number, { max: number; used: number }> {
  const table = classId === "paladin" || classId === "ranger" ? HALF_CASTER_SLOTS : {};
  const slots = table[level] ?? table[Math.min(level, 20)] ?? {};
  const result: Record<number, { max: number; used: number }> = {};
  for (const [lvl, max] of Object.entries(slots)) {
    result[+lvl] = { max, used: 0 };
  }
  return result;
}
