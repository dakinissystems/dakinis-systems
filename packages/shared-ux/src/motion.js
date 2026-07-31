/**
 * Re-export motion DES desde Foundation + clases CSS (components/motion.css).
 */
export {
  DAKINIS_MOTION,
  DAKINIS_MOTION_USAGE,
  DAKINIS_MOTION_LEGACY,
} from "../../shared-foundation/src/motion.js";

/** Clases utilitarias — definidas en shared-brand/components/motion.css */
export const DAKINIS_MOTION_CLASSES = {
  fadeIn: "dakinis-motion-fade-in",
  slideIn: "dakinis-motion-slide-in",
  skeleton: "dakinis-motion-skeleton",
  hover: "dakinis-motion-hover",
  dropdown: "dakinis-motion-dropdown",
  modal: "dakinis-motion-modal",
};

/** @deprecated CSS vive en tokens; mantener string vacío para BC de inyección dinámica. */
export const motionStylesheet = "";
