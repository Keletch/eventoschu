"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { InfoTooltip } from "../event-dialog";

interface AdditionalInfoSectionProps {
  event: any;
  setEvent: React.Dispatch<React.SetStateAction<any>> | ((event: any) => void) | any;
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ event, setEvent }) => {
  const [showDescription, setShowDescription] = useState(!!event.description);
  const [showInfoUrl, setShowInfoUrl] = useState(!!event.info_url);

  // Memorizar borradores para no perder lo escrito si se apaga el toggle por accidente
  const cachedDescriptionRef = React.useRef(event.description || "");
  const cachedInfoUrlRef = React.useRef(event.info_url || "");
  const currentEventIdRef = React.useRef(event.id);

  useEffect(() => {
    // Si cambió el evento que se está editando, reinicializar
    if (event.id !== currentEventIdRef.current) {
      currentEventIdRef.current = event.id;
      setShowDescription(!!event.description);
      setShowInfoUrl(!!event.info_url);
      cachedDescriptionRef.current = event.description || "";
      cachedInfoUrlRef.current = event.info_url || "";
      return;
    }

    if (event.description) cachedDescriptionRef.current = event.description;
    if (event.info_url) cachedInfoUrlRef.current = event.info_url;
  }, [event.id, event.description, event.info_url]);

  const handleToggleDescription = (checked: boolean) => {
    setShowDescription(checked);
    if (!checked) {
      if (event.description) cachedDescriptionRef.current = event.description;
      setEvent((prev: any) => ({ ...prev, description: "" }));
    } else {
      // Restaurar lo que había guardado
      setEvent((prev: any) => ({ ...prev, description: cachedDescriptionRef.current }));
    }
  };

  const handleToggleInfoUrl = (checked: boolean) => {
    setShowInfoUrl(checked);
    if (!checked) {
      if (event.info_url) cachedInfoUrlRef.current = event.info_url;
      setEvent((prev: any) => ({ ...prev, info_url: "" }));
    } else {
      // Restaurar lo que había guardado
      setEvent((prev: any) => ({ ...prev, info_url: cachedInfoUrlRef.current }));
    }
  };

  return (
    <section className="space-y-6 p-6 bg-muted/20 rounded-[32px] border border-border/80">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/30 pb-2 flex items-center gap-1.5">
        Información Adicional <span className="text-[9px] font-bold text-muted-foreground/60">(Opcional)</span>
      </h3>
      
      <div className="space-y-4">
        {/* Toggle para Descripción */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-foreground">Habilitar Explicación Detallada</Label>
            <p className="text-xs text-muted-foreground">Muestra un texto explicativo más completo del evento al dar clic en "i".</p>
          </div>
          <Switch
            checked={showDescription}
            onCheckedChange={handleToggleDescription}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {showDescription && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-black uppercase text-muted-foreground">Explicación del Evento</Label>
              <InfoTooltip content="Escribe una descripción o explicación detallada del evento. Se mostrará en un popup/modal." />
            </div>
            <Textarea
              required={showDescription}
              value={event.description || ""}
              onChange={(e) => setEvent((prev: any) => ({ ...prev, description: e.target.value }))}
              className="rounded-xl border-border bg-background min-h-[100px] focus:bg-background transition-all shadow-sm"
              placeholder="Escribe aquí los detalles del evento, temario, requisitos, etc..."
            />
          </div>
        )}

        {/* Toggle para Enlace Externo */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-foreground">Habilitar Enlace a Landing Externa</Label>
            <p className="text-xs text-muted-foreground">Agrega un enlace para ver más información detallada o landing page.</p>
          </div>
          <Switch
            checked={showInfoUrl}
            onCheckedChange={handleToggleInfoUrl}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {showInfoUrl && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-black uppercase text-muted-foreground">URL de Landing Explicativa</Label>
              <InfoTooltip content="Dirección web externa de la landing page explicativa de este evento. Debe iniciar con http:// o https://." />
            </div>
            <Input
              required={showInfoUrl}
              type="url"
              value={event.info_url || ""}
              onChange={(e) => setEvent((prev: any) => ({ ...prev, info_url: e.target.value }))}
              className="rounded-xl border-border bg-background h-12 focus:bg-background transition-all shadow-sm"
              placeholder="https://giras.hyenukchu.com/mi-evento"
            />
          </div>
        )}
      </div>
    </section>
  );
};
