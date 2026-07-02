export { DAKINIS_MOTION, DAKINIS_MOTION_USAGE } from "../../shared-brand/src/motion.js";

/** Clases utilitarias para animaciones consistentes. */
export const DAKINIS_MOTION_CLASSES = {
  fadeIn: "dakinis-motion-fade-in",
  slideIn: "dakinis-motion-slide-in",
  skeleton: "dakinis-motion-skeleton",
};

export const motionStylesheet = `
@keyframes dakinis-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dakinis-slide-in {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes dakinis-skeleton {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
}
.dakinis-motion-fade-in {
  animation: dakinis-fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1) both;
}
.dakinis-motion-slide-in {
  animation: dakinis-slide-in 250ms cubic-bezier(0.4, 0, 0.2, 1) both;
}
.dakinis-motion-skeleton {
  animation: dakinis-skeleton 1.2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .dakinis-motion-fade-in,
  .dakinis-motion-slide-in,
  .dakinis-motion-skeleton { animation: none; }
}
`;
