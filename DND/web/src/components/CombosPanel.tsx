import type { Character } from "../types/character";
import { suggestCombos, suggestFeats } from "../engine/combo-suggester";
import { useLocale } from "../context/LocaleContext";

type Props = {
  character: Character;
};

function joinActiveNames(names: string[], noneLabel: string): string {
  return names.length > 0 ? names.join(", ") : noneLabel;
}

export function CombosPanel({ character }: Props) {
  const { t } = useLocale();
  const combos = suggestCombos(character);
  const featSuggestions = suggestFeats(character);

  const activeWeaponNames: string[] = [];
  for (const weapon of character.weapons) {
    if (weapon.isActive) activeWeaponNames.push(weapon.name);
  }

  const preparedSpellNames: string[] = [];
  for (const spell of character.spells) {
    if (spell.isPrepared) preparedSpellNames.push(spell.name);
  }

  const takenFeatNames: string[] = [];
  for (const feat of character.feats) {
    if (feat.isTaken) takenFeatNames.push(feat.name);
  }

  return (
    <div className="grid-2">
      <section className="panel" style={{ gridColumn: "1 / -1" }}>
        <h2>{t("combos.title", { name: character.name })}</h2>
        <p style={{ color: "var(--muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {t("combos.hint")}
        </p>

        {combos.length === 0 ? (
          <p className="empty-state">
            {t("combos.empty")}
          </p>
        ) : (
          combos.map((combo) => (
            <article key={combo.id} className="combo-card">
              <div className="meta">
                <span className={`badge badge-priority-${combo.priority}`}>
                  {combo.priority.toUpperCase()}
                </span>
                <span className="badge" style={{ background: "rgba(201,162,39,0.15)", color: "var(--gold)" }}>
                  {t("combos.synergy", { score: combo.synergyScore })}
                </span>
                {combo.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <h3>{combo.title}</h3>
              <p>{combo.description}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                <strong>{t("combos.requirements")}</strong> {combo.requirements.join(" · ")}
              </p>
              <ol className="steps">
                {combo.steps.map((step) => (
                  <li key={`${combo.id}-${step}`}>{step}</li>
                ))}
              </ol>
            </article>
          ))
        )}
      </section>

      <section className="panel">
        <h2>{t("combos.featsTitle")}</h2>
        {featSuggestions.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{t("combos.featsEmpty")}</p>
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
          {t("combos.refineHint")}
        </p>
      </section>

      <section className="panel">
        <h2>{t("combos.buildTitle")}</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          <li>
            {t("combos.activeWeapons", {
              value: joinActiveNames(activeWeaponNames, t("combos.none")),
            })}
          </li>
          <li>
            {t("combos.preparedSpells", {
              value: joinActiveNames(preparedSpellNames, t("combos.none")),
            })}
          </li>
          <li>
            {t("combos.feats", {
              value: joinActiveNames(takenFeatNames, t("combos.none")),
            })}
          </li>
          <li>
            {t("combos.styles", {
              value: character.fightingStyles.join(", ") || t("combos.none"),
            })}
          </li>
        </ul>
      </section>
    </div>
  );
}
