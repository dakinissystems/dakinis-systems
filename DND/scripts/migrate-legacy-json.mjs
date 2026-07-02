#!/usr/bin/env node
/**
 * Migra characters.json del Flask legacy a formato PWA moderno.
 * Uso: node scripts/migrate-legacy-json.mjs [entrada.json] [salida.json]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const input = resolve(process.argv[2] ?? "D:/DND/characters.json");
const output = resolve(process.argv[3] ?? "dnd-personajes-migrados.json");

const LEGACY_RACE_MAP = {
  humano: "human", elfo: "elf", enano: "dwarf", mediano: "halfling",
  draconido: "dragonborn", gnome: "gnome", semielfo: "half-elf", semiorco: "half-orc", tiefling: "tiefling",
};

const LEGACY_CLASS_MAP = {
  bárbaro: "barbarian", barbaro: "barbarian", bardo: "bard", clérigo: "cleric", clerigo: "cleric",
  druida: "druid", guerrero: "fighter", monje: "monk", paladín: "paladin", paladin: "paladin",
  pícaro: "rogue", picaro: "rogue", hechicero: "sorcerer", brujo: "warlock", mago: "wizard", explorador: "ranger",
};

const CLASS_NAMES = {
  barbarian: "Bárbaro", bard: "Bardo", cleric: "Clérigo", druid: "Druida", fighter: "Guerrero",
  monk: "Monje", paladin: "Paladín", rogue: "Pícaro", sorcerer: "Hechicero", warlock: "Brujo", wizard: "Mago", ranger: "Explorador",
};

const RACE_NAMES = {
  human: "Humano", elf: "Elfo", dwarf: "Enano", halfling: "Mediano", dragonborn: "Dracónido",
  gnome: "Gnomo", "half-elf": "Semielfo", "half-orc": "Semiorco", tiefling: "Tiefling",
};

function migrate(legacy) {
  const attrs = legacy.attributes ?? legacy.abilities ?? {};
  const raceId = legacy.race ? LEGACY_RACE_MAP[legacy.race.toLowerCase()] : null;
  const cls = legacy.classes?.[0];
  const classId = cls ? (LEGACY_CLASS_MAP[cls.name?.toLowerCase()] ?? cls.name) : null;
  const level = cls?.level ?? 1;

  return {
    id: legacy.id ?? `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: legacy.name ?? "Sin nombre",
    race: raceId ? RACE_NAMES[raceId] ?? legacy.race : (legacy.race ?? ""),
    alignment: legacy.alignment ?? "Neutral",
    background: legacy.background ?? undefined,
    languages: ["Común"],
    classes: [{ className: classId ? CLASS_NAMES[classId] ?? cls.name : "", subclass: cls?.subclass, level }],
    level,
    proficiencyBonus: Math.floor((level - 1) / 4) + 2,
    abilities: {
      str: attrs.str ?? 10, dex: attrs.dex ?? 10, con: attrs.con ?? 10,
      int: attrs.int ?? 10, wis: attrs.wis ?? 10, cha: attrs.cha ?? 10,
    },
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
    resources: {
      currentHP: 10, maxHP: 10, tempHP: 0, hitDice: `1d8`, hitDiceUsed: 0,
      layOnHandsRemaining: 0, breathWeaponUsed: false, spellSlots: {}, channelDivinityUsed: 0,
    },
    notes: legacy.playerName ? `Jugador: ${legacy.playerName}` : undefined,
    setupComplete: true,
  };
}

const raw = JSON.parse(readFileSync(input, "utf8"));
const entries = Object.values(raw).filter((v) => v && typeof v === "object");
const characters = entries.map(migrate);

const bundle = {
  version: 1,
  exportedAt: new Date().toISOString(),
  app: "dnd-character-manager",
  characters,
};

writeFileSync(output, JSON.stringify(bundle, null, 2), "utf8");
console.log(`Migrados ${characters.length} personaje(s) → ${output}`);
