"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Users, Globe, NotebookPen, Presentation, Monitor, LayoutGrid, Calendar, Laptop, MapPin, Video, BookOpen, Coffee, Building, Mic, Music, Camera, Zap, Award, CircleDollarSign
} from "lucide-react";

const ALL_LUCIDE_ICONS: Record<string, React.ElementType> = {
  "Calendar": Calendar,
  "Laptop": Laptop,
  "MapPin": MapPin,
  "Users": Users,
  "Video": Video,
  "Globe": Globe,
  "BookOpen": BookOpen,
  "Presentation": Presentation,
  "Coffee": Coffee,
  "Building": Building,
  "Mic": Mic,
  "Music": Music,
  "Camera": Camera,
  "Zap": Zap,
  "Award": Award,
  "NotebookPen": NotebookPen,
  "Monitor": Monitor,
  "LayoutGrid": LayoutGrid,
  "CircleDollarSign": CircleDollarSign
};

interface CategoryTabsProps {
  availableCategories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  availableCategoryIcons?: Record<string, string>;
  activeSubcategory?: string;
  setActiveSubcategory?: (category: string) => void;
  availableSubcategories?: string[];
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
  availableCategoryIcons = {},
  activeSubcategory,
  setActiveSubcategory,
  availableSubcategories = [],
}: CategoryTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const subContainerRef = React.useRef<HTMLDivElement>(null);
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
    <div className="flex flex-col gap-2">
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
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 flex-nowrap scroll-smooth items-center px-1"
        >
          {availableCategories.map((category) => {
            const isActive = activeCategory === category;
            const iconName = availableCategoryIcons[category];
            const Icon = iconName ? ALL_LUCIDE_ICONS[iconName] : CATEGORY_ICONS[category];
            const label = CATEGORY_LABELS[category] || category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold transition-[background-color,border-color,transform,box-shadow] duration-300 whitespace-nowrap select-none border border-transparent", 
                  isActive
                    ? "bg-category-tab-active-bg text-category-tab-active-text border-category-tab-active-bg shadow-sm scale-[1.02]"
                    : "bg-tab-inactive-bg text-tab-inactive-text border-tab-border/50 hover:opacity-90 hover:border-tab-border"
                )}
              >
                {Icon && (
                  <Icon className={cn(
                    "size-[18px] transition-none duration-300",
                    isActive ? "text-category-tab-active-text" : "text-tab-inactive-text/70 group-hover:text-foreground"
                  )} />
                )}
                <span className="transition-none">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {availableSubcategories.length > 0 && (
        <div 
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 flex-nowrap scroll-smooth items-center px-1 animate-in fade-in slide-in-from-top-2 duration-300"
          ref={subContainerRef}
        >
          {availableSubcategories.map((sub: string) => {
            const isActive = activeSubcategory === sub;
            return (
              <button
                key={sub}
                onClick={() => setActiveSubcategory && setActiveSubcategory(sub)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-300 whitespace-nowrap border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-surface text-muted-foreground border-surface-border hover:border-primary/30 hover:text-foreground"
                )}
              >
                {sub === "Todos" ? "Ver Todo" : sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
