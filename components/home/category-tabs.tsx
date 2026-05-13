"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Globe, 
  NotebookPen, 
  Presentation, 
  Monitor,
  LayoutGrid 
} from "lucide-react";

interface CategoryTabsProps {
  availableCategories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Eventos": Users,
  "Giras": Globe,
  "Talleres/Cursos": NotebookPen,
  "Reunión oficina": Presentation,
  "Eventos en linea": Monitor,
};

const CATEGORY_LABELS: Record<string, string> = {
  "all": "Ver todo",
  "Todos": "Ver todo",
};

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

  if (availableCategories.length <= 1) return null;

  return (
    <div className="relative group/categories -mx-1 px-1">
      {/* Fading Edges */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background via-background/50 to-transparent pointer-events-none transition-opacity duration-500",
        canScrollLeft ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background via-background/50 to-transparent pointer-events-none transition-opacity duration-500",
        canScrollRight ? "opacity-100" : "opacity-0"
      )} />

      <div 
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 flex-nowrap scroll-smooth items-center px-1"
      >
        {availableCategories.map((category) => {
          const isActive = activeCategory === category;
          const Icon = CATEGORY_ICONS[category];
          const label = CATEGORY_LABELS[category] || category;

          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold transition-all duration-300 whitespace-nowrap select-none border border-transparent", 
                isActive
                  ? "bg-foreground text-background border-foreground shadow-sm scale-[1.02]"
                  : "bg-muted text-muted-foreground border-border/50 hover:bg-accent hover:text-foreground hover:border-border"
              )}
            >
              {Icon && (
                <Icon className={cn(
                  "size-[18px] transition-colors duration-300",
                  isActive ? "text-background" : "text-muted-foreground/70 group-hover:text-foreground"
                )} />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
