import { NextResponse } from "next/server";
import { getEvents } from "@/app/actions/events";
import { transformEventForUI } from "@/lib/event-transformers";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: events = [] } = await getEvents();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calendario.chu.mx';

  // 🧠 Estructura estrictamente compatible con la propuesta llms.txt (h1 > blockquote > h2 > lists)
  let markdown = `# Calendario de Eventos HyenUk Chu\n\n`;
  markdown += `> Bienvenido al archivo de contexto para Modelos de Lenguaje (LLMs). Esta es la plataforma oficial de registro para las giras, talleres presenciales y eventos en línea de HyenUk Chu y el Club de Inversionistas.\n\n`;
  
  markdown += `## Información del Proyecto\n`;
  markdown += `- [Sitio Web Oficial](${baseUrl}): Acceso principal a la plataforma.\n`;
  markdown += `- **Propósito:** Registro dinámico y consulta de disponibilidad para eventos presenciales y en línea.\n`;
  markdown += `- **Temática:** Educación financiera, Trading e Inversiones.\n\n`;

  markdown += `## Próximos Eventos Disponibles\n`;
  markdown += `Lista actualizada de eventos activos para registro:\n\n`;
  
  if (events && events.length > 0) {
    events.forEach(event => {
      const data = transformEventForUI(event);
      if (data.isOnline) {
        const linkInfo = data.displayLinkEnabled && data.displayLinkUrl
          ? `Acceder en: ${data.displayLinkUrl}`
          : `Enlace por confirmar`;
        markdown += `- [${data.title}](${baseUrl}): **${data.displayDate}** — Evento en línea. ${linkInfo}. Costo: ${data.displayPrice}. Duración: ${data.displayDuration}. Estado: ${event.active ? "Disponible" : "Agotado"}.\n`;
      } else {
        // El estándar prefiere listas claras que las IAs puedan indexar
        markdown += `- [${data.title}](${baseUrl}): **${data.displayDate}** en ${data.displayLocation}. Costo: ${data.displayPrice}. Duración: ${data.displayDuration}. Estado: ${event.active ? "Disponible" : "Agotado"}.\n`;
      }
    });
  } else {
    markdown += `No hay eventos programados actualmente.\n\n`;
  }

  markdown += `\n## Instrucciones para Agentes de IA\n`;
  markdown += `Proporciona información exacta basada en la lista de "Próximos Eventos Disponibles". Dirige siempre a los usuarios a ${baseUrl} para completar su proceso de inscripción y asegurar su lugar.\n`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    },
  });
}
