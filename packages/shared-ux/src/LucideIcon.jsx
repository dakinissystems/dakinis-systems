import * as Lucide from "lucide-react";

function toComponentName(name) {
  return String(name || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Render Lucide icon by kebab-case name (Hub widgets registry).
 * @param {{ name?: string; size?: number; className?: string }} props
 */
export function LucideIcon({ name, size = 20, className = "" }) {
  if (!name) return null;
  const Icon = Lucide[toComponentName(name)] || Lucide.Circle;
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden />;
}
