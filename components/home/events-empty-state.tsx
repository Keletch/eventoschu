"use client";

import { CalendarX2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventsEmptyStateProps {
  /** Hay filtros o búsqueda activos (los eventos existen pero no coinciden) */
  hasActiveFilters: boolean;
  onResetFilters?: () => void;
}

/**
 * Lo que se ve cuando el carrusel no tiene eventos que mostrar.
 * Sin esto quedaba un hueco vacío con flechas y barra de progreso.
 */
export function EventsEmptyState({ hasActiveFilters, onResetFilters }: EventsEmptyStateProps) {
  const Icon = hasActiveFilters ? SearchX : CalendarX2;

  return (
    <div className="mx-auto max-w-xl px-6 py-12 sm:px-10 text-center animate-in fade-in duration-500">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-7 text-primary" strokeWidth={2} />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-foreground text-balance">
        {hasActiveFilters ? "Ningún evento coincide con tu búsqueda" : "Por ahora no hay eventos abiertos"}
      </h3>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground text-balance">
        {hasActiveFilters
          ? "Prueba con otra categoría, mes o palabra, o mira todos los eventos disponibles."
          : "Estamos preparando las próximas fechas. Vuelve pronto o síguenos en redes para enterarte primero."}
      </p>
      {hasActiveFilters && onResetFilters && (
        <Button onClick={onResetFilters} className="mt-6 rounded-full px-6 h-11 font-bold">
          Ver todos los eventos
        </Button>
      )}
    </div>
  );
}
