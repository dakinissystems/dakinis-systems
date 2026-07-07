import type { SrdClass, SrdRace } from "../../data/srd/types";
import { useLocale } from "../../context/LocaleContext";
import { srdDisplayName } from "../../lib/locale-utils";
import type { SpellBook } from "../../data/srd/types";

const SOURCE_LABEL: Record<SpellBook, string> = {
  srd: "SRD",
  xge: "XGE",
  tce: "TCE",
};

type Props = {
  races: SrdRace[];
};

export function CompendiumRacesSection({ races }: Props) {
  const { locale, t } = useLocale();

  return (
    <div className="grid-2">
      {races.map((race) => (
        <article key={race.id} className="combo-card">
          <h3>
            {srdDisplayName(race, locale)}{" "}
            <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.9rem" }}>
              ({locale === "en" ? race.name : race.nameEn})
            </span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            {race.size} · {race.speed} ft · {t("compendium.racesLanguages")}: {race.languages.join(", ")}
          </p>
          <p style={{ fontSize: "0.85rem" }}>
            {t("compendium.racesBonuses")}:{" "}
            {Object.entries(race.abilityBonuses)
              .map(([k, v]) => `${k.toUpperCase()} +${v}`)
              .join(", ") || "-"}
          </p>
          <ul className="steps">
            {race.traits.map((trait) => (
              <li key={trait.name}>
                <strong>{trait.name}:</strong> {trait.description}
              </li>
            ))}
          </ul>
          {race.subraces && race.subraces.length > 0 && (
            <details style={{ marginTop: "0.5rem" }}>
              <summary style={{ cursor: "pointer", color: "var(--gold)" }}>
                {t("compendium.racesSubraces", { count: race.subraces.length })}
              </summary>
              <ul className="steps">
                {race.subraces.map((s) => (
                  <li key={s.id}>
                    <strong>{s.name}</strong>
                    {Object.keys(s.abilityBonuses).length > 0 &&
                      ` — ${Object.entries(s.abilityBonuses)
                        .map(([k, v]) => `${k.toUpperCase()} +${v}`)
                        .join(", ")}`}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </article>
      ))}
    </div>
  );
}

type ClassesProps = {
  classes: SrdClass[];
};

export function CompendiumClassesSection({ classes }: ClassesProps) {
  const { locale, t } = useLocale();

  return (
    <div className="grid-2">
      {classes.map((cls) => (
        <article key={cls.id} className="combo-card">
          <h3>
            {srdDisplayName(cls, locale)}{" "}
            <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.9rem" }}>
              d{cls.hitDie} · {locale === "en" ? cls.name : cls.nameEn}
            </span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            {t("compendium.classesSaves")}: {cls.savingThrows.map((a) => a.toUpperCase()).join(", ")} ·{" "}
            {cls.spellcasting
              ? `${t("compendium.classesSpells")} (${cls.spellcasting.type}, ${cls.spellcasting.ability.toUpperCase()})`
              : t("compendium.classesNoSpells")}
          </p>
          <ul className="steps">
            {cls.features.slice(0, 5).map((f) => (
              <li key={f.name}>
                <strong>Niv {f.level} — {f.name}:</strong> {f.description}
              </li>
            ))}
          </ul>
          <details style={{ marginTop: "0.5rem" }}>
            <summary style={{ cursor: "pointer", color: "var(--gold)" }}>
              {t("compendium.classesSubclasses", { count: cls.subclasses.length })}
            </summary>
            <ul className="steps">
              {cls.subclasses.map((s) => (
                <li key={s.id}>
                  <strong>{s.name}</strong>
                  {s.source && (
                    <span className="tag" style={{ marginLeft: 6 }}>
                      {SOURCE_LABEL[s.source]}
                    </span>
                  )}{" "}
                  — {s.description}
                </li>
              ))}
            </ul>
          </details>
        </article>
      ))}
    </div>
  );
}
