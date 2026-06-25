import type { SrdRace } from "./types";

export const SRD_RACES: SrdRace[] = [
  {
    id: "dragonborn",
    name: "Dracónido",
    nameEn: "Dragonborn",
    abilityBonuses: { str: 2, cha: 1 },
    speed: 30,
    size: "Mediano",
    languages: ["Común", "Dracónico"],
    traits: [
      {
        name: "Ancestro dracónico",
        description: "Elegir un tipo de dragón. Resistencia al daño asociado y aliento según ancestro.",
      },
      {
        name: "Aliento de dragón",
        description: "Acción: exhalas energía en un cono de 15 ft (CON ST mitad). Daño escala: 2d6 (6), 3d6 (11), 4d6 (16).",
      },
      {
        name: "Resistencia al daño",
        description: "Resistencia al tipo de daño de tu ancestro dracónico.",
      },
    ],
    subraces: [
      { id: "black", name: "Negro (Ácido)", abilityBonuses: {}, traits: [{ name: "Ácido", description: "Daño de ácido. CON ST 8 + CON + PB." }] },
      { id: "blue", name: "Azul (Rayo)", abilityBonuses: {}, traits: [{ name: "Rayo", description: "Daño de rayo. Línea de 30×5 ft." }] },
      { id: "brass", name: "Latón (Fuego)", abilityBonuses: {}, traits: [{ name: "Fuego", description: "Daño de fuego. Cono 15 ft." }] },
      { id: "bronze", name: "Bronce (Rayo)", abilityBonuses: {}, traits: [{ name: "Rayo", description: "Daño de rayo." }] },
      { id: "copper", name: "Cobre (Ácido)", abilityBonuses: {}, traits: [{ name: "Ácido", description: "Daño de ácido." }] },
      { id: "gold", name: "Oro (Fuego)", abilityBonuses: {}, traits: [{ name: "Fuego", description: "Daño de fuego." }] },
      { id: "green", name: "Verde (Veneno)", abilityBonuses: {}, traits: [{ name: "Veneno", description: "Daño de veneno. Cono 15 ft." }] },
      { id: "red", name: "Rojo (Fuego)", abilityBonuses: {}, traits: [{ name: "Fuego", description: "Daño de fuego." }] },
      { id: "silver", name: "Plata (Frío)", abilityBonuses: {}, traits: [{ name: "Frío", description: "Daño de frío. Cono 15 ft." }] },
      { id: "white", name: "Blanco (Frío)", abilityBonuses: {}, traits: [{ name: "Frío", description: "Daño de frío." }] },
    ],
  },
  {
    id: "dwarf",
    name: "Enano",
    nameEn: "Dwarf",
    abilityBonuses: { con: 2 },
    speed: 25,
    size: "Mediano",
    languages: ["Común", "Enano"],
    traits: [
      { name: "Visión en la oscuridad", description: "60 ft." },
      { name: "Resiliencia enana", description: "Ventaja en salvaciones contra veneno; resistencia a daño de veneno." },
      { name: "Entrenamiento con armas enanas", description: "Proficiencia con hacha de batalla, hacha de mano, martillo ligero y martillo de guerra." },
      { name: "Conocimiento de la piedra", description: "Historial sobre piedra y trabajo en ella." },
    ],
    subraces: [
      {
        id: "hill",
        name: "Enano de colina",
        abilityBonuses: { wis: 1 },
        traits: [{ name: "Temple enano", description: "+1 PV máximo por nivel." }],
      },
      {
        id: "mountain",
        name: "Enano de montaña",
        abilityBonuses: { str: 2 },
        traits: [{ name: "Armadura enana", description: "Proficiencia con armadura ligera y media." }],
      },
    ],
  },
  {
    id: "elf",
    name: "Elfo",
    nameEn: "Elf",
    abilityBonuses: { dex: 2 },
    speed: 30,
    size: "Mediano",
    languages: ["Común", "Élfico"],
    traits: [
      { name: "Visión en la oscuridad", description: "60 ft." },
      { name: "Sentidos feéricos", description: "Proficiencia en Percepción." },
      { name: "Ascendencia feérica", description: "Ventaja contra ser hechizado; inmune a dormir mágicamente." },
      { name: "Trance", description: "4 horas de meditación en lugar de dormir 8 horas." },
    ],
    subraces: [
      {
        id: "high",
        name: "Alto elfo",
        abilityBonuses: { int: 1 },
        traits: [
          { name: "Truco de mago", description: "Un truco de la lista de mago." },
          { name: "Idioma extra", description: "Un idioma adicional." },
        ],
      },
      {
        id: "wood",
        name: "Elfo del bosque",
        abilityBonuses: { wis: 1 },
        traits: [
          { name: "Velocidad", description: "35 ft." },
          { name: "Enmascaramiento natural", description: "Puedes ocultarte en vegetación ligera." },
        ],
      },
      {
        id: "drow",
        name: "Drow",
        abilityBonuses: { cha: 1 },
        traits: [
          { name: "Visión en la oscuridad superior", description: "120 ft." },
          { name: "Sensibilidad solar", description: "Desventaja en ataques y Percepción bajo luz solar directa." },
          { name: "Magia drow", description: "Dancing Lights, Faerie Fire (3), Darkness (5)." },
        ],
      },
    ],
  },
  {
    id: "gnome",
    name: "Gnomo",
    nameEn: "Gnome",
    abilityBonuses: { int: 2 },
    speed: 25,
    size: "Pequeño",
    languages: ["Común", "Gnómico"],
    traits: [
      { name: "Visión en la oscuridad", description: "60 ft." },
      { name: "Astucia gnómica", description: "Ventaja en INT/CHA/WIS contra magia." },
    ],
    subraces: [
      {
        id: "forest",
        name: "Gnomo del bosque",
        abilityBonuses: { dex: 1 },
        traits: [
          { name: "Ilusionista natural", description: "Truco de ilusión." },
          { name: "Hablar con bestias", description: "Comunicación limitada con bestias pequeñas." },
        ],
      },
      {
        id: "rock",
        name: "Gnomo de roca",
        abilityBonuses: { con: 1 },
        traits: [
          { name: "Conocimiento de artífice", description: "Proficiencia con herramientas de artífice." },
          { name: "Trucos", description: "Prestidigitación y un truco de lista de mago." },
        ],
      },
    ],
  },
  {
    id: "half-elf",
    name: "Semielfo",
    nameEn: "Half-Elf",
    abilityBonuses: { cha: 2 },
    speed: 30,
    size: "Mediano",
    languages: ["Común", "Élfico", "Uno extra"],
    traits: [
      { name: "Aumento flexible", description: "+1 a dos atributos distintos (además de CAR +2)." },
      { name: "Visión en la oscuridad", description: "60 ft." },
      { name: "Ascendencia feérica", description: "Ventaja contra encantamiento; no puedes dormir mágicamente." },
      { name: "Versatilidad", description: "Proficiencia en dos habilidades." },
    ],
  },
  {
    id: "half-orc",
    name: "Semiorco",
    nameEn: "Half-Orc",
    abilityBonuses: { str: 2, con: 1 },
    speed: 30,
    size: "Mediano",
    languages: ["Común", "Orco"],
    traits: [
      { name: "Visión en la oscuridad", description: "60 ft." },
      { name: "Resistencia implacable", description: "1/descanso largo: quedas a 1 PV en lugar de 0." },
      { name: "Ataques salvajes", description: "Crítico melee: un dado de daño extra del arma." },
    ],
  },
  {
    id: "halfling",
    name: "Mediano",
    nameEn: "Halfling",
    abilityBonuses: { dex: 2 },
    speed: 25,
    size: "Pequeño",
    languages: ["Común", "Mediano"],
    traits: [
      { name: "Suerte", description: "Reroll natural 1 en ataque, habilidad o salvación." },
      { name: "Valiente", description: "Ventaja contra asustado." },
      { name: "Agilidad mediana", description: "Puedes moverte por espacio de criaturas más grandes." },
    ],
    subraces: [
      {
        id: "lightfoot",
        name: "Pies ligeros",
        abilityBonuses: { cha: 1 },
        traits: [{ name: "Sigiloso", description: "Puedes ocultarte detrás de criaturas medianas o mayores." }],
      },
      {
        id: "stout",
        name: "Fuerte",
        abilityBonuses: { con: 1 },
        traits: [{ name: "Resiliencia", description: "Ventaja contra veneno; resistencia a daño de veneno." }],
      },
    ],
  },
  {
    id: "human",
    name: "Humano",
    nameEn: "Human",
    abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    speed: 30,
    size: "Mediano",
    languages: ["Común", "Uno extra"],
    traits: [{ name: "Versatilidad humana", description: "+1 a todos los atributos." }],
  },
  {
    id: "tiefling",
    name: "Tiefling",
    nameEn: "Tiefling",
    abilityBonuses: { cha: 2, int: 1 },
    speed: 30,
    size: "Mediano",
    languages: ["Común", "Infernal"],
    traits: [
      { name: "Visión en la oscuridad", description: "60 ft." },
      { name: "Legado infernal", description: "Resistencia a daño de fuego." },
      { name: "Magia tiefling", description: "Thaumaturgy; Hellish Rebuke (3); Darkness (5)." },
    ],
  },
];

export function findRace(id: string): SrdRace | undefined {
  return SRD_RACES.find((r) => r.id === id);
}

export function findSubrace(raceId: string, subraceId: string) {
  return findRace(raceId)?.subraces?.find((s) => s.id === subraceId);
}

export function raceByName(name: string): SrdRace | undefined {
  const n = name.toLowerCase();
  return SRD_RACES.find(
    (r) => r.name.toLowerCase() === n || r.nameEn.toLowerCase() === n || n.includes(r.nameEn.toLowerCase()),
  );
}
