import { Event } from "@/app/actions/events";
import { formatSafeDate, formatDateRange } from "./date-utils";

const TIMEZONE_SHORT_CODES: Record<string, string> = {
  "America/Mexico_City": "CDMX",
  "America/Bogota": "Bogotá/Lima",
  "America/New_York": "EST",
  "America/Argentina/Buenos_Aires": "ARG",
  "America/Santiago": "CHL",
  "Europe/Madrid": "Madrid",
};

/**
 * 🛠️ Orquestador de Verdad: Transforma un evento de BD en datos listos para el usuario/IA.
 * Esta es la ÚNICA fuente de verdad para la visualización.
 */
export function transformEventForUI(event: Event) {
  const isFutureEvent = new Date(event.start_date).getFullYear() === 2099;
  const isOnline = 
    event.flag === "WEB" || 
    !!event.is_virtual || 
    event.categories?.slug === "online" || 
    event.categories?.slug === "eventos-en-linea" ||
    event.categories?.parent_category?.name === "Eventos en linea" ||
    event.categories?.parent_category?.name === "Eventos en línea";

  const categoryName = event.categories?.parent_category ? event.categories.parent_category.name : (event.categories?.name || "General");
  const subcategoryName = event.categories?.parent_category ? event.categories.name : null;

  let displayTime = !event.time || event.time.toLowerCase().includes('confirmar') 
    ? "Por confirmar" 
    : event.time;
    
  if (displayTime !== "Por confirmar" && event.timezone && event.timezone !== "none") {
    const shortCode = TIMEZONE_SHORT_CODES[event.timezone] || event.timezone;
    displayTime = `${displayTime} (${shortCode})`;
  }

  const tagsList = event.event_tags?.map(et => et.tags).filter(Boolean) || [];
  const isClosedEvent = event.initial_status === 'pending';
  // Si es Cerrado, NUNCA es 'pago' tradicional. Si es Abierto, NUNCA es 'pago_cupo'.
  const isPaid = !isClosedEvent && tagsList.some(tag => tag.slug === 'pago');
  const isPagoCupo = isClosedEvent && tagsList.some(tag => tag.slug === 'pago_cupo');
  
  // Extraer configuración de Pago con cupo (si existe en paid_links)
  const pagoCupoConfig = (event.paid_links || []).find((l: any) => l.type === 'pago_cupo_config') || null;

  return {
    category: categoryName,
    subcategory: subcategoryName,
    title: event.title,
    city: isOnline ? "Evento" : event.city,
    country: isOnline ? "Online" : event.country,
    // Indicador de modalidad
    isOnline,
    // Fecha formateada igual que en la tarjeta (soporta fecha única o rango inicio - fin)
    displayDate: isFutureEvent 
      ? "Por confirmar" 
      : formatDateRange(event.start_date, event.end_date),
    startDate: event.start_date,
    endDate: event.end_date || null,
    // Horario
    displayTime,
    // Ubicación exacta — para eventos presenciales
    displayLocation: isOnline ? null : (event.location || null),
    // Enlace — para eventos en línea (location guarda la URL, subtitle guarda el título)
    displayLinkTitle: isOnline ? (event.subtitle || "Acceder al evento") : null,
    displayLinkUrl: isOnline ? (event.location || null) : null,
    displayLinkEnabled: isOnline ? !!event.is_virtual : false,
    // Precio
    displayPrice: (() => {
      const priceStr = typeof event.price === 'string'
        ? event.price
        : (event.price ? String(event.price) : "");
      return !priceStr || priceStr.toLowerCase().includes('sin costo') || priceStr === "0"
        ? "Evento sin costo"
        : priceStr;
    })(),
    // Duración
    displayDuration: event.duration || "Aproximadamente 2 horas",
    // Metadatos técnicos para Schema.org
    isFree: !isPaid && !isPagoCupo && (!event.price || event.price.toLowerCase().includes('sin costo') || event.price === "0"),
    isoDuration: (!event.duration || event.duration === "Por confirmar") ? null : (event.duration.includes('2') ? 'PT2H' : 'PT1H'),
    performer: "HyenUk Chu",
    // Tags y Redirección
    tags: tagsList,
    isPaid,
    isPagoCupo,
    pagoCupoConfig: isPagoCupo ? pagoCupoConfig : null,
    externalUrl: event.external_url || null,
    externalButtonText: event.external_button_text || "Adquirir entrada",
    paidLinks: event.paid_links || [],
    description: event.description || null,
    infoUrl: event.info_url || null
  };
}
