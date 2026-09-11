
import { Event } from "@/app/actions/events";
import { transformEventForUI } from "@/lib/event-transformers";

interface EventJsonLdProps {
  events: Event[];
}

export function EventJsonLd({ events }: EventJsonLdProps) {
  const baseUrl = 'https://calendario.chu.mx';

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": events.map((event, index) => {
      const data = transformEventForUI(event);
      
      // Combinar fecha y hora para el formato ISO
      const hasTime = data.displayTime !== "Por confirmar";
      const startDateTime = hasTime 
        ? `${event.start_date.split('T')[0]}T${data.displayTime}:00`
        : event.start_date;

      const durationText = data.displayDuration && data.displayDuration !== "Por confirmar"
        ? `${data.displayDuration} de `
        : "";

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": data.title,
          "description": data.isOnline
            ? `Únete a ${data.performer} en este evento en línea. ${durationText}aprendizaje con el Club de Inversionistas.`
            : `Únete a ${data.performer} en este evento presencial en ${data.city}. ${durationText}aprendizaje con el Club de Inversionistas.`,
          "startDate": startDateTime,
          ...(event.end_date ? { "endDate": event.end_date.split('T')[0] } : {}),
          ...(data.isoDuration ? { "duration": data.isoDuration } : {}),
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": data.isOnline 
            ? "https://schema.org/OnlineEventAttendanceMode" 
            : "https://schema.org/OfflineEventAttendanceMode",
          "image": `${baseUrl}/favicon.ico`,
          "location": data.isOnline
            ? {
                "@type": "VirtualLocation",
                "url": data.displayLinkEnabled && data.displayLinkUrl ? data.displayLinkUrl : baseUrl
              }
            : {
                "@type": "Place",
                "name": data.displayLocation,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": data.city,
                  "addressCountry": data.country
                }
              },
          "offers": {
            "@type": "Offer",
            "price": (() => {
              const priceStr = typeof event.price === 'string'
                ? event.price
                : (event.price ? String(event.price) : "");
              return data.isFree ? "0" : (priceStr ? (priceStr.replace(/[^0-9.]/g, '') || "0") : "0");
            })(),
            "priceCurrency": (() => {
              const priceStr = typeof event.price === 'string'
                ? event.price
                : (event.price ? String(event.price) : "");
              return (priceStr && priceStr.toUpperCase().includes('MXN')) ? 'MXN' : 'USD';
            })(),
            "availability": event.active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": (data.isPaid && data.externalUrl) ? data.externalUrl : baseUrl,
            "description": data.displayPrice
          },
          "performer": {
            "@type": "Person",
            "name": data.performer,
            "jobTitle": "Inversionista y Mentor",
            "url": "https://chu.mx"
          }
        }
      };
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
