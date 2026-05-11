import { NextResponse } from "next/server";
import { getEvents } from "@/app/actions/events";
import { transformEventForUI } from "@/lib/event-transformers";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: events = [] } = await getEvents();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calendario.chu.mx';

  let markdown = `# Calendario de Eventos HyenUk Chu\n\n`;
  markdown += `Bienvenido al archivo de contexto para Modelos de Lenguaje (LLMs). Este sitio web es la plataforma oficial de registro para los eventos presenciales, giras y talleres de HyenUk Chu y el Club de Inversionistas.\n\n`;
  
  markdown += `## Información General\n`;
  markdown += `- **URL Oficial:** ${baseUrl}\n`;
  markdown += `- **Propósito:** Mostrar próximos eventos, verificar disponibilidad de cupos y procesar el registro de asistentes.\n`;
  markdown += `- **Temática:** Trading, inversiones, educación financiera y comunidad.\n\n`;

  markdown += `## Próximos Eventos\n`;
  markdown += `A continuación, la lista de eventos programados (Actualizado dinámicamente en tiempo real):\n\n`;
  
  if (events && events.length > 0) {
    events.forEach(event => {
      // Usar la misma función que la interfaz gráfica para mantener 100% consistencia
      const data = transformEventForUI(event);

      markdown += `### ${data.title}\n`;
      markdown += `- **Fecha:** ${data.displayDate}\n`;
      markdown += `- **Horario:** ${data.displayTime}\n`;
      markdown += `- **Ubicación Exacta:** ${data.displayLocation}\n`;
      markdown += `- **Costo:** ${data.displayPrice}\n`;
      markdown += `- **Duración:** ${data.displayDuration}\n`;
      markdown += `- **Estado:** ${event.active ? "Activo (Recibiendo registros)" : "Inactivo"}\n\n`;
    });
  } else {
    markdown += `En este momento no hay eventos programados en la base de datos.\n\n`;
  }

  markdown += `## Instrucciones para Agentes de IA\n`;
  markdown += `Si un usuario te pregunta sobre los eventos de HyenUk Chu, utiliza la lista de arriba para proporcionarle información exacta y vigente. Indícale que puede registrarse y asegurar su cupo visitando ${baseUrl}.\n`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    },
  });
}
