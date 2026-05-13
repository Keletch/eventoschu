"use client";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getFlagCode, FlagIcon } from "@/components/home/utils/flag-helpers";
import { STATUS_CONFIGS, RegistrationStatus } from "@/components/home/utils/home-constants";

interface CitySelectorProps {
  events: any[];
  eventStatuses: Record<string, string>;
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  isLoadingEvents: boolean;
}

export function CitySelector({
  events,
  eventStatuses,
  selectedCityId,
  setSelectedCityId,
  isLoadingEvents,
}: CitySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Solo mostrar ciudades con un registro asociado
  const registeredEvents = events.filter((e) =>
    Object.keys(eventStatuses).includes(e.id)
  );

  // Animación de entrada escalonada para los botones
  useGSAP(() => {
    if (!isLoadingEvents && registeredEvents.length > 0) {
      gsap.fromTo(".event-select-btn", 
        { opacity: 0, scale: 0.8, y: 20 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.1, 
          ease: "back.out(1.7)",
          clearProps: "all"
        }
      );
    }
  }, { scope: containerRef, dependencies: [isLoadingEvents, registeredEvents.length] });

  const handleCityClick = (id: string) => {
    if (selectedCityId === id) return;
    // Animación GSAP al cambiar de ciudad
    gsap.to(".city-status-badge, .user-data-container", {
      opacity: 0,
      y: 10,
      duration: 0.2,
      onComplete: () => {
        setSelectedCityId(id);
        gsap.to(".city-status-badge, .user-data-container", {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.7)",
        });
      },
    });
  };

  return (
    <div ref={containerRef} className="max-w-[1372px] mx-auto bg-muted dark:bg-muted/50 rounded-[32px] py-4 md:py-6 px-6 md:px-8 flex flex-col items-center justify-center gap-6 border border-border">
      <div className="text-[17px] md:text-[20px] font-medium text-muted-foreground text-center">
        Consulta aquí tus registros para ver más detalles:
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 min-h-[56px]">
        {isLoadingEvents ? (
          <>
            <Skeleton className="h-[52px] w-32 md:w-40 rounded-2xl" />
            <Skeleton className="h-[52px] w-32 md:w-40 rounded-2xl" />
            <Skeleton className="h-[52px] w-32 md:w-40 rounded-2xl" />
          </>
        ) : (
          registeredEvents.map((e) => {
            const isActive = selectedCityId === e.id;
            const statusKey = (eventStatuses[e.id] || "pending") as RegistrationStatus;
            const config = STATUS_CONFIGS[statusKey];

            return (
              <button
                key={e.id}
                onClick={() => handleCityClick(e.id)}
                className={cn(
                  "event-select-btn group flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all duration-300 border-2 cursor-pointer",
                  "transform backface-visibility-hidden antialiased",
                  isActive
                    ? `bg-card border-current ${config.text} shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] scale-[1.03] z-10`
                    : "bg-transparent border-border/50 hover:bg-accent hover:text-foreground text-muted-foreground"
                )}
                style={isActive ? { borderColor: statusKey === 'confirmed' ? '#0F9700' : undefined, color: statusKey === 'confirmed' ? '#0F9700' : undefined } : {}}
              >
                <FlagIcon
                  code={getFlagCode(e.city)}
                  className="size-5 rounded-[4px] shadow-sm shrink-0"
                />
                <span className={cn(
                  "font-bold text-base md:text-lg leading-tight max-w-[200px] md:max-w-[240px] text-left",
                  isActive ? "" : "text-muted-foreground/70"
                )}>
                  {e.title}
                </span>
                {/* Dot de estado */}
                <div
                  className={cn(
                    "size-2 rounded-full shadow-sm shrink-0",
                    config.dot
                  )}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
