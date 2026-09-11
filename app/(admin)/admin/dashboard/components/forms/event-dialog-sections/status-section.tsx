"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoTooltip } from "../event-dialog";

interface StatusSectionProps {
  event: any;
  setEvent: (event: any) => void;
  systemTags?: any[];
}

export const StatusSection: React.FC<StatusSectionProps> = ({ event, setEvent, systemTags = [] }) => {
  return (
    <div className="space-y-6 p-6 bg-muted/30 rounded-[32px] border border-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="size-2 rounded-full bg-primary" />
          <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Método de Captura</Label>
          <InfoTooltip content="Define el flujo de registro. 'Abierto' confirma automáticamente al usuario hasta el límite de cupo. 'Cerrado' lo deja en lista de espera hasta aprobación manual del admin." />
        </div>
        <Select
          value={event.initial_status || "confirmed"}
          onValueChange={(v) => {
            const updates: any = { initial_status: v };
            if (v === "pending") {
              if (event.keap_pending_tag_id === null) {
                updates.keap_pending_tag_id = "";
              }
              if ((event.capacity ?? 0) >= 9999) {
                updates.capacity = 50;
              }
              // En evento cerrado, la etiqueta de pago no es compatible
              const pagoTag = systemTags.find((t: any) => t.slug === "pago");
              if (pagoTag && event.tag_ids?.includes(pagoTag.id)) {
                updates.tag_ids = (event.tag_ids || []).filter((id: string) => id !== pagoTag.id);
              }
            } else if (v === "confirmed") {
              updates.keap_pending_tag_id = null;
              // En evento abierto, la etiqueta de pago con cupo no es compatible
              const pagoCupoTag = systemTags.find((t: any) => t.slug === "pago_cupo");
              if (pagoCupoTag && event.tag_ids?.includes(pagoCupoTag.id)) {
                updates.tag_ids = (event.tag_ids || []).filter((id: string) => id !== pagoCupoTag.id);
              }
            }
            setEvent({ ...event, ...updates });
          }}
        >
          <SelectTrigger className="rounded-xl border-border bg-background h-12 shadow-sm">
            <SelectValue placeholder="Seleccionar método">
              {event.initial_status === "pending" ? "Evento Cerrado" : "Evento Abierto"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border shadow-xl bg-popover">
            <SelectItem value="confirmed" className="rounded-lg cursor-pointer py-3">
              <div className="flex flex-col text-left">
                <span className="font-bold text-emerald-500">Evento Abierto</span>
                <span className="text-[10px] text-muted-foreground">Confirmación automática. Puede tener cupo ilimitado.</span>
              </div>
            </SelectItem>
            <SelectItem value="pending" className="rounded-lg cursor-pointer py-3">
              <div className="flex flex-col text-left">
                <span className="font-bold text-amber-500">Evento Cerrado</span>
                <span className="text-[10px] text-muted-foreground">Lista de espera y validación manual. Requiere cupo definido.</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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
    </div>
  );
};
