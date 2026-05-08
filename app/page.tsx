import { getEvents } from "@/app/actions/events";
import { EventJsonLd } from "@/components/seo/event-json-ld";
import { HomeClient } from "./home-client";

export default async function Page() {
  // 🚀 EXTRACCIÓN EN EL SERVIDOR: La IA ve los datos reales desde el primer milisegundo.
  const { data: initialEvents = [] } = await getEvents();

  return (
    <>
      {/* 🧠 Datos Estructurados para IAs (Inyectados en el servidor) */}
      <EventJsonLd events={initialEvents} />
      
      {/* 🎨 Capa de UI Interactiva e Hidratación */}
      <HomeClient initialEvents={initialEvents} />
    </>
  );
}
