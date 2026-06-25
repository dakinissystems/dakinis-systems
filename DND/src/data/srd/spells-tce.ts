import type { SrdSpell } from "./types";
import { spell } from "./spell-utils";

/** Hechizos de Tasha's Cauldron of Everything */
export const TCE_SPELLS: SrdSpell[] = [
  // ——— Trucos marciales / blade cantrips ———
  spell({ id: "tce-booming-blade", name: "Booming Blade", level: 0, school: "Evocation", castingTime: "1 Action", range: "Self (5-foot radius)", components: "S, M", duration: "1 round", description: "Melee + thunder; si se mueve, 1d8 thunder extra (escala).", classes: ["sorcerer", "warlock", "wizard"], source: "tce" }),
  spell({ id: "tce-green-flame-blade", name: "Green-Flame Blade", level: 0, school: "Evocation", castingTime: "1 Action", range: "Self (5-foot radius)", components: "S, M", duration: "Instantaneous", description: "Melee + fuego; salta a segunda criatura cercana.", classes: ["sorcerer", "warlock", "wizard"], source: "tce" }),
  spell({ id: "tce-lightning-lure", name: "Lightning Lure", level: 0, school: "Evocation", castingTime: "1 Action", range: "Self (15-foot radius)", components: "V", duration: "Instantaneous", description: "STR ST o tirado 10 ft hacia ti + 1d8 rayo.", classes: ["sorcerer", "warlock", "wizard"], source: "tce" }),
  spell({ id: "tce-sword-burst", name: "Sword Burst", level: 0, school: "Conjuration", castingTime: "1 Action", range: "Self (5-foot radius)", components: "V", duration: "Instantaneous", description: "DEX ST o 1d6 fuerza a criaturas adyacentes.", classes: ["sorcerer", "warlock", "wizard"], source: "tce" }),

  // ——— Nivel 1 ———
  spell({ id: "tce-tashas-caustic-brew", name: "Tasha's Caustic Brew", level: 1, school: "Evocation", castingTime: "1 Action", range: "Self (30-foot line)", components: "V, S, M", duration: "Concentration, up to 1 minute", description: "Línea de ácido 2d4 inicial y al final de turno.", classes: ["sorcerer", "wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-intellect-fortress", name: "Intellect Fortress", level: 1, school: "Abjuration", castingTime: "1 Action", range: "30 feet", components: "V", duration: "Concentration, up to 1 hour", description: "Resistencia psíquico y ventaja INT/WIS/CHA saves.", classes: ["bard", "sorcerer", "warlock", "wizard"], source: "tce", concentration: true }),

  // ——— Nivel 2 ———
  spell({ id: "tce-tashas-mind-whip", name: "Tasha's Mind Whip", level: 2, school: "Enchantment", castingTime: "1 Action", range: "90 feet", components: "V", duration: "Instantaneous", description: "Hasta 3 criaturas: 3d6 psíquico e incapacitadas.", classes: ["sorcerer", "wizard"], source: "tce" }),
  spell({ id: "tce-wither-and-bloom", name: "Wither and Bloom", level: 2, school: "Necromancy", castingTime: "1 Action", range: "60 feet", components: "V, S, M", duration: "Instantaneous", description: "2d6 necrótico en área; aliado recupera 2d6.", classes: ["druid", "sorcerer", "wizard"], source: "tce" }),

  // ——— Nivel 3 ———
  spell({ id: "tce-ashardalons-stride", name: "Ashardalon's Stride", level: 3, school: "Transmutation", castingTime: "1 Bonus Action", range: "Self", components: "V, S", duration: "Concentration, up to 10 minutes", description: "+20 ft; daño de fuego al pasar por enemigos.", classes: ["ranger", "sorcerer", "wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-spirit-shroud", name: "Spirit Shroud", level: 3, school: "Necromancy", castingTime: "1 Bonus Action", range: "Self", components: "V, S", duration: "Concentration, up to 1 minute", description: "Aura 3d8 necrótico/frío/radiante; reduce velocidad.", classes: ["cleric", "paladin", "warlock", "wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-summon-fey", name: "Summon Fey", level: 3, school: "Conjuration", castingTime: "1 Action", range: "90 feet", components: "V, S, M", duration: "Concentration, up to 1 hour", description: "Espíritu feérico combatiente.", classes: ["druid", "ranger", "warlock", "wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-summon-undead", name: "Summon Undead", level: 3, school: "Necromancy", castingTime: "1 Action", range: "90 feet", components: "V, S, M", duration: "Concentration, up to 1 hour", description: "Espíritu no-muerto combatiente.", classes: ["warlock", "wizard"], source: "tce", concentration: true }),

  // ——— Nivel 4 ———
  spell({ id: "tce-summon-aberration", name: "Summon Aberration", level: 4, school: "Conjuration", castingTime: "1 Action", range: "90 feet", components: "V, S, M", duration: "Concentration, up to 1 hour", description: "Aberración psíquica bajo tu control.", classes: ["warlock", "wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-summon-construct", name: "Summon Construct", level: 4, school: "Conjuration", castingTime: "1 Action", range: "90 feet", components: "V, S, M", duration: "Concentration, up to 1 hour", description: "Constructo animado.", classes: ["wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-summon-elemental", name: "Summon Elemental", level: 4, school: "Conjuration", castingTime: "1 Action", range: "90 feet", components: "V, S, M", duration: "Concentration, up to 1 hour", description: "Elemental de aire/tierra/fuego/agua.", classes: ["druid", "ranger", "wizard"], source: "tce", concentration: true }),

  // ——— Nivel 5 ———
  spell({ id: "tce-summon-celestial", name: "Summon Celestial", level: 5, school: "Conjuration", castingTime: "1 Action", range: "90 feet", components: "V, S, M", duration: "Concentration, up to 1 hour", description: "Celestial aliado.", classes: ["cleric", "paladin"], source: "tce", concentration: true }),
  spell({ id: "tce-summon-dragon", name: "Summon Dragon", level: 5, school: "Conjuration", castingTime: "1 Action", range: "60 feet", components: "V, S, M", duration: "Concentration, up to 1 hour", description: "Espíritu dracónico (versión TCE).", classes: ["wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-steel-wind-strike", name: "Steel Wind Strike", level: 5, school: "Conjuration", castingTime: "1 Action", range: "30 feet", components: "S, M", duration: "Instantaneous", description: "Hasta 5 ataques de conjuro melee 6d10 fuerza; teletransporte.", classes: ["ranger", "wizard"], source: "tce" }),
  spell({ id: "tce-tashas-otherworldly-guise", name: "Tasha's Otherworldly Guise", level: 6, school: "Transmutation", castingTime: "1 Bonus Action", range: "Self", components: "V, S, M", duration: "Concentration, up to 1 minute", description: "Inmunidad fuego/poison/radiante; vuelo; ataques mágicos.", classes: ["sorcerer", "warlock", "wizard"], source: "tce", concentration: true }),
  spell({ id: "tce-dream-of-the-blue-veil", name: "Dream of the Blue Veil", level: 7, school: "Conjuration", castingTime: "10 Minutes", range: "20 feet", components: "V, S, M", duration: "6 hours", description: "Viaje a otro mundo del multiverso D&D.", classes: ["bard", "sorcerer", "warlock", "wizard"], source: "tce" }),
  spell({ id: "tce-blade-of-disaster", name: "Blade of Disaster", level: 9, school: "Conjuration", castingTime: "1 Bonus Action", range: "60 feet", components: "V, S", duration: "Concentration, up to 1 minute", description: "Espada 4d12 fuerza; crítico en 18-20.", classes: ["sorcerer", "warlock", "wizard"], source: "tce", concentration: true }),
];
