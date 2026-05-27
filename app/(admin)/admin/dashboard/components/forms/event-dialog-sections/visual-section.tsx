"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "../event-dialog";

interface VisualSectionProps {
  event: any;
  setEvent: (event: any) => void;
}

const BG_COLOR_OPTIONS = [
  { value: "bg-sky-100", label: "Azul Cielo", preview: "bg-sky-200" },
  { value: "bg-emerald-100", label: "Verde Esmeralda", preview: "bg-emerald-200" },
  { value: "bg-amber-100", label: "Ámbar", preview: "bg-amber-200" },
  { value: "bg-rose-100", label: "Rosa", preview: "bg-rose-200" },
  { value: "bg-purple-100", label: "Púrpura", preview: "bg-purple-200" },
  { value: "custom", label: "Personalizado", preview: "bg-gradient-to-tr from-red-400 via-green-400 to-blue-400" },
];

export const VisualSection: React.FC<VisualSectionProps> = ({ event, setEvent }) => {
  return (
    <section className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
        Apariencia Visual
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-black uppercase text-muted-foreground">Color de Fondo de la Tarjeta</Label>
          <InfoTooltip content="Color del avatar circular de la tarjeta en el carrusel del Home. Úsalo para diferenciar visualmente los tipos de eventos (Giras, Talleres, Meetups)." />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {BG_COLOR_OPTIONS.map((opt) => {
            const isCustom = opt.value === "custom";
            const isSelected = isCustom ? event.bg_class?.startsWith("#") : event.bg_class === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEvent({ ...event, bg_class: isCustom ? "#e5e5e5" : opt.value })}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-border-hover hover:bg-muted"
                )}
              >
                <span 
                  className={cn("w-4 h-4 rounded-full shrink-0", !isCustom && opt.preview, isCustom && "bg-gradient-to-tr from-red-400 via-green-400 to-blue-400")} 
                />
                {opt.label}
              </button>
            );
          })}
        </div>
        {event.bg_class?.startsWith("#") && (
          <div className="flex items-center gap-3 mt-3 p-3 bg-muted/50 border border-border rounded-xl">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">Color HEX:</Label>
            <div className="flex flex-1 items-center gap-2">
              <Input 
                type="color" 
                value={event.bg_class} 
                onChange={(e) => setEvent({ ...event, bg_class: e.target.value })}
                className="w-10 h-10 p-0 border-none rounded-lg cursor-pointer shrink-0 shadow-sm bg-transparent"
              />
              <Input 
                type="text" 
                value={event.bg_class} 
                onChange={(e) => setEvent({ ...event, bg_class: e.target.value })}
                className="flex-1 h-10 text-sm font-mono uppercase bg-background border-border rounded-lg shadow-sm"
                placeholder="#FFFFFF"
                maxLength={7}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
