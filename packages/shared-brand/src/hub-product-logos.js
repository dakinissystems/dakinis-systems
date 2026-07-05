import coreLogo from "../assets/hub-logos/core.png";
import lifeflowLogo from "../assets/hub-logos/lifeflow.png";
import streamautomatorLogo from "../assets/hub-logos/streamautomator.png";
import akoenetLogo from "../assets/hub-logos/akoenet.png";
import tabletopLogo from "../assets/hub-logos/tabletop.png";

/** @type {Record<string, { src: string; alt: string; objectPosition?: string; scale?: number }>} */
export const HUB_PRODUCT_LOGOS = {
  core: { src: coreLogo, alt: "Dakinis One", objectPosition: "50% 22%", scale: 1.15 },
  "dakinis-one": { src: coreLogo, alt: "Dakinis One", objectPosition: "50% 22%", scale: 1.15 },
  lifeflow: { src: lifeflowLogo, alt: "LifeFlow" },
  streamautomator: { src: streamautomatorLogo, alt: "StreamAutomator" },
  akoenet: { src: akoenetLogo, alt: "AkoeNet" },
  tabletop: { src: tabletopLogo, alt: "Tabletop" },
  dnd: { src: tabletopLogo, alt: "Tabletop" },
};

/**
 * @param {string} appId
 * @param {string} [product]
 */
export function getHubProductLogo(appId = "", product = "") {
  const key = String(appId || product || "").trim();
  return HUB_PRODUCT_LOGOS[key] || HUB_PRODUCT_LOGOS[String(product || "").trim()] || null;
}
