"use client";

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
  return (
    <div className="month-tabs flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {availableMonths.map((month) => {
        // Conteo de eventos seleccionados en este mes
        const selectedCount = events.filter((e) => {
          const d = new Date(e.start_date);
          const m = d.toLocaleDateString("es-ES", { month: "long" });
          const cap = m.charAt(0).toUpperCase() + m.slice(1);
          return cap === month && selectedEvents.includes(e.id);
        }).length;

        return (
          <button
            key={month}
            onClick={() => handleMonthChange(month)}
            className={cn(
              "px-10 py-5 !rounded-b-none rounded-t-[32px] font-bold text-lg transition-all duration-500 relative flex items-center gap-0 shrink-0 opacity-0 translate-y-8 overflow-hidden cursor-pointer",
              activeMonth === month
                ? "bg-[#3154DC] text-white shadow-[-10px_0_20px_rgba(0,0,0,0.05)] z-10"
                : "bg-neutral-100 text-zinc-400 hover:bg-neutral-200"
            )}
            style={{
              transitionProperty: "all",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
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
                  activeMonth === month
                    ? "bg-white text-[#3154DC]"
                    : "bg-[#3154DC] text-white"
                )}
              >
                {selectedCount}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
