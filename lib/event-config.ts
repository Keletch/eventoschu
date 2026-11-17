/**
 * 🧠 Event Orchestrator Config
 * Centraliza toda la lógica de negocio y visual según el tipo de evento.
 */

export type EventType = 'OPEN' | 'CLOSED';

export interface EventUIConfig {
  type: EventType;
  // Comportamiento de Cupo
  showFullCapacityOverlay: boolean;
  allowOverCapacityRegistration: boolean;
  // Toasters
  registrationToast: {
    title: (name: string) => string;
    description: string;
  };
  showSyncConfirmationToast: boolean;
  // Copy
  hero: {
    title: string;
    description: string;
  };
}

const CONFIGS: Record<EventType, EventUIConfig> = {
  OPEN: {
    type: 'OPEN',
    showFullCapacityOverlay: false,
    allowOverCapacityRegistration: true,
    registrationToast: {
      title: (name) => `¡Buenas noticias, ${name}!`,
      description: "Has sido registrado a la lista de espera."
    },
    showSyncConfirmationToast: false,
    hero: {
      title: "¡Ya estás\ndentro!",
      description: "Te notificaremos por correo todos los detalles"
    }
  },
  CLOSED: {
    type: 'CLOSED',
    showFullCapacityOverlay: true,
    allowOverCapacityRegistration: false,
    registrationToast: {
      title: () => "¡Bienvenido a bordo!",
      description: "Tu registro se ha procesado correctamente."
    },
    showSyncConfirmationToast: true,
    hero: {
      title: "¡Ya estás\ndentro!",
      description: "Te notificaremos por correo todos los detalles"
    }
  }
};

export interface RegistrationStatusCopy {
  /** Texto corto de la insignia (barra superior y tarjeta) */
  badge: string;
  /** Explicación bajo la insignia de la tarjeta */
  description: string;
  /** Título grande del paso 2 */
  title: string;
  heroDescription: string;
}

/**
 * 🎉 ÚNICA fuente de los textos de estado del paso 2 (insignia, tarjeta y título).
 * Dependen del estado Y del tipo de evento: "en espera" no significa lo mismo en un evento
 * con cupo (lista de espera automática), con aprobación manual (en revisión) o de pago con cupo (falta pagar).
 */
export function getRegistrationStatusCopy(
  status: string,
  event: { isClosed?: boolean; isPagoCupo?: boolean; isFull?: boolean } = {}
): RegistrationStatusCopy {
  if (status === "confirmed") {
    return {
      badge: "Confirmado",
      description: "Tu lugar está asegurado. Te enviaremos los detalles por correo.",
      title: "¡Ya estás\ndentro!",
      heroDescription: "Te notificaremos por correo todos los detalles",
    };
  }
  if (status === "cancelled") {
    return {
      badge: "Cancelado",
      description: "Tu registro para este evento fue cancelado.",
      title: "Tu registro fue\ncancelado",
      heroDescription: "Si crees que es un error, escríbenos desde el contacto de soporte.",
    };
  }
  // Pendiente
  if (event.isPagoCupo && !event.isFull) {
    return {
      badge: "Pago pendiente",
      description: "Completa tu pago para asegurar tu lugar. Se confirma en automático al pagar.",
      title: "Te falta\nun paso",
      heroDescription: "Completa tu pago para asegurar tu lugar.",
    };
  }
  if (event.isClosed && !event.isPagoCupo) {
    return {
      badge: "En revisión",
      description: "Estamos revisando tu solicitud, te avisaremos pronto.",
      title: "Tu solicitud está\nen revisión",
      heroDescription: "Te avisaremos por correo cuando confirmemos tu lugar.",
    };
  }
  // Evento con cupo (lista de espera automática) o pago con cupo ya lleno
  return {
    badge: "Lista de espera",
    description: event.isPagoCupo
      ? "Los lugares se agotaron. Te avisaremos si se libera uno."
      : "El cupo se llenó. Te avisaremos por correo si se libera un lugar.",
    title: "Estás en la\nlista de espera",
    heroDescription: "Te avisaremos por correo en cuanto se libere un lugar para ti.",
  };
}

/**
 * 🛠️ Helper para obtener la configuración de un evento
 */
export function getEventUIConfig(event: any): EventUIConfig {
  const type: EventType = event?.initial_status === 'confirmed' || !event?.initial_status ? 'OPEN' : 'CLOSED';
  const baseConfig = CONFIGS[type];

  // Si es un evento cerrado con la etiqueta de pago con cupo, personalizar la etiqueta de pendiente
  const tags = event?.event_tags?.map((et: any) => et.tags).filter(Boolean) || [];
  const isPagoCupo = type === 'CLOSED' && tags.some((t: any) => t.slug === 'pago_cupo');

  if (isPagoCupo) {
    return {
      ...baseConfig,
      showFullCapacityOverlay: false,
      allowOverCapacityRegistration: true,
    };
  }

  return baseConfig;
}
