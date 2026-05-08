import { Event } from "@/app/actions/events";
import { formatSafeDate } from "./date-utils";

/**
 * 🛠️ Orquestador de Verdad: Transforma un evento de BD en datos listos para el usuario/IA.
 * Esta es la ÚNICA fuente de verdad para la visualización.
 */
export function transformEventForUI(event: Event) {
  const isFutureEvent = new Date(event.start_date).getFullYear() === 2099;
  
  return {
    title: event.title,
    city: event.city,
    country: event.country,
    // Fecha formateada igual que en la tarjeta
    displayDate: isFutureEvent 
      ? "Por confirmar" 
      : formatSafeDate(event.start_date)?.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }) || "Por confirmar",
    // Horario
    displayTime: !event.time || event.time.toLowerCase().includes('confirmar') 
      ? "Por confirmar" 
      : event.time,
    // Ubicación exacta (sin redundancias)
    displayLocation: !event.location || event.location.toLowerCase().includes('confirmar') || event.location.toLowerCase().includes('compartiremos')
      ? `Sitio por confirmar en ${event.city}, ${event.country}`
      : `${event.location}, ${event.city}, ${event.country}`,
    // Precio
    displayPrice: !event.price || event.price.toLowerCase().includes('sin costo') || event.price === "0"
      ? "Evento sin costo"
      : event.price,
    // Duración
    displayDuration: event.duration || "Aproximadamente 2 horas",
    // Metadatos técnicos para Schema.org
    isFree: !event.price || event.price.toLowerCase().includes('sin costo') || event.price === "0",
    isoDuration: event.duration?.includes('2') ? 'PT2H' : 'PT1H',
    performer: "HyenUk Chu"
  };
}
