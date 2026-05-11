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

/**
 * 🏠 PÁGINA PRINCIPAL
 * Envía el Layout inmediatamente (TTFB ultrarrápido) y hace stream del contenido.
 */
export default function Page() {
  return (
    <Suspense fallback={<HomeSkeletonLoader />}>
      <HomeDataWrapper />
    </Suspense>
  );
}

/**
 * 🦴 ESQUELETO DE CARGA
 * Mantiene la estructura visual mientras llegan los datos.
 */
function HomeSkeletonLoader() {
  return (
    <div className="step-1 space-y-8 py-8 md:py-12 antialiased">
      {/* ── Sección Hero Skeleton ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center justify-center w-full">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-neutral-100 rounded-full animate-pulse border border-neutral-200">
            <div className="w-2 h-2 bg-neutral-300 rounded-full" />
            <div className="w-56 h-5 bg-neutral-200 rounded" />
          </div>
        </div>

        <h1 className="flex flex-col items-center justify-center">
          <span className="sr-only">Calendario de eventos HyenUk Chu</span>
          <p className="sr-only">
            Bienvenido al Calendario de eventos HyenUk Chu. Aquí podrás encontrar y registrarte a todas las giras, talleres presenciales, y reuniones exclusivas del Club de Inversionistas. Consulta las fechas, disponibilidad y asegura tu cupo en nuestra comunidad.
          </p>
          <div className="w-48 sm:w-64 lg:w-96 h-[70px] sm:h-[100px] lg:h-[150px] bg-neutral-100 rounded-3xl animate-pulse" />
          <div className="w-64 sm:w-96 lg:w-[500px] h-10 sm:h-16 lg:h-24 bg-neutral-100 rounded-2xl animate-pulse -mt-2 sm:-mt-4 lg:-mt-6" />
        </h1>

        {/* Descripción */}
        <div className="flex flex-col items-center gap-2 max-w-3xl mx-auto">
          <div className="w-3/4 h-6 bg-neutral-100 rounded-lg animate-pulse" />
          <div className="w-1/2 h-6 bg-neutral-100 rounded-lg animate-pulse" />
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-6 pt-6">
          <div className="w-48 h-14 bg-neutral-100 rounded-2xl animate-pulse" />
          <div className="w-64 h-5 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>

      {/* ── Contenido principal Skeleton ─────────────────────────────────── */}
      <div className="pt-[140px]">
        <div className="flex flex-col">
          {/* Categorías */}
          <div className="relative z-30 mb-2">
            <div className="flex gap-3 overflow-hidden px-5 justify-center md:justify-start">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-32 bg-neutral-100 rounded-xl animate-pulse shrink-0" />
              ))}
            </div>
          </div>

          {/* Meses */}
          <div className="relative z-20 mt-4 mb-[-1px]">
            <div className="flex gap-4 overflow-hidden px-5 justify-center md:justify-start">
              <div className="h-14 w-40 bg-white border border-neutral-200 rounded-t-2xl animate-pulse shrink-0" />
              <div className="h-14 w-40 bg-neutral-50 border border-neutral-100 rounded-t-2xl animate-pulse shrink-0" />
            </div>
          </div>

          {/* Sección de Eventos */}
          <div className="events-section relative z-10 bg-[#F5F6F9] rounded-[48px] rounded-tl-none rounded-tr-none md:rounded-tr-[48px] p-10 md:p-16 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-16">
            <EventsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
