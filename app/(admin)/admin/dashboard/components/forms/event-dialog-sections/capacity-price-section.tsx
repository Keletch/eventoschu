"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "../event-dialog";

interface CapacityPriceSectionProps {
  event: any;
  setEvent: (event: any) => void;
  isOpenMode: boolean;
}

export const CapacityPriceSection: React.FC<CapacityPriceSectionProps> = ({ event, setEvent, isOpenMode }) => {
  const isUnlimited = (event.capacity ?? 0) >= 9999;

  return (
    <section className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
        Capacidad y Precio
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
            placeholder="Ej: 30 USD"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-black uppercase text-muted-foreground">Capacidad Máxima</Label>
            <InfoTooltip content={isOpenMode
              ? "Número máximo de registros confirmados. Al llenarse, la tarjeta se bloquea. Activa 'Sin límite' si el evento no tiene restricción."
              : "En Evento Cerrado la capacidad es obligatoria para controlar la lista de espera y aprobaciones manuales."}
            />
          </div>
          <Input
            type="number"
            required={!isUnlimited}
            disabled={isUnlimited}
            value={isUnlimited ? "" : (event.capacity || 0)}
            onChange={(e) => setEvent({ ...event, capacity: parseInt(e.target.value) || 0 })}
            className={cn(
              "rounded-xl h-12 transition-all border-border",
              isUnlimited ? "bg-muted text-muted-foreground opacity-60 border-dashed" : "bg-muted/50 focus:bg-background"
            )}
            placeholder={isUnlimited ? "Sin límite de cupo" : "Ej: 50"}
          />
          {isOpenMode ? (
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">¿Sin límite?</span>
              <Switch
                checked={isUnlimited}
                onCheckedChange={(val) => setEvent({ ...event, capacity: val ? 9999 : 50 })}
                className="scale-[0.75] data-[state=checked]:bg-primary"
              />
            </div>
          ) : (
            <p className="text-[10px] text-amber-500 font-bold px-1">
              Los eventos cerrados siempre requieren un cupo definido.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
