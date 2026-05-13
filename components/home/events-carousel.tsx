"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/events/event-card";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ANIM_CONFIG, ANIM_SELECTORS } from "@/lib/animations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { transformEventForUI } from "@/lib/event-transformers";

// Skeleton de carga de tarjeta de evento
function EventSkeleton() {
  return (
    <div className="h-[420px] bg-card/50 border border-border/50 rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm">
      <div className="space-y-8 relative">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-2xl" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-2/3 rounded-xl" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-5 w-24 rounded-md opacity-60" />
          <Skeleton className="h-5 w-24 rounded-md opacity-60" />
        </div>
      </div>

      <Skeleton className="h-14 w-full rounded-2xl mt-auto relative" />
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Filtrar eventos del mes activo
  const monthEvents = events.filter((e: any) => {
    const d = new Date(e.start_date);
    let label = "";
    if (d.getFullYear() === 2099) label = "Eventos Futuros";
    else {
      const m = d.toLocaleDateString("es-ES", { month: "long" });
      label = m.charAt(0).toUpperCase() + m.slice(1);
    }
    return label === activeMonth;
  });

  // Verificar límites de scroll
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [monthEvents]);

  const onScrollInternal = (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll(e);
    checkScroll();
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -450 : 450;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Animaciones
  useGSAP(() => {
    if (monthEvents.length > 0) {
      const tl = gsap.timeline();

      // Animación de entrada
      tl.fromTo(ANIM_SELECTORS.card,
        { opacity: 0, x: 40, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        }
      );

      // Micro-nudge inicial para sugerir scroll (solo la primera vez)
      if (isFirstRender.current && monthEvents.length > 1) {
        isFirstRender.current = false;
        tl.to(scrollContainerRef.current, {
          scrollLeft: 40,
          duration: 0.4,
          delay: 0.2,
          ease: "power2.inOut"
        }).to(scrollContainerRef.current, {
          scrollLeft: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)"
        });
      }
    }
  }, { dependencies: [activeMonth, events.length], scope: cardsRef });

  return (
    <div className="space-y-2">
      <h2 className="text-[20px] font-medium text-foreground leading-tight pl-2 md:pl-6">
        Elige el país en el que te gustaría asistir en la reunión presencial
      </h2>

      {isLoadingEvents ? (
        <div className="flex gap-8 overflow-hidden pb-4 min-h-[350px] md:min-h-[350px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[290px] md:min-w-[360px]">
              <EventSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group/carousel">
          {/* Fading Edges Discretos */}
          <div className={cn(
            "absolute left-[-16px] top-0 bottom-0 w-12 z-20 bg-gradient-to-r from-muted to-transparent pointer-events-none transition-opacity duration-500",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )} />
          <div className={cn(
            "absolute right-[-16px] top-0 bottom-0 w-12 z-20 bg-gradient-to-l from-muted to-transparent pointer-events-none transition-opacity duration-500",
            canScrollRight ? "opacity-100" : "opacity-0"
          )} />

          {/* Carrusel de tarjetas */}
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto py-24 px-20 -mx-20 -my-24 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hide-scrollbar min-h-[350px] md:min-h-[350px]"
            onScroll={onScrollInternal}
          >
            <div ref={cardsRef} className="flex gap-8 min-h-[350px] md:min-h-[350px]">
              {monthEvents.map((event: any) => {
                const data = transformEventForUI(event);
                return (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    className="event-card-wrapper min-w-[290px] md:min-w-[360px] snap-center transform backface-visibility-hidden"
                  >
                    <EventCard
                      id={event.id}
                      title={data.title}
                      city={data.city}
                      country={data.country}
                      flag={event.flag}
                      date={data.displayDate}
                      time={data.displayTime}
                      duration={data.displayDuration}
                      location={data.displayLocation || ""}
                      price={data.displayPrice}
                      selected={selectedEvents.includes(event.id)}
                      confirmedCount={eventCounts[event.id] || 0}
                      capacity={event.capacity || 25}
                      initialStatus={event.initial_status}
                      onSelect={handleSelectEvent}
                      bgClass={event.bg_class}
                      isVirtual={data.isOnline}
                      linkTitle={data.displayLinkTitle}
                      linkUrl={data.displayLinkUrl}
                      linkEnabled={data.displayLinkEnabled}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barra de progreso + Controles de Navegación (NUEVO POSICIONAMIENTO) */}
          <div className="mt-8 flex flex-col md:flex-row items-center gap-6 px-4">
            <div className="flex items-center gap-4 flex-1 w-full">
              <button
                onClick={() => scroll('left')}
                className={cn(
                  "size-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-all duration-300",
                  "hover:bg-accent hover:scale-105 active:scale-95 text-muted-foreground",
                  !canScrollLeft && "opacity-30 cursor-not-allowed grayscale"
                )}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="h-[2px] flex-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="scroll-progress-fill h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: '0%' }}
                />
              </div>

              <button
                onClick={() => scroll('right')}
                className={cn(
                  "size-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-all duration-300",
                  "hover:bg-accent hover:scale-105 active:scale-95 text-muted-foreground",
                  !canScrollRight && "opacity-30 cursor-not-allowed grayscale"
                )}
                disabled={!canScrollRight}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="flex gap-2.5 items-center bg-muted dark:bg-muted/50 px-4 py-2 rounded-full border border-border/50">
              {availableMonths.map((month: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleMonthChange(month)}
                  className={cn(
                    "size-2 rounded-full transition-all duration-300 hover:bg-primary/50 cursor-pointer",
                    activeMonth === month
                      ? "bg-primary scale-125 shadow-[0_0_8px_rgba(49,84,220,0.4)]"
                      : "bg-border scale-100"
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
