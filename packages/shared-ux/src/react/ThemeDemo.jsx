/**
 * Demo DES B5 — temas + high-contrast QA.
 * Ruta: /__des/theme (solo DEV).
 */
import { useState } from "react";
import { DES_HIGH_CONTRAST_QA } from "../../../shared-theme/src/theme-engine.js";
import { DAKINIS_THEMES } from "../../../shared-theme/src/themes.js";
import ColorModeControl from "./ColorModeControl.jsx";
import Card from "./Card.jsx";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Input from "./Input.jsx";

export default function ThemeDemo({ className = "" }) {
  const [checked, setChecked] = useState({});

  return (
    <section className={`dakinis-des-demo ${className}`.trim()} aria-labelledby="des-theme-title">
      <header className="dakinis-des-demo__head dakinis-motion-fade-in">
        <p className="dakinis-des-demo__kicker">DES · Theme Engine v1.1</p>
        <h1 id="des-theme-title">Apariencia &amp; High-contrast</h1>
        <p className="dakinis-des-demo__lead">
          Temas: {DAKINIS_THEMES.join(" · ")}. Hub default = system.
        </p>
      </header>

      <div className="dakinis-des-demo__stack">
        <Card className="dakinis-des-demo__panel">
          <h2>Control</h2>
          <ColorModeControl product="core" namespace="des-demo" defaultMode="system" />
        </Card>

        <Card className="dakinis-des-demo__panel">
          <h2>Muestra de superficies</h2>
          <div className="dakinis-des-demo__elevs">
            {[0, 1, 2].map((n) => (
              <div key={n} className={`dakinis-des-demo__elev-swatch dakinis-surface-${n} dakinis-elev-${n}`}>
                <strong>surface-{n}</strong>
                <span>Texto · muted preview</span>
                <span style={{ color: "var(--dakinis-muted)" }}>muted</span>
              </div>
            ))}
          </div>
          <div className="dakinis-des-demo__actions">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Badge tone="success">OK</Badge>
            <Badge tone="warning">Warn</Badge>
            <Badge tone="danger">Err</Badge>
          </div>
          <Input label="Campo de prueba" name="demo" placeholder="Contraste de input" />
        </Card>

        <Card className="dakinis-des-demo__panel">
          <h2>HC QA checklist</h2>
          <ul className="dakinis-des-demo__list">
            {DES_HIGH_CONTRAST_QA.map((item) => (
              <li key={item}>
                <label className="dakinis-color-mode__hc">
                  <input
                    type="checkbox"
                    checked={Boolean(checked[item])}
                    onChange={(e) =>
                      setChecked((c) => ({ ...c, [item]: e.target.checked }))
                    }
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
