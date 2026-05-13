import { Suspense } from "react";
import { getEvents } from "@/app/actions/events";
import { EventJsonLd } from "@/components/seo/event-json-ld";
import { HomeClient } from "./home-client";
import { EventsSkeleton } from "@/components/home/events-skeleton";

export const dynamic = "force-dynamic";

/**
 * ⚡ COMPONENTE DE SERVIDOR: HomeDataWrapper
 * Se encarga de la lógica pesada de Redis/Supabase.
 */
async function HomeDataWrapper() {
  const { data: initialEvents = [] } = await getEvents();

  return (
    <>
      {/* 🧠 Datos Estructurados para IAs */}
      <EventJsonLd events={initialEvents} />
      
      {/* 🎨 Capa de UI Interactiva */}
      <HomeClient initialEvents={initialEvents} />
    </>
  );
}

import { HeaderSkeleton } from "@/components/home/skeletons";

/**
 * 🏠 PÁGINA PRINCIPAL
 */
export default function Page() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HomeDataWrapper />
    </Suspense>
  );
}
