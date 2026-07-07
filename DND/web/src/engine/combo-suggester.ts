import type { Character, ComboSuggestion } from "../types/character";
import {
  activeWeapons,
  className,
  extraAttacks,
  getAbilityMod,
  hasFeat,
  hasSpell,
  hasWeapon,
  subclassName,
} from "./formulas";

type Rule = {
  id: string;
  title: string;
  description: string;
  priority: ComboSuggestion["priority"];
  tags: string[];
  requirements: string[];
  steps: string[];
  match: (c: Character) => boolean;
  score: (c: Character) => number;
};

const RULES: Rule[] = [
  {
    id: "vow-extra-attack",
    title: "Juramento de Enemistad + Ataques múltiples",
    description:
      "Canaliza Vow of Enmity como acción bonus y concentra todos tus ataques en un solo objetivo con ventaja.",
    priority: "alta",
    tags: ["paladín", "channel divinity", "daño"],
    requirements: ["Paladín nivel 3+", "Channel Divinity disponible", "2+ ataques por turno"],
    steps: [
      "Acción bonus: Vow of Enmity sobre enemigo a 10 ft.",
      "Acción: ataca con ventaja (Extra Attack = 2 golpes).",
      "Opcional: Divine Smite en el impacto más fuerte.",
    ],
    match: (c) =>
      className(c).toLowerCase().includes("palad") &&
      c.level >= 3 &&
      extraAttacks(c) >= 2 &&
      c.combatActions.some((a) => a.name.toLowerCase().includes("vow")),
    score: (c) => 90 + extraAttacks(c) * 5,
  },
  {
    id: "bless-multiattack",
    title: "Bless + Ataques múltiples",
    description:
      "Bless suma 1d4 a cada tirada de ataque; con 2 ataques el valor esperado supera muchos smites de bajo nivel.",
    priority: "alta",
    tags: ["buff", "concentración", "party"],
    requirements: ["Hechizo Bless preparado", "Slot de nivel 1", "Concentración libre"],
    steps: [
      "Turno 1: lanzar Bless (concentración) sobre aliados.",
      "Turnos siguientes: 2 ataques con +1d4 cada uno.",
      "Mantén concentración; combina con Vow of Enmity para ventaja + d4.",
    ],
    match: (c) => hasSpell(c, "bless") && extraAttacks(c) >= 2,
    score: () => 85,
  },
  {
    id: "thunderous-smite-prone",
    title: "Thunderous Smite → control de campo",
    description:
      "Tras impactar, el objetivo debe superar salvación de CON o queda derribado; ideal para cortar la movilidad enemiga.",
    priority: "media",
    tags: ["smite", "control", "thunder"],
    requirements: ["Thunderous Smite", "Slot nivel 1", "Arma cuerpo a cuerpo"],
    steps: [
      "Acción bonus: imbuir arma con Thunderous Smite.",
      "Ataque: si impactas, daño de trueno + salvación CON.",
      "Si falla: objetivo derribado; aliados tienen ventaja cuerpo a cuerpo.",
    ],
    match: (c) => hasSpell(c, "thunderous smite") && activeWeapons(c).some((w) => w.range.toLowerCase().includes("melee")),
    score: () => 75,
  },
  {
    id: "divine-smite-undead",
    title: "Divine Smite contra no-muertos",
    description: "Divine Smite añade +1d8 radiante extra contra undead y fiends — prioriza slots en esos objetivos.",
    priority: "alta",
    tags: ["smite", "radiante", "no-muertos"],
    requirements: ["Paladín", "Slot de hechizo disponible", "Enemigo undead/fiend"],
    steps: [
      "Ataque con arma cuerpo a cuerpo.",
      "Tras impactar: gasta slot (mín 2d8, +1d8 si undead).",
      "Combina con Vow of Enmity para mayor probabilidad de impacto.",
    ],
    match: (c) => className(c).toLowerCase().includes("palad") && c.level >= 2,
    score: () => 88,
  },
  {
    id: "compelled-duel-tank",
    title: "Compelled Duel + tanqueo",
    description: "Fijas a un enemigo en duelo mientras tu AC alta (armadura pesada + escudo) absorbe golpes.",
    priority: "media",
    tags: ["control", "tanque", "concentración"],
    requirements: ["Compelled Duel", "AC 18+", "Enemigo a 30 ft"],
    steps: [
      "Acción bonus: Compelled Duel al bruiser enemigo.",
      "Quédate a melee; el enemigo tiene desventaja contra otros.",
      "Usa Lay on Hands si recibes mucho daño.",
    ],
    match: (c) =>
      hasSpell(c, "compelled duel") &&
      c.armors.some((a) => a.isEquipped && a.type === "pesada"),
    score: (c) => 70 + (c.armors.filter((a) => a.isEquipped).length > 1 ? 10 : 0),
  },
  {
    id: "find-steed-flank",
    title: "Find Steed + carga coordinada",
    description: "Tu montura (ej. Corsel) permite movimiento extra y flanqueo táctico en combate montado.",
    priority: "media",
    tags: ["conjuración", "movilidad", "montura"],
    requirements: ["Find Steed lanzado", "Montura viva"],
    steps: [
      "Pre-combate: invocar montura con Find Steed.",
      "En combate: Dash de montura + ataque montado.",
      "Relentless Avenger tras ataque de oportunidad para reposicionar.",
    ],
    match: (c) => hasSpell(c, "find steed") || c.inventory.some((i) => i.name.toLowerCase().includes("corsel")),
    score: () => 65,
  },
  {
    id: "abjure-enemy-fear",
    title: "Abjure Enemy + control de élite",
    description: "Channel Divinity que asusta fiends/undead con desventaja — abre ventana para focus fire del grupo.",
    priority: "alta",
    tags: ["channel divinity", "miedo", "control"],
    requirements: ["Abjure Enemy", "Channel Divinity", "Enemigo visible 60 ft"],
    steps: [
      "Acción: Abjure Enemy sobre caster o elite.",
      "Si es fiend/undead: desventaja en ataques y salvaciones.",
      "Grupo concentra daño mientras el objetivo huye o se paraliza.",
    ],
    match: (c) => c.combatActions.some((a) => a.name.toLowerCase().includes("abjure")),
    score: () => 82,
  },
  {
    id: "ham-reduce",
    title: "Heavy Armor Master + armadura adamantina",
    description: "Reduce 3 de cada golpe físico; con armadura inmune a críticos maximizas supervivencia sostenida.",
    priority: "alta",
    tags: ["defensa", "dote", "tanque"],
    requirements: ["Dote Heavy Armor Master", "Armadura pesada equipada"],
    steps: [
      "Mantén posición en línea frontal.",
      "Cada ataque físico pierde 3 de daño (stacks con resistencia dragón).",
      "Adamantina ignora críticos — ideal contra rogues y brutos.",
    ],
    match: (c) =>
      hasFeat(c, "heavy armor master") &&
      c.armors.some((a) => a.isEquipped && a.type === "pesada"),
    score: (c) =>
      80 +
      (c.armors.some((a) => a.notes?.toLowerCase().includes("adamant") ?? false) ? 15 : 0),
  },
  {
    id: "slasher-slow",
    title: "Slasher + arma cortante",
    description: "Cada impacto con slashing reduce 10 ft de velocidad; en crítico el enemigo ataca con desventaja.",
    priority: "media",
    tags: ["dote", "control", "slashing"],
    requirements: ["Dote Slasher", "Arma slashing activa"],
    steps: [
      "Ataca con longsword/greataxe/greatsword.",
      "Al impactar: -10 ft velocidad (kitea enemigos melee).",
      "Crítico: desventaja en ataques del objetivo hasta tu siguiente turno.",
    ],
    match: (c) =>
      hasFeat(c, "slasher") &&
      activeWeapons(c).some((w) => w.damageType.toLowerCase().includes("slashing")),
    score: () => 72,
  },
  {
    id: "savage-attacker-gwm",
    title: "Savage Attacker + arma 2 manos",
    description: "Una vez por turno rerrolleas daño del arma — excelente con dados grandes (2d6, 1d12).",
    priority: "media",
    tags: ["dote", "daño", "reroll"],
    requirements: ["Savage Attacker", "Arma melee 2 manos"],
    steps: [
      "Ataque con maul/greataxe/greatsword.",
      "Si el daño sale bajo, usa Savage Attacker para reroll.",
      "Prioriza armas con dados grandes para mayor varianza.",
    ],
    match: (c) =>
      hasFeat(c, "savage attacker") &&
      activeWeapons(c).some((w) =>
        ["maul", "greataxe", "greatsword", "martillo"].some((k) =>
          w.name.toLowerCase().includes(k),
        ),
      ),
    score: () => 68,
  },
  {
    id: "rencorosa-miss",
    title: "Rencorosa — extensión tras fallo",
    description:
      "Arma personalizada: acumula fallos como d4 extra y se extiende 10 ft tras un fallo — castiga la esquiva enemiga.",
    priority: "alta",
    tags: ["arma custom", "longsword", "personalizado"],
    requirements: ["Rencorosa equipada", "Contador de fallos activo"],
    steps: [
      "Ataca con Rencorosa (+2 mágico).",
      "Cada fallo acumula 1d4 de daño extra en el próximo impacto.",
      "Tras fallar: extensión 10 ft en el siguiente ataque del turno.",
    ],
    match: (c) => hasWeapon(c, "rencorosa"),
    score: () => 92,
  },
  {
    id: "jabalina-atlatl",
    title: "Atlatl + Jabalina Relámpago",
    description: "Atlatl duplica el lanzamiento de jabalina; la Jabalina Relámpago añade daño eléctrico y efecto de trueno.",
    priority: "alta",
    tags: ["arma custom", "ranged", "lightning"],
    requirements: ["Atlatl en inventario", "Jabalina Relámpago activa"],
    steps: [
      "Acción: lanzar jabalina con Atlatl (2 proyectiles si la regla de mesa lo permite).",
      "Daño perforante + lightning en impacto.",
      "Trueno al lanzar puede atraer atención — posiciónate tras cobertura.",
    ],
    match: (c) =>
      c.inventory.some((i) => i.name.toLowerCase().includes("atlatl")) &&
      hasWeapon(c, "relámpago"),
    score: () => 78,
  },
  {
    id: "cegadora-execute",
    title: "Cegadora — ejecución sin revivir",
    description:
      "Greataxe personalizada con daño brutal; segundo ataque con desventaja pero ideal para finishers en objetivos bajos.",
    priority: "media",
    tags: ["arma custom", "greataxe", "ejecución"],
    requirements: ["Cegadora activa", "Objetivo con pocos PV"],
    steps: [
      "Primer ataque: 1d12+3+3 slashing.",
      "Si el objetivo sobrevive: segundo ataque con desventaja.",
      "Daño letal impide revivir — úsala en brujos o clerics enemigos.",
    ],
    match: (c) => hasWeapon(c, "cegadora"),
    score: () => 70,
  },
  {
    id: "aura-protection-party",
    title: "Aura of Protection — salvaciones de grupo",
    description: "Aliados a 10 ft suman tu modificador de CAR a salvaciones — posiciónate en el centro del grupo.",
    priority: "alta",
    tags: ["aura", "defensa", "party"],
    requirements: ["Paladín nivel 6+", "Aliados cercanos"],
    steps: [
      "Mantén formación compacta (10 ft).",
      "Aliados ganan +CHA mod en todas las salvaciones.",
      "Combina con Bless para ataques y salvaciones reforzadas.",
    ],
    match: (c) => className(c).toLowerCase().includes("palad") && c.level >= 6,
    score: (c) => 86 + getAbilityMod(c, "cha") * 3,
  },
  {
    id: "relentless-avenger-kite",
    title: "Relentless Avenger — kiteo de melee",
    description: "Tras un ataque de oportunidad exitoso, te mueves 15 ft sin provocar más OA — reposiciona al tanque.",
    priority: "media",
    tags: ["subclase", "movilidad", "vengeance"],
    requirements: ["Oath of Vengeance nivel 7+", "Ataque de oportunidad"],
    steps: [
      "Provoca OA cuando un enemigo intenta pasar.",
      "Si impactas: muévete 15 ft como parte de la reacción.",
      "Reubícate entre el caster y la línea frontal.",
    ],
    match: (c) => {
      const sub = subclassName(c)?.toLowerCase() ?? "";
      return (sub.includes("vengeance") || sub.includes("venga")) && c.level >= 7;
    },
    score: () => 74,
  },
  {
    id: "divine-favor-radiant",
    title: "Divine Favor + smite stack",
    description: "Divine Favor añade 1d4 radiante por golpe — multiplica valor con Extra Attack.",
    priority: "alta",
    tags: ["buff", "radiante", "bonus action"],
    requirements: ["Divine Favor preparado", "Slot nivel 1", "2 ataques"],
    steps: [
      "Acción bonus: Divine Favor en ti mismo.",
      "Acción: 2 ataques, cada uno +1d4 radiante.",
      "Opcional: añade Divine Smite en un impacto.",
    ],
    match: (c) => hasSpell(c, "divine favor") && extraAttacks(c) >= 2,
    score: () => 83,
  },
  {
    id: "breath-cold-aoe",
    title: "Aliento de dragón (frío) + melee follow-up",
    description: "Breath Weapon en cono 15 ft y luego entra a melee aprovechando resistencia al frío propia.",
    priority: "media",
    tags: ["raza", "dragonborn", "aoe"],
    requirements: ["Dragonborn", "Breath Weapon disponible", "Enemigos agrupados"],
    steps: [
      "Acción: Breath Weapon (CON ST, 3d6 frío en cono).",
      "Acción restante o siguiente turno: entrar a melee.",
      "Tu resistencia al frío te protege de reflejos aliados si aplica.",
    ],
    match: (c) =>
      c.race.toLowerCase().includes("dragon") &&
      c.combatActions.some((a) => a.name.toLowerCase().includes("breath")),
    score: () => 66,
  },
  {
    id: "lay-on-hands-cleanse",
    title: "Lay on Hands — curación táctica",
    description: "40 puntos de pool curan o eliminan veneno/enfermedad (5 PV por condición) — reserva para emergencias.",
    priority: "media",
    tags: ["curación", "utilidad", "paladín"],
    requirements: ["Lay on Hands con PV restantes"],
    steps: [
      "Aliado caído: gasta PV del pool para estabilizar/curar.",
      "Veneno/enfermedad: 5 PV del pool para curar.",
      "En boss fight: guarda ~15 PV para ti mismo.",
    ],
    match: (c) =>
      className(c).toLowerCase().includes("palad") && c.resources.layOnHandsRemaining > 0,
    score: (c) => 60 + Math.min(c.resources.layOnHandsRemaining / 4, 20),
  },
];

export function suggestCombos(char: Character): ComboSuggestion[] {
  const results: ComboSuggestion[] = [];
  for (const r of RULES) {
    if (!r.match(char)) continue;
    results.push({
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      tags: r.tags,
      requirements: r.requirements,
      steps: r.steps,
      synergyScore: r.score(char),
    });
  }
  return results.sort((a, b) => b.synergyScore - a.synergyScore);
}

export function suggestFeats(char: Character): { name: string; reason: string }[] {
  const suggestions: { name: string; reason: string }[] = [];
  const taken = new Set<string>();
  for (const feat of char.feats) {
    if (feat.isTaken) taken.add(feat.name);
  }

  const candidates = [
    {
      name: "Heavy Armor Master",
      reason: "Ya usas armadura pesada; reduce 3 de cada golpe físico.",
      match: () =>
        !taken.has("Heavy Armor Master") &&
        char.armors.some((a) => a.isEquipped && a.type === "pesada"),
    },
    {
      name: "Slasher",
      reason: "Tienes armas cortantes activas; control de velocidad en cada impacto.",
      match: () =>
        !taken.has("Slasher") &&
        activeWeapons(char).some((w) => w.damageType.toLowerCase().includes("slashing")),
    },
    {
      name: "Savage Attacker",
      reason: "Armas de dos manos con dados grandes se benefician del reroll de daño.",
      match: () =>
        !taken.has("Savage Attacker") &&
        activeWeapons(char).some((w) =>
          ["greatsword", "maul", "greataxe"].some((k) => w.name.toLowerCase().includes(k)),
        ),
    },
    {
      name: "Gift of the Metallic Dragon",
      reason: "Paladín defensivo: cure wounds 1/día y alas reactivas (+PB AC).",
      match: () =>
        !taken.has("Gift of the Metallic Dragon") &&
        className(char).toLowerCase().includes("palad"),
    },
    {
      name: "Skill Expert",
      reason: "Mejora habilidades fuera de combate (Historia, Atletismo) con expertise.",
      match: () => !taken.has("Skill Expert") && char.skillProficiencies.length >= 2,
    },
    {
      name: "Tough",
      reason: `+${char.level * 2} PV máximos — excelente para tanque de línea frontal.`,
      match: () => !taken.has("Tough") && char.level >= 4,
    },
  ];

  for (const c of candidates) {
    if (c.match()) suggestions.push({ name: c.name, reason: c.reason });
  }
  return suggestions;
}
