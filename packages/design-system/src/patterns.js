import { DES_PATTERNS } from "../../shared-des/src/patterns/index.js";

export const DES_PATTERNS_EXTENDED = Object.freeze({
  ...DES_PATTERNS,
  attentionCenter: {
    status: "ready",
    module: "@dakinis/shared-ux/react/HubAttentionPanel.jsx",
  },
  globalSearch: {
    status: "planned",
    module: "@dakinis/shared-ux/command-palette",
  },
  uiStates: {
    status: "ready",
    module: "@dakinis/design-system/ui-states",
  },
});
