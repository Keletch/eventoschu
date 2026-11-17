"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfoTooltip } from "../event-dialog";
import { EventKind, UNLIMITED_CAPACITY, isVentaKind } from "../../../utils/event-kind";

interface CapacityPriceSectionProps {
  event: any;
  setEvent: (event: any) => void;
  kind: EventKind;
}

const CAPACITY_HINT: Partial<Record<EventKind, string>> = {
  cupo: "Al llenarse, los siguientes registros entran en lista de espera.",
  aprobacion: "Al llenarse, la tarjeta se bloquea con \"Agotado\".",
  pagocupo: "Al llenarse, se deja de vender y se activa la lista de espera.",
};

export const CapacityPriceSection: React.FC<CapacityPriceSectionProps> = ({ event, setEvent, kind }) => {
  const showCapacity = kind === "cupo" || kind === "aprobacion" || kind === "pagocupo";

  return (
    <section className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
        {showCapacity ? "Capacidad y Precio" : "Precio"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-black uppercase text-muted-foreground">Precio</Label>
            <InfoTooltip content="Texto libre del precio. Si escribes '0', el sistema mostrará automáticamente 'Evento sin costo' al usuario." />
          </div>
          <Input
            required
            value={event.price || ""}
            onChange={(e) => setEvent({ ...event, price: e.target.value })}
            className="rounded-xl border-border bg-muted/50 h-12 focus:bg-background transition-all"
            placeholder={isVentaKind(kind) || kind === "pagocupo" ? "Ej: 197 USD" : "0 = Evento sin costo"}
          />
        </div>

        {showCapacity && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-black uppercase text-muted-foreground">Lugares disponibles</Label>
              <InfoTooltip content="Número máximo de registros confirmados." />
            </div>
            <Input
              type="number"
              required
              min={1}
              max={UNLIMITED_CAPACITY - 1}
              value={event.capacity || 0}
              onChange={(e) => setEvent({ ...event, capacity: Math.min(parseInt(e.target.value) || 0, UNLIMITED_CAPACITY - 1) })}
              className="rounded-xl h-12 transition-all border-border bg-muted/50 focus:bg-background"
              placeholder="Ej: 50"
            />
            <p className="text-[10px] text-muted-foreground font-bold px-1">{CAPACITY_HINT[kind]}</p>
          </div>
        )}
      </div>
    </section>
  );
};
