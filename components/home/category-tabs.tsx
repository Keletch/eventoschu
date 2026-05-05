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

  useGSAP(() => {
    // Solución para artifacts: Deshabilitar force3D en los botones con sombras
    gsap.set(".category-tab-btn", { force3D: false });
  }, { scope: containerRef });

  if (availableCategories.length <= 1) return null;

  return (
    <div ref={containerRef} className="flex flex-wrap gap-3 items-center">
      {availableCategories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "category-tab-btn px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-500 relative overflow-hidden group border",
              isActive
                ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-105"
                : "bg-white text-gray-500 hover:text-black border-gray-100 hover:border-gray-200"
            )}
          >
            {category}
            {isActive && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
          </button>
        );
      })}
    </div>
  );
}
