/**
 * Demo DES B3 — motion + elevation (referencia visual para desarrollo).
 * Ruta sugerida: /__des/motion (solo DEV).
 */
import { DAKINIS_MOTION, DAKINIS_MOTION_USAGE, DAKINIS_MOTION_CLASSES } from "../motion.js";
import {
  DAKINIS_ELEVATION,
  DAKINIS_ELEVATION_CLASSES,
  DAKINIS_ELEVATION_USAGE,
} from "../../../shared-foundation/src/elevation.js";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import Badge from "./Badge.jsx";

const MOTION_ROWS = Object.entries(DAKINIS_MOTION_USAGE).map(([key, use]) => ({
  key,
  ms: DAKINIS_MOTION[key],
  use,
  css: `--dakinis-motion-${key}`,
}));

export default function MotionElevationDemo({ className = "" }) {
  return (
    <section className={`dakinis-des-demo ${className}`.trim()} aria-labelledby="des-motion-title">
      <header className="dakinis-des-demo__head dakinis-motion-fade-in">
        <p className="dakinis-des-demo__kicker">DES · Foundation</p>
        <h1 id="des-motion-title">Motion &amp; Elevation</h1>
        <p className="dakinis-des-demo__lead">
          Tokens oficiales · clases utilitarias · reduced-motion respetado.
        </p>
      </header>

      <div className="dakinis-des-demo__grid">
        <Card className="dakinis-des-demo__panel">
          <h2>Motion</h2>
          <table className="dakinis-des-demo__table">
            <thead>
              <tr>
                <th>Token</th>
                <th>ms</th>
                <th>Uso</th>
              </tr>
            </thead>
            <tbody>
              {MOTION_ROWS.map((row) => (
                <tr key={row.key}>
                  <td>
                    <code>{row.css}</code>
                  </td>
                  <td>{row.ms}</td>
                  <td>{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="dakinis-des-demo__samples">
            <div className={`${DAKINIS_MOTION_CLASSES.fadeIn} dakinis-card dakinis-elev-1`}>
              fade-in
            </div>
            <div className={`${DAKINIS_MOTION_CLASSES.slideIn} dakinis-card dakinis-elev-1`}>
              slide-in
            </div>
            <div className={`${DAKINIS_MOTION_CLASSES.skeleton} dakinis-card dakinis-elev-1`}>
              skeleton
            </div>
            <div className={`${DAKINIS_MOTION_CLASSES.hover} dakinis-card dakinis-elev-2`}>
              hover scale
            </div>
          </div>
          <div className="dakinis-des-demo__actions">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge tone="accent">accent</Badge>
          </div>
        </Card>

        <Card className="dakinis-des-demo__panel">
          <h2>Elevation</h2>
          <p className="dakinis-des-demo__hint">{DAKINIS_ELEVATION_USAGE.card}</p>
          <div className="dakinis-des-demo__elevs">
            {[0, 1, 2, 3].map((level) => (
              <div
                key={level}
                className={`dakinis-des-demo__elev-swatch dakinis-surface-1 ${DAKINIS_ELEVATION_CLASSES[level]}`}
              >
                <strong>elev-{level}</strong>
                <span>{DAKINIS_ELEVATION[level].use}</span>
                <code>{DAKINIS_ELEVATION[level].cssVar}</code>
              </div>
            ))}
            <div className={`dakinis-des-demo__elev-swatch dakinis-surface-1 ${DAKINIS_ELEVATION_CLASSES.ai}`}>
              <strong>elev-ai</strong>
              <span>{DAKINIS_ELEVATION_USAGE.ai}</span>
              <code>--dakinis-shadow-ai</code>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
