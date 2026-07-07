import { useLocale } from "../../context/LocaleContext";

export type NavTab = "ficha" | "combate" | "hechizos" | "arsenal" | "mas";

type Props = {
  active: NavTab;
  onChange: (tab: NavTab) => void;
};

export function BottomNav({ active, onChange }: Props) {
  const { t } = useLocale();
  const items: { id: NavTab; label: string; icon: string }[] = [
    { id: "ficha", label: t("bottomNav.sheet"), icon: "📜" },
    { id: "combate", label: t("bottomNav.combat"), icon: "⚔️" },
    { id: "hechizos", label: t("bottomNav.spells"), icon: "✨" },
    { id: "arsenal", label: t("bottomNav.arsenal"), icon: "🎒" },
    { id: "mas", label: t("bottomNav.more"), icon: "☰" },
  ];

  return (
    <nav className="bottom-nav" aria-label={t("bottomNav.aria")}>
      {items.map((item) => (
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

