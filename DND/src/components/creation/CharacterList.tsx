import { calculateAC, className } from "../../engine/formulas";
import type { Character } from "../../types/character";

type Props = {
  characters: Character[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete?: (id: string) => void;
  onLegal?: () => void;
};

export function CharacterList({ characters, onSelect, onCreate, onDelete, onLegal }: Props) {
  return (
    <div className="screen screen--list">
      <header className="list-header">
        <h1>D&D 5e</h1>
        <p>Mis personajes</p>
      </header>

      <div className="character-cards">
        {characters.map((c) => (
          <article key={c.id} className="character-card">
            <button type="button" className="character-card__body" onClick={() => onSelect(c.id)}>
              <div className="character-card__top">
                <h2>{c.name || "Sin nombre"}</h2>
                {!c.setupComplete && <span className="badge badge-custom">Borrador</span>}
              </div>
              <p className="character-card__sub">
                Nv {c.level} {c.race} · {className(c)}
              </p>
              <div className="character-card__stats">
                <span>CA {calculateAC(c)}</span>
                <span>PV {c.resources.currentHP}/{c.resources.maxHP}</span>
              </div>
            </button>
            {onDelete && characters.length > 1 && (
              <button
                type="button"
                className="character-card__delete btn-icon"
                aria-label={`Eliminar ${c.name}`}
                onClick={() => onDelete(c.id)}
              >
                ×
              </button>
            )}
          </article>
        ))}
      </div>

      <button type="button" className="fab" onClick={onCreate} aria-label="Crear personaje">
        +
      </button>

      {onLegal ? (
        <footer className="list-footer">
          <button type="button" className="btn-link" onClick={onLegal}>
            Privacidad · Términos · OGL
          </button>
        </footer>
      ) : null}
    </div>
  );
}
