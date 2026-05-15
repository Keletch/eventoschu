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
        "absolute left-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-r from-background to-transparent pointer-events-none transition-opacity duration-500",
        canScrollLeft ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute right-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-l from-background to-transparent pointer-events-none transition-opacity duration-500",
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
                "month-tab-btn px-6 py-3 !rounded-b-none rounded-t-xl font-bold text-[15px] transition-[background-color,border-color,transform,box-shadow,width,margin,opacity] duration-300 relative flex items-center gap-0 shrink-0 overflow-hidden cursor-pointer whitespace-nowrap border border-transparent",
                isActive
                  ? isFutureEvents 
                    ? "bg-gradient-to-r from-[#0F172A] dark:from-[#151210] to-tab-active-bg border-border/20 text-tab-active-text shadow-sm z-10"
                    : "bg-tab-active-bg border-tab-active-bg text-tab-active-text shadow-sm z-10"
                  : "bg-tab-inactive-bg text-tab-inactive-text hover:opacity-90 hover:border-tab-border/50"
              )}
            >
              <span className="relative z-10 transition-none">{month}</span>

              {/* Badge de conteo animado */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-center",
                  selectedCount > 0 ? "w-7 ml-2 opacity-100" : "w-0 ml-0 opacity-0"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center size-5 rounded-full text-[11px] font-black transition-none duration-300",
                    isActive
                      ? "bg-tab-active-text text-tab-active-bg"
                      : "bg-tab-active-bg text-tab-active-text shadow-sm"
                  )}
                >
                  {selectedCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
