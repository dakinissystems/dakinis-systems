export interface SrdBackground {
  id: string;
  name: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  /** Idiomas adicionales a elegir (PHB) */
  extraLanguages?: number;
  equipment: string[];
  description: string;
}

/** Trasfondos PHB (SRD) — portados desde legacy data.js */
export const SRD_BACKGROUNDS: SrdBackground[] = [
  {
    id: "acolyte",
    name: "Acolito",
    skillProficiencies: ["insight", "religion"],
    extraLanguages: 2,
    equipment: ["Amuleto sagrado", "Ropa de viaje", "5 inciensos", "Raciones de viaje", "15 po"],
    description: "Has pasado tu vida al servicio de un templo. Conoces los ritos sagrados y la fe de tu pueblo.",
  },
  {
    id: "artisan",
    name: "Artesano",
    skillProficiencies: ["insight", "persuasion"],
    toolProficiencies: ["Herramientas de artesano"],
    equipment: ["Herramientas de artesano", "Ropa de viaje", "15 po"],
    description: "Dominas un oficio y has vendido tus creaciones en mercados y ferias.",
  },
  {
    id: "entertainer",
    name: "Artista",
    skillProficiencies: ["acrobatics", "performance"],
    toolProficiencies: ["Instrumento musical"],
    equipment: ["Instrumento musical", "Ropa de viaje", "15 po"],
    description: "Vives para el escenario: música, danza, humor o drama ante un público.",
  },
  {
    id: "charlatan",
    name: "Charlatán",
    skillProficiencies: ["deception", "sleight of hand"],
    toolProficiencies: ["Herramientas de falsificador"],
    equipment: ["Ropa fina", "Herramientas de falsificador", "15 po"],
    description: "Siempre tienes un truco bajo la manga y una identidad alternativa preparada.",
  },
  {
    id: "criminal",
    name: "Criminal",
    skillProficiencies: ["deception", "stealth"],
    toolProficiencies: ["Herramientas de ladrón"],
    equipment: ["Ropa oscura", "Herramientas de ladrón", "15 po"],
    description: "Te ganaste la vida al margen de la ley en callejones y tabernas oscuras.",
  },
  {
    id: "sage",
    name: "Erudito",
    skillProficiencies: ["history", "arcana"],
    extraLanguages: 2,
    equipment: ["Libro de conocimiento", "Ropa de viaje", "15 po"],
    description: "Pasaste años estudiando las grandes bibliotecas y archivos del mundo.",
  },
  {
    id: "outlander",
    name: "Forastero",
    skillProficiencies: ["athletics", "survival"],
    toolProficiencies: ["Instrumento musical"],
    equipment: ["Instrumento musical", "Ropa de viaje", "10 po"],
    description: "Creciste lejos de la civilización, en bosques, montañas o tierras salvajes.",
  },
  {
    id: "folk-hero",
    name: "Héroe del pueblo",
    skillProficiencies: ["athletics", "survival"],
    toolProficiencies: ["Herramientas de artesano"],
    equipment: ["Herramientas de artesano", "Pala de hierro", "Ropa de viaje", "10 po"],
    description: "Eres un héroe local cuyos actos inspiraron a tu comunidad.",
  },
  {
    id: "sailor",
    name: "Marinero",
    skillProficiencies: ["athletics", "perception"],
    toolProficiencies: ["Herramientas de navegante"],
    equipment: ["Herramientas de navegante", "Ropa de viaje", "10 po"],
    description: "Navegaste mares y ríos, aprendiendo nudos, vientos y supersticiones de marineros.",
  },
  {
    id: "noble",
    name: "Noble",
    skillProficiencies: ["history", "persuasion"],
    extraLanguages: 1,
    equipment: ["Ropa fina", "Anillo de sello", "Raciones de viaje", "25 po"],
    description: "Entendiste riqueza, poder y privilegio desde tu cuna en la aristocracia.",
  },
  {
    id: "hermit",
    name: "Sabio ermitaño",
    skillProficiencies: ["medicine", "religion"],
    toolProficiencies: ["Kit de herboristería"],
    equipment: ["Rollo de pergaminos", "Kit de herboristería", "Ropa de viaje", "10 po"],
    description: "Viviste en reclusión buscando iluminación espiritual o un secreto del cosmos.",
  },
  {
    id: "soldier",
    name: "Soldado",
    skillProficiencies: ["athletics", "intimidation"],
    toolProficiencies: ["Juego de dados", "Juego de tablero"],
    equipment: ["Insignia de rango", "Trofeo de enemigo", "Set de dados", "Ropa de viaje", "10 po"],
    description: "Serviste en un ejército aprendiendo disciplina, táctica y camaradería.",
  },
];

export function findBackground(id: string): SrdBackground | undefined {
  return SRD_BACKGROUNDS.find((b) => b.id === id);
}
