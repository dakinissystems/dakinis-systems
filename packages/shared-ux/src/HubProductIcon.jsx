import { DAKINIS_PRODUCT_THEMES } from "../../shared-brand/src/colors.js";
import { getHubProductLogo } from "../../shared-brand/src/hub-product-logos.js";
import { LucideIcon } from "./LucideIcon.jsx";
import { HUB_APP_ICONS } from "./hub-dashboard.js";

const THEME_BY_APP = {
  core: "core",
  "dakinis-one": "core",
  lifeflow: "lifeflow",
  streamautomator: "streamautomator",
  akoenet: "akoenet",
  tabletop: "tabletop",
  dnd: "tabletop",
};

/**
 * Badge de producto Hub — logo de marca o icono Lucide de respaldo.
 * @param {{ appId?: string; product?: string; size?: number; className?: string }} props
 */
export function HubProductIcon({ appId = "", product = "", size = 20, className = "" }) {
  const themeKey = THEME_BY_APP[appId] || THEME_BY_APP[product] || "core";
  const theme = DAKINIS_PRODUCT_THEMES[themeKey] || DAKINIS_PRODUCT_THEMES.core;
  const logo = getHubProductLogo(appId, product);
  const badge = Math.round(size * 1.75);

  return (
    <span
      className={`dakinis-hub-product-icon ${logo ? "dakinis-hub-product-icon--logo" : ""} ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: badge,
        height: badge,
        borderRadius: "0.65rem",
        background: logo
          ? `linear-gradient(145deg, ${theme.accent}18, ${theme.accentDark}30)`
          : `linear-gradient(145deg, ${theme.accent}28, ${theme.accentDark}44)`,
        border: `1px solid ${theme.accent}55`,
        color: theme.accent,
        flexShrink: 0,
        boxShadow: `0 2px 8px ${theme.accent}22`,
        overflow: "hidden",
      }}
      aria-hidden
    >
      {logo ? (
        <img
          src={logo.src}
          alt=""
          width={badge}
          height={badge}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: logo.objectPosition || "center",
            transform: logo.scale ? `scale(${logo.scale})` : undefined,
          }}
        />
      ) : (
        <LucideIcon name={HUB_APP_ICONS[appId] || HUB_APP_ICONS[product] || "layout-grid"} size={size} />
      )}
    </span>
  );
}
