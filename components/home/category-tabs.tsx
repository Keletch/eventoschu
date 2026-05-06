"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface CategoryTabsProps {
  availableCategories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CategoryTabs({
  availableCategories,
  activeCategory,
  setActiveCategory,
}: CategoryTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [availableCategories]);

  useGSAP(() => {
    // Solución para artifacts: Deshabilitar force3D en los botones con sombras
    gsap.set(".category-tab-btn", { force3D: false });
  }, { dependencies: [availableCategories], scope: containerRef });

  if (availableCategories.length <= 1) return null;

  return (
    <div className="relative group/categories -mx-1 px-1">
      {/* Fading Edges Normalizados */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#F8F9FA] to-transparent pointer-events-none transition-opacity duration-500",
        canScrollLeft ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#F8F9FA] to-transparent pointer-events-none transition-opacity duration-500",
        canScrollRight ? "opacity-100" : "opacity-0"
      )} />

      <div 
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 flex-nowrap scroll-smooth items-center"
      >
        {availableCategories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "category-tab-btn px-7 py-3 rounded-[18px] text-sm font-bold transition-all duration-500 relative group border whitespace-nowrap",
                "transform backface-visibility-hidden antialiased subpixel-antialiased select-none", 
                isActive
                  ? "bg-black text-white border-black shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),0_4px_10px_-5px_rgba(0,0,0,0.3)] scale-[1.05] z-10"
                  : "bg-white text-gray-500 hover:text-black border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_20px_-10px_rgba(0,0,0,0.1)] scale-100"
              )}
            >
              <span className="relative z-10">{category}</span>
              {isActive && (
                <div className="absolute inset-0 rounded-[18px] overflow-hidden pointer-events-none">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
