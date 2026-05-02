"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/event-card";
import { cn } from "@/lib/utils";

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
  scrollProgress: number;
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
  scrollProgress,
  handleScroll,
  availableMonths,
  handleMonthChange,
  formatSafeDate,
}: EventsCarouselProps) {
  // Filtrar eventos del mes activo
  const monthEvents = events.filter((e) => {
    const m = new Date(e.start_date).toLocaleDateString("es-ES", { month: "long" });
    return m.charAt(0).toUpperCase() + m.slice(1) === activeMonth;
  });

  return (
    <div className="space-y-12">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-950">
        Elige el país en el que te gustaría asistir
      </h2>

      {isLoadingEvents ? (
        /* Estado de carga */
        <div className="flex gap-8 overflow-hidden pb-4">
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
            className="flex gap-8 overflow-x-auto overflow-y-hidden py-10 px-4 -mx-4 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hide-scrollbar"
            onScroll={handleScroll}
          >
            {monthEvents.map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className="event-card-wrapper min-w-[320px] md:min-w-[420px] snap-center"
              >
                <EventCard
                  id={event.id}
                  city={event.city}
                  country={event.country}
                  flag={event.flag}
                  date={
                    formatSafeDate(event.start_date)?.toLocaleDateString("es-ES", {
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
                  onSelect={handleSelectEvent}
                />
              </div>
            ))}
          </div>

          {/* Barra de progreso + dots de paginación */}
          <div className="mt-8 flex items-center gap-4 px-4">
            <div className="h-[2px] flex-1 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3154DC] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${scrollProgress}%` }}
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
