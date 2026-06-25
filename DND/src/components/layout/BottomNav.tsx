import type { CharacterTab } from "../../types/character";

export type NavTab = "ficha" | "combate" | "hechizos" | "arsenal" | "mas";

const ITEMS: { id: NavTab; label: string; icon: string }[] = [
  { id: "ficha", label: "Ficha", icon: "📜" },
  { id: "combate", label: "Combate", icon: "⚔️" },
  { id: "hechizos", label: "Magia", icon: "✨" },
  { id: "arsenal", label: "Arsenal", icon: "🎒" },
  { id: "mas", label: "Más", icon: "☰" },
];

type Props = {
  active: NavTab;
  onChange: (tab: NavTab) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`bottom-nav__item ${active === item.id ? "bottom-nav__item--active" : ""}`}
          onClick={() => onChange(item.id)}
          aria-current={active === item.id ? "page" : undefined}
        >
          <span className="bottom-nav__icon" aria-hidden>
            {item.icon}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export type MorePanel = Extract<CharacterTab, "combos" | "compendio" | "inventario">;

export const MORE_OPTIONS: { id: MorePanel; label: string; desc: string }[] = [
  { id: "inventario", label: "Inventario", desc: "Objetos y equipo de campaña" },
  { id: "combos", label: "Combos tácticos", desc: "Sugerencias según tu build" },
  { id: "compendio", label: "Compendio SRD", desc: "Razas, clases y hechizos" },
];
