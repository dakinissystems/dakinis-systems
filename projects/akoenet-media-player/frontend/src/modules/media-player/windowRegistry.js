import { STRINGS } from "../i18n/strings.js";

export const WINDOW_REGISTRY = [
  {
    id: "player.main",
    title: STRINGS.windows["player.main"],
    defaultRect: { x: 48, y: 72, width: 360, height: 420 },
    defaultVisible: true,
    essential: true,
  },
  {
    id: "player.playlist",
    title: STRINGS.windows["player.playlist"],
    defaultRect: { x: 420, y: 72, width: 300, height: 360 },
    defaultVisible: false,
  },
  {
    id: "player.eq",
    title: STRINGS.windows["player.eq"],
    defaultRect: { x: 48, y: 500, width: 360, height: 320 },
    defaultVisible: false,
  },
  {
    id: "player.library",
    title: STRINGS.windows["player.library"],
    defaultRect: { x: 420, y: 440, width: 300, height: 280 },
    defaultVisible: false,
  },
  {
    id: "player.visualizer",
    title: STRINGS.windows["player.visualizer"],
    defaultRect: { x: 740, y: 72, width: 300, height: 220 },
    defaultVisible: false,
  },
];
