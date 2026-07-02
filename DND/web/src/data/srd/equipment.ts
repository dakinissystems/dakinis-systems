import type { Armor, InventoryItem, ItemCategory } from "../../types/character";

export interface WeaponTemplate {
  name: string;
  damageDice: string;
  damageType: string;
  properties: string[];
  range?: string;
}

export interface ArmorTemplate {
  name: string;
  type: Armor["type"];
  baseAC: number;
  acBonus?: number;
  notes?: string;
}

export interface ItemTemplate {
  name: string;
  category: ItemCategory;
  description?: string;
}

/** Armas SRD — incluye plantillas legacy en español + estándar EN */
export const SRD_WEAPON_TEMPLATES: WeaponTemplate[] = [
  { name: "Espada corta", damageDice: "1d6", damageType: "Perforante", properties: ["Ligera", "Finesse"], range: "Melee" },
  { name: "Espada larga", damageDice: "1d8", damageType: "Cortante", properties: ["Versátil (1d10)"], range: "Melee" },
  { name: "Espada de dos manos", damageDice: "2d6", damageType: "Cortante", properties: ["Dos manos", "Pesada"], range: "Melee" },
  { name: "Arco largo", damageDice: "1d8", damageType: "Perforante", properties: ["A distancia", "Pesada", "Dos manos", "Munición"], range: "150/600 ft" },
  { name: "Ballesta ligera", damageDice: "1d8", damageType: "Perforante", properties: ["A distancia", "Recarga", "Dos manos"], range: "80/320 ft" },
  { name: "Daga", damageDice: "1d4", damageType: "Perforante", properties: ["Ligera", "Finesse", "Arrojadiza"], range: "20/60 ft" },
  { name: "Martillo de guerra", damageDice: "1d8", damageType: "Contundente", properties: ["Versátil (1d10)"], range: "Melee" },
  { name: "Hacha de batalla", damageDice: "1d8", damageType: "Cortante", properties: ["Versátil (1d10)"], range: "Melee" },
  { name: "Longsword", damageDice: "1d8", damageType: "Slashing", properties: ["Versatile"], range: "Melee" },
  { name: "Greatsword", damageDice: "2d6", damageType: "Slashing", properties: ["Heavy", "Two-Handed"], range: "Melee" },
  { name: "Greataxe", damageDice: "1d12", damageType: "Slashing", properties: ["Heavy", "Two-Handed"], range: "Melee" },
  { name: "Maul", damageDice: "2d6", damageType: "Bludgeoning", properties: ["Heavy", "Two-Handed"], range: "Melee" },
  { name: "Warhammer", damageDice: "1d8", damageType: "Bludgeoning", properties: ["Versatile"], range: "Melee" },
  { name: "Rapier", damageDice: "1d8", damageType: "Piercing", properties: ["Finesse"], range: "Melee" },
  { name: "Shortsword", damageDice: "1d6", damageType: "Piercing", properties: ["Finesse", "Light"], range: "Melee" },
  { name: "Javelin", damageDice: "1d6", damageType: "Piercing", properties: ["Thrown"], range: "30/120 ft" },
  { name: "Longbow", damageDice: "1d8", damageType: "Piercing", properties: ["Ammunition", "Heavy", "Two-Handed"], range: "150/600 ft" },
  { name: "Crossbow, light", damageDice: "1d8", damageType: "Piercing", properties: ["Ammunition", "Loading", "Two-Handed"], range: "80/320 ft" },
];

export const SRD_ARMOR_TEMPLATES: ArmorTemplate[] = [
  { name: "Armadura de cuero", type: "ligera", baseAC: 11, notes: "Sin desventaja en sigilo" },
  { name: "Armadura de cuero tachonado", type: "ligera", baseAC: 12, notes: "Sin desventaja en sigilo" },
  { name: "Cota de malla", type: "media", baseAC: 16, notes: "Desventaja en sigilo; +DEX máx 2" },
  { name: "Armadura de placas", type: "pesada", baseAC: 18, notes: "Desventaja en sigilo; requiere FUE 15" },
  { name: "Escudo", type: "escudo", baseAC: 2, notes: "+2 CA" },
];

export const SRD_ITEM_TEMPLATES: ItemTemplate[] = [
  { name: "Mochila", category: "supervivencia", description: "Contiene hasta 30 lb de equipo" },
  { name: "Poción de curación", category: "curacion", description: "Cura 2d4+2 puntos de vida" },
  { name: "Raciones de viaje", category: "supervivencia", description: "Comida para un día" },
  { name: "Cuerda de cáñamo (50 ft)", category: "supervivencia", description: "Cuerda resistente" },
  { name: "Antorcha", category: "supervivencia", description: "Ilumina en un radio de 20 pies" },
  { name: "Kit de herboristería", category: "curacion", description: "Para preparar pociones y antídotos" },
  { name: "Herramientas de ladrón", category: "otro", description: "Ganzúas, lima y espejo" },
  { name: "Instrumento musical", category: "ornamento", description: "Instrumento a elección" },
];

export function armorFromTemplate(t: ArmorTemplate): Armor {
  return {
    id: crypto.randomUUID(),
    name: t.name,
    isCustom: false,
    isEquipped: false,
    baseAC: t.baseAC,
    acBonus: t.acBonus ?? 0,
    type: t.type,
    notes: t.notes,
  };
}

export function itemFromTemplate(t: ItemTemplate): InventoryItem {
  return {
    id: crypto.randomUUID(),
    name: t.name,
    category: t.category,
    quantity: 1,
    description: t.description,
    isCustom: false,
  };
}
