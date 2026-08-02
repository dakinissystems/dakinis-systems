/**
 * Control de apariencia DES — dark / light / system (+ high-contrast opcional).
 */
import { useEffect, useState } from "react";
import {
  applyDesColorMode,
  loadDesColorMode,
  loadDesHighContrast,
  DES_COLOR_MODES,
} from "../../../shared-theme/src/theme-engine.js";
import Button from "./Button.jsx";

const MODE_LABELS = {
  system: "Sistema",
  light: "Claro",
  dark: "Oscuro",
};

export default function ColorModeControl({
  product = "hub",
  namespace,
  userId = "anon",
  defaultMode = "system",
  showHighContrast = true,
  className = "",
}) {
  const ns = namespace || product;
  const [mode, setMode] = useState(() =>
    loadDesColorMode({ namespace: ns, userId, defaultMode })
  );
  const [highContrast, setHighContrast] = useState(() =>
    loadDesHighContrast({ namespace: ns, userId })
  );

  useEffect(() => {
    applyDesColorMode({
      product,
      namespace: ns,
      userId,
      colorMode: mode,
      highContrast,
      defaultMode,
    });
  }, [mode, highContrast, product, ns, userId, defaultMode]);

  return (
    <div className={`dakinis-color-mode ${className}`.trim()}>
      <p className="dakinis-color-mode__label" id="dakinis-color-mode-label">
        Apariencia
      </p>
      <div
        className="dakinis-color-mode__modes"
        role="group"
        aria-labelledby="dakinis-color-mode-label"
      >
        {DES_COLOR_MODES.map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={mode === m ? "primary" : "ghost"}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {MODE_LABELS[m] || m}
          </Button>
        ))}
      </div>
      {showHighContrast ? (
        <label className="dakinis-color-mode__hc">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
          />
          <span>Alto contraste</span>
        </label>
      ) : null}
    </div>
  );
}
