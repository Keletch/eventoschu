"use client";

import React, { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "../event-dialog";
import { EVENT_KINDS, EventKind, EventKindGroup } from "../../../utils/event-kind";

interface StatusSectionProps {
  event: any;
  setEvent: (event: any) => void;
  kind: EventKind;
  onKindChange: (kind: EventKind) => void;
}

const GROUPS: { id: EventKindGroup; label: string }[] = [
  { id: "registro", label: "Con registro" },
  { id: "venta", label: "Solo venta" },
];

export const StatusSection: React.FC<StatusSectionProps> = ({ event, setEvent, kind, onKindChange }) => {
  const group = EVENT_KINDS.find((k) => k.id === kind)?.group ?? "registro";
  const options = EVENT_KINDS.filter((k) => k.group === group);
  const index = options.findIndex((k) => k.id === kind);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Centra la opción elegida dentro del carrusel (sin mover el scroll del diálogo)
  useEffect(() => {
    const card = cardRefs.current[kind];
    const track = card?.parentElement;
    if (card && track) track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  }, [kind]);

  const step = (dir: number) => onKindChange(options[(index + dir + options.length) % options.length].id);

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-muted/30 rounded-[32px] border border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="size-2 rounded-full bg-primary" />
          <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tipo de Evento</Label>
          <InfoTooltip content="Define cómo se inscribe la gente. El formulario solo muestra los campos que necesita el tipo elegido." />
        </div>

        {/* Grupo: pestañas con indicador deslizante */}
        <div role="tablist" aria-label="Grupo de tipo de evento" className="relative grid grid-cols-2 p-1 rounded-full bg-muted border border-border">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm transition-transform duration-300 ease-out"
            style={{ transform: group === "venta" ? "translateX(100%)" : "translateX(0)" }}
          />
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={group === g.id}
              onClick={() => group !== g.id && onKindChange(EVENT_KINDS.find((k) => k.group === g.id)!.id)}
              className={cn(
                "relative z-10 h-10 rounded-full text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
                group === g.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Opciones del grupo: carrusel con flechas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Tipo anterior"
            className="hidden sm:flex shrink-0 size-9 rounded-full border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div role="radiogroup" aria-label="Tipo de evento" className="relative flex-1 min-w-0 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1 px-[6%] sm:px-[12%]">
            {options.map((k) => {
              const isSelected = kind === k.id;
              return (
                <button
                  key={k.id}
                  ref={(el) => { cardRefs.current[k.id] = el; }}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onKindChange(k.id)}
                  className={cn(
                    "snap-center shrink-0 w-[88%] sm:w-[76%] text-left rounded-2xl border p-4 transition-all duration-300 cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 scale-100"
                      : "border-border bg-background opacity-55 scale-[0.94] hover:opacity-80"
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm font-black", isSelected ? "text-primary" : "text-foreground")}>{k.label}</span>
                    {isSelected && (
                      <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] text-muted-foreground leading-snug mt-1">{k.desc}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Tipo siguiente"
            className="hidden sm:flex shrink-0 size-9 rounded-full border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Puntos de posición */}
        <div className="flex justify-center gap-1.5" aria-hidden>
          {options.map((k) => (
            <span key={k.id} className={cn("h-1.5 rounded-full transition-all duration-300", kind === k.id ? "w-5 bg-primary" : "w-1.5 bg-border")} />
          ))}
        </div>
      </div>

      {event.id ? (
        // Al editar, la visibilidad se cambia desde el switch de la tabla: ese sí sincroniza Keap y avisa a los admins.
        <p className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
          Para mostrar u ocultar este evento usa el interruptor de la tabla de eventos (sincroniza Keap con sus inscritos).
        </p>
      ) : (
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <Label className="text-sm font-bold text-foreground">Visibilidad del Evento</Label>
            <p className="text-xs text-muted-foreground italic">¿Deseas que este evento sea visible en la web?</p>
          </div>
          <div className="flex items-center gap-2">
            <InfoTooltip content="Al desactivar, el evento se oculta del Home sin eliminarlo de la base de datos. Útil para eventos en preparación." />
            <Switch
              checked={event.active}
              onCheckedChange={(v) => setEvent({ ...event, active: v })}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
