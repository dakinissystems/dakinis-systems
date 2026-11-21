const coreLogo = new URL("../assets/hub-logos/core.png", import.meta.url).href;
const lifeflowLogo = new URL("../assets/hub-logos/lifeflow.png", import.meta.url).href;
const streamautomatorLogo = new URL("../assets/hub-logos/streamautomator.png", import.meta.url).href;
const akoenetLogo = new URL("../assets/hub-logos/akoenet.png", import.meta.url).href;
const tabletopLogo = new URL("../assets/hub-logos/tabletop.png", import.meta.url).href;

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
