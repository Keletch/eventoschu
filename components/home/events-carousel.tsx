"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/event-card";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ANIM_CONFIG, ANIM_SELECTORS } from "@/lib/animations";

// Skeleton de carga de tarjeta de evento
function EventSkeleton() {
  return (
    <div className="space-y-8 p-8 border border-neutral-200 bg-white rounded-[32px] animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-xl bg-neutral-100" />
        <Skeleton className="h-8 w-48 bg-neutral-100" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-full bg-neutral-100" />
        <Skeleton className="h-5 w-3/4 bg-neutral-100" />
        <Skeleton className="h-5 w-2/3 bg-neutral-100" />
      </div>
    </div>
  );
}

interface EventsCarouselProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  events: any[];
  activeMonth: string;
  selectedEvents: string[];
  handleSelectEvent: (id: string) => void;
  isLoadingEvents: boolean;
  eventCounts: Record<string, number>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  availableMonths: string[];
  handleMonthChange: (month: string) => void;
  formatSafeDate: (dateStr: string) => Date | null;
}

export function EventsCarousel({
  scrollContainerRef,
  events,
  activeMonth,
  selectedEvents,
  handleSelectEvent,
  isLoadingEvents,
  eventCounts,
  handleScroll,
  availableMonths,
  handleMonthChange,
  formatSafeDate,
}: EventsCarouselProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Filtrar eventos del mes activo (Soporta 2099 como Eventos Futuros)
  const monthEvents = events.filter((e) => {
    const d = new Date(e.start_date);
    let label = "";
    if (d.getFullYear() === 2099) {
      label = "Eventos Futuros";
    } else {
      const m = d.toLocaleDateString("es-ES", { month: "long" });
      label = m.charAt(0).toUpperCase() + m.slice(1);
    }
    return label === activeMonth;
  });

  // Animación de entrada escalonada para las tarjetas
  useGSAP(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (monthEvents.length > 0) {
      gsap.fromTo(ANIM_SELECTORS.card, 
        { opacity: 0, x: ANIM_CONFIG.offset.sweep, scale: 0.98 },
        { 
          opacity: 1, 
          x: 0, 
          scale: 1,
          duration: ANIM_CONFIG.duration.fast, 
          stagger: ANIM_CONFIG.offset.stagger, 
          ease: ANIM_CONFIG.ease.out,
          overwrite: "auto",
          clearProps: "all"
        }
      );
    }
  }, { dependencies: [activeMonth, events.length], scope: cardsRef });

  return (
    <div className="space-y-12">
      <h2 className="text-2xl md:text-3xl font-normal text-black leading-tight">
        Selecciona el evento al que quieres asistir
      </h2>

      {isLoadingEvents ? (
        <div className="flex gap-8 overflow-hidden pb-4 min-h-[500px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[320px] md:min-w-[420px]">
              <EventSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group">
          {/* Carrusel de tarjetas */}
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto overflow-y-hidden py-10 px-4 -mx-4 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hide-scrollbar min-h-[500px]"
            onScroll={handleScroll}
          >
            <div ref={cardsRef} className="flex gap-8 min-h-[500px]">
              {monthEvents.map((event) => (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className="event-card-wrapper min-w-[320px] md:min-w-[420px] snap-center will-change-transform"
                >
                  <EventCard
                    id={event.id}
                    title={event.title}
                    city={event.city}
                    country={event.country}
                    flag={event.flag}
                    date={
                      new Date(event.start_date).getFullYear() === 2099
                        ? "Por confirmar"
                        : formatSafeDate(event.start_date)?.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }) || ""
                    }
                    time={event.time}
                    duration={event.duration}
                    location={event.location}
                    price={event.price}
                    bgClass={event.bg_class}
                    selected={selectedEvents.includes(event.id)}
                    confirmedCount={eventCounts[event.id] || 0}
                    capacity={event.capacity || 25}
                    isOpenMode={event.initial_status === 'confirmed'}
                    onSelect={handleSelectEvent}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Barra de progreso + dots de paginación (Restaurado) */}
          <div className="mt-8 flex items-center gap-4 px-4">
            <div className="h-[2px] flex-1 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="scroll-progress-fill h-full bg-[#3154DC] rounded-full"
                style={{ width: '0%' }}
              />
            </div>
            <div className="flex gap-2.5 items-center">
              {availableMonths.map((month, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMonthChange(month)}
                  className={cn(
                    "size-1.5 rounded-full transition-all duration-300 hover:bg-[#3154DC]/50 cursor-pointer",
                    activeMonth === month
                      ? "bg-[#3154DC] scale-125 shadow-sm"
                      : "bg-neutral-300 scale-100"
                  )}
                  aria-label={`Ir a ${month}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
