"use client";

import { Event } from "@/app/actions/events";

interface EventJsonLdProps {
  events: Event[];
}

export function EventJsonLd({ events }: EventJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventoschu.vercel.app';

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": events.map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "startDate": event.start_date,
        "location": {
          "@type": "Place",
          "name": event.city,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": event.city,
            "addressCountry": event.country
          }
        },
        "description": `Evento presencial de HyenUk Chu en ${event.city}. Únete al Club de Inversionistas.`,
        "url": baseUrl,
        "image": `${baseUrl}/cdi-favicon.png`, // Imagen por defecto
        "performer": {
          "@type": "Person",
          "name": "HyenUk Chu"
        },
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
