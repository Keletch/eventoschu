"use client";

import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { ANIM_CONFIG, ANIM_SELECTORS } from "@/lib/animations";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface MonthTabsProps {
  availableMonths: string[];
  activeMonth: string;
  handleMonthChange: (month: string) => void;
  events: any[];
  selectedEvents: string[];
}

export function MonthTabs({
  availableMonths,
  activeMonth,
  handleMonthChange,
  events,
  selectedEvents,
}: MonthTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [availableMonths]);

  useGSAP(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (availableMonths.length > 0) {
      gsap.fromTo(ANIM_SELECTORS.monthTab,
        { opacity: 0, force3D: false },
        { 
          opacity: 1, 
          duration: ANIM_CONFIG.duration.fast, 
          stagger: ANIM_CONFIG.offset.stagger, 
          ease: "none",
          overwrite: "auto"
        }
      );
    }
  }, { dependencies: [availableMonths], scope: containerRef });

  return (
    <div className="relative group/months">
      {/* Fading Edges Discretos */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-r from-[#F8F9FA] to-transparent pointer-events-none transition-opacity duration-500",
        canScrollLeft ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute right-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-l from-[#F8F9FA] to-transparent pointer-events-none transition-opacity duration-500",
        canScrollRight ? "opacity-100" : "opacity-0"
      )} />

      <div 
        ref={containerRef}
        onScroll={checkScroll}
        className="month-tabs flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-nowrap scroll-smooth pb-0 px-1"
      >
        {availableMonths.map((month) => {
          // Conteo de eventos seleccionados en este mes / categoría especial
          const selectedCount = events.filter((e) => {
            const d = new Date(e.start_date);
            let label = "";
            if (d.getFullYear() === 2099) label = "Eventos Futuros";
            else {
              const m = d.toLocaleDateString("es-ES", { month: "long" });
              label = m.charAt(0).toUpperCase() + m.slice(1);
            }
            return label === month && selectedEvents.includes(e.id);
          }).length;

          const isActive = activeMonth === month;
          const isFutureEvents = month === "Eventos Futuros";

          return (
            <button
              key={month}
              onClick={() => handleMonthChange(month)}
              className={cn(
                "month-tab-btn px-10 py-5 !rounded-b-none rounded-t-[32px] font-bold text-lg transition-all duration-500 relative flex items-center gap-0 shrink-0 overflow-hidden cursor-pointer whitespace-nowrap",
                isActive
                  ? isFutureEvents 
                    ? "bg-gradient-to-r from-[#0F172A] to-[#3154DC] text-white shadow-[-10px_0_20px_rgba(0,0,0,0.05)] z-10"
                    : "bg-[#3154DC] text-white shadow-[-10px_0_20px_rgba(0,0,0,0.05)] z-10"
                  : "bg-[#F1F3F9] text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              )}
            >
              <span className="relative z-10">{month}</span>

              {/* Badge de conteo animado */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-center",
                  selectedCount > 0 ? "w-8 ml-3 opacity-100" : "w-0 ml-0 opacity-0"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center size-6 rounded-full text-[12px] font-black transition-opacity duration-300",
                    isActive
                      ? isFutureEvents ? "bg-white text-[#0F172A]" : "bg-white text-[#3154DC]"
                      : isFutureEvents ? "bg-[#0F172A] text-white" : "bg-[#3154DC] text-white"
                  )}
                >
                  {selectedCount}
                </span>
              </div>

              {/* Indicador de pestaña activa con brillo */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/30 backdrop-blur-sm z-20" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
