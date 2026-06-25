/**
 * Hub Navigation Language — slots fijos en todas las apps Dakinis.
 * Iconos: Lucide (ver @dakinis/shared-icons).
 */

export const HUB_NAV_SLOTS = {
  home: {
    id: "home",
    label: "Inicio",
    icon: "home",
    route: "/",
    order: 0,
  },
  search: {
    id: "search",
    label: "Buscar",
    icon: "search",
    shortcut: "Ctrl+K",
    macShortcut: "Cmd+K",
    order: 1,
    opensCommandPalette: true,
  },
  notifications: {
    id: "notifications",
    label: "Notificaciones",
    icon: "bell",
    route: "/notifications",
    order: 2,
  },
  profile: {
    id: "profile",
    label: "Perfil",
    icon: "user",
    route: "/profile",
    order: 3,
  },
  help: {
    id: "help",
    label: "Ayuda",
    icon: "help-circle",
    route: "/help",
    order: 4,
  },
};

/** Orden canónico para chrome superior o rail derecho. */
export const HUB_NAV_ORDER = Object.values(HUB_NAV_SLOTS).sort((a, b) => a.order - b.order);

/** Atajo global command palette. */
export const COMMAND_PALETTE_SHORTCUT = {
  key: "k",
  ctrl: true,
  meta: true,
};
