"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "../event-dialog";
import { KeapTagPicker } from "../keap-tag-picker";

interface KeapSectionProps {
  event: any;
  setEvent: (event: any) => void;
  keapTags: any[];
  isTagsLoading: boolean;
  onRefreshTags: () => void;
}

export const KeapSection: React.FC<KeapSectionProps> = ({
  event,
  setEvent,
  keapTags,
  isTagsLoading,
  onRefreshTags,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Integración Keap CRM
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefreshTags}
          disabled={isTagsLoading}
          className="h-6 gap-2 text-primary hover:bg-primary/10 rounded-lg px-2"
        >
          <RefreshCw className={cn("h-3 w-3", isTagsLoading && "animate-spin")} />
          <span className="text-[10px] font-bold uppercase">Sincronizar Tags</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-xs font-black uppercase text-muted-foreground">
              Tag: Pendiente {event.initial_status === "pending" && <span className="text-destructive">*</span>}
            </Label>
            <InfoTooltip content="Tag de Keap asignado cuando el usuario se registra en modo 'Pendiente' (Evento Cerrado). Al activar el toggle de Keap pendiente, debes seleccionar el tag correspondiente." />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                {event.initial_status === "pending" ? "Obligatorio" : "Habilitar"}
              </span>
              <Switch
                checked={!!event.keap_pending_tag_id || event.keap_pending_tag_id === ""}
                disabled={event.initial_status === "pending"}
                onCheckedChange={(val) => {
                  if (!val) setEvent({ ...event, keap_pending_tag_id: null });
                  else setEvent({ ...event, keap_pending_tag_id: "" });
                }}
                className="scale-[0.7] data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>
          {event.keap_pending_tag_id !== null && (
            <KeapTagPicker
              label=""
              value={event.keap_pending_tag_id}
              onChange={(id) => setEvent({ ...event, keap_pending_tag_id: id })}
              tags={keapTags}
              isLoading={isTagsLoading}
            />
          )}
          {event.keap_pending_tag_id === null && (
            <div className="h-12 flex items-center justify-center border border-dashed border-border rounded-xl bg-muted/30">
              <span className="text-xs text-muted-foreground italic">Tag de pendiente deshabilitado</span>
            </div>
          )}
          {event.initial_status === "pending" && !event.keap_pending_tag_id && (
            <p className="text-[10px] text-destructive font-bold animate-pulse px-1">Debes seleccionar un tag para el modo cerrado</p>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center min-h-[24px] px-1">
            <Label className="text-xs font-black uppercase text-muted-foreground">Tag: Confirmado <span className="text-destructive">*</span></Label>
            <InfoTooltip content="Tag de Keap obligatorio que se asigna cuando el registro de un usuario es confirmado. Sin este tag, la integración con el CRM no funcionará." />
          </div>
          <KeapTagPicker
            label=""
            value={event.keap_tag_id}
            onChange={(id) => setEvent({ ...event, keap_tag_id: id })}
            tags={keapTags}
            isLoading={isTagsLoading}
          />
        </div>
      </div>
    </section>
  );
};
