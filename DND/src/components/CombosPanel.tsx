import type { Character } from "../types/character";
import { suggestCombos, suggestFeats } from "../engine/combo-suggester";

type Props = {
  character: Character;
};

export function CombosPanel({ character }: Props) {
  const combos = suggestCombos(character);
  const featSuggestions = suggestFeats(character);

  return (
    <div className="grid-2">
      <section className="panel" style={{ gridColumn: "1 / -1" }}>
        <h2>Combos sugeridos para {character.name}</h2>
        <p style={{ color: "var(--muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
          Basado en clase, raza, armas activas, hechizos preparados, dotes e inventario — reglas D&D 5e.
          Las sugerencias se actualizan al cambiar tu ficha.
        </p>

        {combos.length === 0 ? (
          <p className="empty-state">
            No hay combos detectados. Prepara hechizos, activa armas o añade dotes para obtener sugerencias.
          </p>
        ) : (
          combos.map((combo) => (
            <article key={combo.id} className="combo-card">
              <div className="meta">
                <span className={`badge badge-priority-${combo.priority}`}>
                  {combo.priority.toUpperCase()}
                </span>
                <span className="badge" style={{ background: "rgba(201,162,39,0.15)", color: "var(--gold)" }}>
                  Sinergia {combo.synergyScore}
                </span>
                {combo.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <h3>{combo.title}</h3>
              <p>{combo.description}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                <strong>Requisitos:</strong> {combo.requirements.join(" · ")}
              </p>
              <ol className="steps">
                {combo.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </article>
          ))
        )}
      </section>

      <section className="panel">
        <h2>Dotes recomendadas</h2>
        {featSuggestions.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Ya tienes las dotes óptimas para tu build actual.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {featSuggestions.map((f) => (
              <li key={f.name} style={{ marginBottom: "0.5rem" }}>
                <strong>{f.name}</strong> — {f.reason}
              </li>
            ))}
          </ul>
        )}
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "1rem" }}>
          Marca dotes tomadas en la pestaña Ficha para refinar sugerencias.
        </p>
      </section>

      <section className="panel">
        <h2>Resumen del build</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          <li>
            Armas activas:{" "}
            {character.weapons.filter((w) => w.isActive).map((w) => w.name).join(", ") || "ninguna"}
          </li>
          <li>
            Hechizos preparados:{" "}
            {character.spells.filter((s) => s.isPrepared).map((s) => s.name).join(", ") || "ninguno"}
          </li>
          <li>
            Dotes: {character.feats.filter((f) => f.isTaken).map((f) => f.name).join(", ") || "ninguna"}
          </li>
          <li>
            Estilos: {character.fightingStyles.join(", ") || "ninguno"}
          </li>
        </ul>
      </section>
    </div>
  );
}