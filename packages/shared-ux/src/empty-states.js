/**
 * Estados vacíos por producto — título positivo + CTA.
 * Usar con ilustración de @dakinis/shared-illustrations.
 */

/** @typedef {{ title: string; hint: string; primaryAction?: string; secondaryAction?: string; illustration?: string }} EmptyState */

export const DAKINIS_EMPTY_STATES = {
  lifeflow: {
    noMovements: {
      title: "Empieza tu historial financiero",
      hint: "Sube tu primera nómina o registra un movimiento manual.",
      primaryAction: "Subir nómina",
      secondaryAction: "Añadir movimiento",
      illustration: "empty-wallet",
    },
    noGoals: {
      title: "Define tu primer objetivo",
      hint: "Un objetivo claro hace que el Coach pueda ayudarte mejor.",
      primaryAction: "Crear objetivo",
      illustration: "empty-goals",
    },
    noScenarios: {
      title: "Explora tu futuro",
      hint: "Crea un escenario «¿Qué pasa si…?» en menos de un minuto.",
      primaryAction: "Nuevo escenario",
      illustration: "empty-chart",
    },
  },
  core: {
    noCustomers: {
      title: "Crea tu primer cliente",
      hint: "Importa un Excel, añade uno manualmente o invita a un compañero.",
      primaryAction: "Nuevo cliente",
      secondaryAction: "Importar Excel",
      illustration: "empty-crm",
    },
    noOrders: {
      title: "Aún no hay pedidos hoy",
      hint: "Cuando llegue el primero, lo verás aquí al instante.",
      primaryAction: "Crear pedido",
      illustration: "empty-inbox",
    },
    noStock: {
      title: "Configura tu inventario",
      hint: "Añade productos para recibir alertas de stock y caducidad.",
      primaryAction: "Añadir producto",
      illustration: "empty-box",
    },
  },
  akoenet: {
    noChannels: {
      title: "Crea tu primer servidor",
      hint: "Organiza comunidades, canales de voz y normas en un solo lugar.",
      primaryAction: "Crear servidor",
      illustration: "empty-community",
    },
    noMessages: {
      title: "Este canal está en silencio",
      hint: "Sé el primero en escribir o comparte una invitación.",
      primaryAction: "Escribir mensaje",
      illustration: "empty-chat",
    },
  },
  streamautomator: {
    noPosts: {
      title: "Programa tu primera publicación",
      hint: "Conecta una plataforma y planifica contenido desde el calendario.",
      primaryAction: "Nueva publicación",
      illustration: "empty-calendar",
    },
  },
  hub: {
    noWidgets: {
      title: "Personaliza tu Hub",
      hint: "Añade widgets de LifeFlow, Core, Stream o AkoeNet.",
      primaryAction: "Añadir widget",
      illustration: "empty-dashboard",
    },
    noNotifications: {
      title: "Todo al día",
      hint: "Cuando haya novedades en tus apps, aparecerán aquí.",
      illustration: "empty-inbox",
    },
  },
  generic: {
    noData: {
      title: "Aún no hay datos",
      hint: "Cuando empieces a usar la app, verás el resumen aquí.",
      illustration: "empty-generic",
    },
    noResults: {
      title: "Sin resultados",
      hint: "Prueba con otros filtros o términos de búsqueda.",
      primaryAction: "Restablecer filtros",
      illustration: "empty-search",
    },
    offline: {
      title: "Sin conexión",
      hint: "Comprueba tu red e inténtalo de nuevo.",
      primaryAction: "Reintentar",
      illustration: "offline",
    },
    error: {
      title: "No hemos podido completar esta acción",
      hint: "Ha ocurrido un problema temporal.",
      primaryAction: "Reintentar",
      illustration: "error",
    },
  },
};

/**
 * @param {string} product
 * @param {string} key
 * @returns {EmptyState | null}
 */
export function getEmptyState(product, key) {
  const bucket = DAKINIS_EMPTY_STATES[product];
  if (bucket?.[key]) return bucket[key];
  return DAKINIS_EMPTY_STATES.generic[key] || null;
}
