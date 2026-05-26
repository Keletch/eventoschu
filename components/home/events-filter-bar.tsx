"use client";

import React, { useMemo } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SearchablePicker } from "@/components/ui/searchable-picker";
import { cn } from "@/lib/utils";

interface EventsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  availableCategories: string[];
  activeSubcategory: string;
  setActiveSubcategory: (val: string) => void;
  availableSubcategories: string[];
  activeMonth: string;
  setActiveMonth: (val: string) => void;
  availableMonths: string[];
  activeTag: string;
  setActiveTag: (val: string) => void;
  availableTags: { id: string; name: string; slug: string; color_hex: string }[];
  resetAllFilters: () => void;
  className?: string;
}

export function EventsFilterBar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  availableCategories,
  activeSubcategory,
  setActiveSubcategory,
  availableSubcategories,
  activeMonth,
  setActiveMonth,
  availableMonths,
  activeTag,
  setActiveTag,
  availableTags,
  resetAllFilters,
  className,
}: EventsFilterBarProps) {
  // Map categories to Picker Options
  const categoryOptions = useMemo(() => {
    return availableCategories.map((cat) => ({
      id: cat,
      label: cat === "Todos" ? "Todas las Categorías" : cat,
    }));
  }, [availableCategories]);

  // Map subcategories to Picker Options
  const subcategoryOptions = useMemo(() => {
    return [
      { id: "Todos", label: "Todas las Subcategorías" },
      ...availableSubcategories
        .filter((sub) => sub !== "Todos")
        .map((sub) => ({ id: sub, label: sub })),
    ];
  }, [availableSubcategories]);

  // Map tags to Picker Options
  const tagOptions = useMemo(() => {
    return [
      { id: "Todos", label: "Todas las Etiquetas" },
      ...availableTags.map((tag) => ({
        id: tag.id,
        label: tag.name,
        color: tag.color_hex,
      })),
    ];
  }, [availableTags]);

  // Map months to Picker Options
  const monthOptions = useMemo(() => {
    return [
      { id: "", label: "Todos los Meses" },
      ...availableMonths.map((m) => ({ id: m, label: m })),
    ];
  }, [availableMonths]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== "" ||
      activeCategory !== "Todos" ||
      activeSubcategory !== "Todos" ||
      activeMonth !== "" ||
      activeTag !== "Todos"
    );
  }, [searchQuery, activeCategory, activeSubcategory, activeMonth, activeTag]);

  // Find active tag object for custom styling
  const activeTagObj = useMemo(() => {
    return availableTags.find((t) => t.id === activeTag);
  }, [availableTags, activeTag]);

  return (
    <div className={cn("w-full bg-card p-4 md:p-6 rounded-[32px] border border-border shadow-sm flex flex-col", className)}>
      {/* Top row: Search and Pickers */}
      <div className="flex flex-col xl:flex-row gap-4 w-full xl:items-center">
        {/* Search Bar */}
        <SearchInput
          placeholder="Buscar taller, gira, ciudad..."
          value={searchQuery}
          onChange={setSearchQuery}
          tooltipTitle="Buscador de Eventos"
          tooltipDescription="Filtra eventos en tiempo real por título, ciudad, país o plataforma online."
          className="w-full xl:flex-1"
        />

        {/* Pickers container */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center w-full xl:w-auto">
          {/* Category Picker */}
          <SearchablePicker
            options={categoryOptions}
            value={activeCategory}
            onSelect={setActiveCategory}
            placeholder="Categoría"
            searchPlaceholder="Buscar categoría..."
            triggerClassName="w-full sm:w-48 shrink-0"
          />

          {/* Subcategory Picker (always visible, disabled if no options available) */}
          <SearchablePicker
            options={subcategoryOptions}
            value={activeSubcategory}
            onSelect={setActiveSubcategory}
            placeholder="Subcategoría"
            searchPlaceholder="Buscar subcategoría..."
            disabled={availableSubcategories.length <= 1}
            triggerClassName="w-full sm:w-48 shrink-0"
          />

          {/* Tag Picker (only show if available tags exist) */}
          {availableTags.length > 0 && (
            <SearchablePicker
              options={tagOptions}
              value={activeTag}
              onSelect={setActiveTag}
              placeholder="Etiqueta"
              searchPlaceholder="Buscar etiqueta..."
              triggerClassName="w-full sm:w-48 shrink-0"
            />
          )}

          {/* Month Picker */}
          <SearchablePicker
            options={monthOptions}
            value={activeMonth}
            onSelect={setActiveMonth}
            placeholder="Mes"
            searchPlaceholder="Buscar mes..."
            triggerClassName="w-full sm:w-48 shrink-0"
          />
        </div>
      </div>

      {/* Bottom row: Active Chips & Reset Actions */}
      <div 
        className={cn(
          "grid transition-all duration-300 ease-in-out overflow-hidden border-t border-transparent pt-0 mt-0 grid-rows-[0fr] opacity-0",
          hasActiveFilters && "grid-rows-[1fr] opacity-100 pt-3 mt-4 border-border/50"
        )}
      >
        <div className="min-h-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
            {/* Active chips wrapper */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Query Chip */}
              {searchQuery.trim() !== "" && (
                <ActiveChip
                  label="Búsqueda"
                  value={`"${searchQuery}"`}
                  onRemove={() => setSearchQuery("")}
                  className="bg-primary/10 border-primary/20 text-primary"
                />
              )}

              {/* Category Chip */}
              {activeCategory !== "Todos" && (
                <ActiveChip
                  label="Categoría"
                  value={activeCategory}
                  onRemove={() => setActiveCategory("Todos")}
                  className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500"
                />
              )}

              {/* Subcategory Chip */}
              {activeSubcategory !== "Todos" && (
                <ActiveChip
                  label="Subcategoría"
                  value={activeSubcategory}
                  onRemove={() => setActiveSubcategory("Todos")}
                  className="bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-500"
                />
              )}

              {/* Tag Chip (Chameleon dynamic color) */}
              {activeTag !== "Todos" && activeTagObj && (
                <ActiveChip
                  label="Etiqueta"
                  value={activeTagObj.name}
                  onRemove={() => setActiveTag("Todos")}
                  style={{
                    color: activeTagObj.color_hex,
                    borderColor: `${activeTagObj.color_hex}33`,
                    backgroundColor: `${activeTagObj.color_hex}1a`,
                  }}
                />
              )}

              {/* Month Chip */}
              {activeMonth !== "" && (
                <ActiveChip
                  label="Mes"
                  value={activeMonth}
                  onRemove={() => setActiveMonth("")}
                  className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500"
                />
              )}
            </div>

            {/* Reset Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors gap-1.5 cursor-pointer ml-auto sm:ml-0 self-end sm:self-center"
            >
              <RefreshCw className="size-3" />
              Resetear Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActiveChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function ActiveChip({ label, value, onRemove, className, style }: ActiveChipProps) {
  return (
    <div
      className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm animate-in fade-in slide-in-from-left-3 duration-200", className)}
      style={style}
    >
      <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors shrink-0 cursor-pointer"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
