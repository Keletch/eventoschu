
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

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": data.title,
          "description": `Únete a ${data.performer} en este evento presencial en ${data.city}. ${data.displayDuration} de aprendizaje con el Club de Inversionistas.`,
          "startDate": startDateTime,
          "duration": data.isoDuration,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "image": `${baseUrl}/favicon.ico`,
          "location": {
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
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": baseUrl,
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
