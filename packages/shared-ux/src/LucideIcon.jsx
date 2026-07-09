import { LUCIDE_ICON_PATHS } from "./lucide-icon-paths.js";

/**
 * Icono stroke estilo Lucide — sin dependencia npm (vendored DES en Core/Hub/LF).
 * @param {{ name?: string; size?: number; className?: string }} props
 */
export function LucideIcon({ name, size = 20, className = "" }) {
  if (!name) return null;
  const spec = LUCIDE_ICON_PATHS[name] || LUCIDE_ICON_PATHS.circle;
  const paths = Array.isArray(spec) ? spec : [spec];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
