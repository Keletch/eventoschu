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
  // Labels
  statusLabels: {
    confirmed: string;
    pending: string;
    cancelled: string;
  };
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
    statusLabels: {
      confirmed: "Registro exitoso",
      pending: "Validando cupo",
      cancelled: "Registro cancelado"
    },
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
    statusLabels: {
      confirmed: "Registro exitoso",
      pending: "Validando cupo",
      cancelled: "Registro cancelado"
    },
    hero: {
      title: "¡Ya estás\ndentro!",
      description: "Te notificaremos por correo todos los detalles"
    }
  }
};

/**
 * 🛠️ Helper para obtener la configuración de un evento
 */
export function getEventUIConfig(event: any): EventUIConfig {
  // Lógica de mapeo: confirmed -> OPEN, pending -> CLOSED
  // (Basado en la lógica actual del dashboard)
  const type: EventType = event?.initial_status === 'confirmed' || !event?.initial_status ? 'OPEN' : 'CLOSED';
  return CONFIGS[type];
}
