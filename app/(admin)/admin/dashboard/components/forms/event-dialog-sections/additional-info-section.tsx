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
  systemTags?: any[];
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ event, setEvent, systemTags = [] }) => {
  const [showDescription, setShowDescription] = useState(!!event.description);
  const [showInfoUrl, setShowInfoUrl] = useState(!!event.info_url);

  // Determinar si ya tiene configurado un enlace alternativo a Paso 2
  const paidLinks = event.paid_links || [];
  const currentTypConfig = paidLinks.find((l: any) => l.type === "typ_config") || {
    type: "typ_config",
    external_typ_url: event.external_typ_url || ""
  };
  const [showTypUrl, setShowTypUrl] = useState(!!currentTypConfig.external_typ_url || !!event.external_typ_url);

  // Determinar si ya tiene configurado Paso 3: Comunidad / WhatsApp
  const currentWaConfig = paidLinks.find((l: any) => l.type === "whatsapp_config") || {
    type: "whatsapp_config",
    whatsapp_url: event.whatsapp_url || "",
    whatsapp_button_text: event.whatsapp_button_text || "",
    whatsapp_description: event.whatsapp_description || ""
  };
  const [showWhatsapp, setShowWhatsapp] = useState(!!currentWaConfig.whatsapp_url || !!event.whatsapp_url);

  // Memorizar borradores para no perder lo escrito si se apaga el toggle por accidente
  const cachedDescriptionRef = React.useRef(event.description || "");
  const cachedInfoUrlRef = React.useRef(event.info_url || "");
  const cachedTypUrlRef = React.useRef(currentTypConfig.external_typ_url || event.external_typ_url || "");
  const cachedWaRef = React.useRef({
    whatsapp_url: currentWaConfig.whatsapp_url || event.whatsapp_url || "",
    whatsapp_button_text: currentWaConfig.whatsapp_button_text || event.whatsapp_button_text || "",
    whatsapp_description: currentWaConfig.whatsapp_description || event.whatsapp_description || ""
  });
  const currentEventIdRef = React.useRef(event.id);

  useEffect(() => {
    // Si cambió el evento que se está editando, reinicializar
    if (event.id !== currentEventIdRef.current) {
      currentEventIdRef.current = event.id;
      setShowDescription(!!event.description);
      setShowInfoUrl(!!event.info_url);
      const typUrl = (event.paid_links || []).find((l: any) => l.type === "typ_config")?.external_typ_url || event.external_typ_url || "";
      setShowTypUrl(!!typUrl);
      const waUrl = (event.paid_links || []).find((l: any) => l.type === "whatsapp_config")?.whatsapp_url || event.whatsapp_url || "";
      setShowWhatsapp(!!waUrl);

      cachedDescriptionRef.current = event.description || "";
      cachedInfoUrlRef.current = event.info_url || "";
      cachedTypUrlRef.current = typUrl;
      cachedWaRef.current = {
        whatsapp_url: waUrl,
        whatsapp_button_text: event.whatsapp_button_text || (event.paid_links || []).find((l: any) => l.type === "whatsapp_config")?.whatsapp_button_text || "",
        whatsapp_description: event.whatsapp_description || (event.paid_links || []).find((l: any) => l.type === "whatsapp_config")?.whatsapp_description || ""
      };
      return;
    }

    if (event.description) cachedDescriptionRef.current = event.description;
    if (event.info_url) cachedInfoUrlRef.current = event.info_url;
    const currentTyp = (event.paid_links || []).find((l: any) => l.type === "typ_config")?.external_typ_url || event.external_typ_url || "";
    if (currentTyp) cachedTypUrlRef.current = currentTyp;
    const currentWa = (event.paid_links || []).find((l: any) => l.type === "whatsapp_config")?.whatsapp_url || event.whatsapp_url || "";
    if (currentWa) {
      cachedWaRef.current.whatsapp_url = currentWa;
      cachedWaRef.current.whatsapp_button_text = event.whatsapp_button_text || (event.paid_links || []).find((l: any) => l.type === "whatsapp_config")?.whatsapp_button_text || "";
      cachedWaRef.current.whatsapp_description = event.whatsapp_description || (event.paid_links || []).find((l: any) => l.type === "whatsapp_config")?.whatsapp_description || "";
    }
  }, [event.id, event.description, event.info_url, event.paid_links, event.external_typ_url, event.whatsapp_url, event.whatsapp_button_text, event.whatsapp_description]);

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

  const handleToggleTypUrl = (checked: boolean) => {
    setShowTypUrl(checked);
    const filtered = (event.paid_links || []).filter((l: any) => l.type !== "typ_config");
    if (!checked) {
      const existingTyp = (event.paid_links || []).find((l: any) => l.type === "typ_config")?.external_typ_url || event.external_typ_url || "";
      if (existingTyp) cachedTypUrlRef.current = existingTyp;
      setEvent((prev: any) => ({
        ...prev,
        external_typ_url: "",
        paid_links: filtered
      }));
    } else {
      const restoredUrl = cachedTypUrlRef.current || "";
      const nextPaidLinks = [...filtered, { type: "typ_config", external_typ_url: restoredUrl }];
      setEvent((prev: any) => ({
        ...prev,
        external_typ_url: restoredUrl,
        paid_links: nextPaidLinks
      }));
    }
  };

  const handleUpdateTypUrl = (url: string) => {
    cachedTypUrlRef.current = url;
    const filtered = (event.paid_links || []).filter((l: any) => l.type !== "typ_config");
    const nextPaidLinks = [...filtered, { type: "typ_config", external_typ_url: url }];
    setEvent((prev: any) => ({
      ...prev,
      external_typ_url: url,
      paid_links: nextPaidLinks
    }));
  };

  const handleToggleWhatsapp = (checked: boolean) => {
    setShowWhatsapp(checked);
    const filtered = (event.paid_links || []).filter((l: any) => l.type !== "whatsapp_config");
    if (!checked) {
      if (event.whatsapp_url) cachedWaRef.current.whatsapp_url = event.whatsapp_url;
      if (event.whatsapp_button_text) cachedWaRef.current.whatsapp_button_text = event.whatsapp_button_text;
      if (event.whatsapp_description) cachedWaRef.current.whatsapp_description = event.whatsapp_description;
      setEvent((prev: any) => ({
        ...prev,
        whatsapp_url: "",
        whatsapp_button_text: "",
        whatsapp_description: "",
        paid_links: filtered
      }));
    } else {
      const restored = cachedWaRef.current;
      const nextPaidLinks = [...filtered, {
        type: "whatsapp_config",
        whatsapp_url: restored.whatsapp_url,
        whatsapp_button_text: restored.whatsapp_button_text,
        whatsapp_description: restored.whatsapp_description
      }];
      setEvent((prev: any) => ({
        ...prev,
        whatsapp_url: restored.whatsapp_url,
        whatsapp_button_text: restored.whatsapp_button_text,
        whatsapp_description: restored.whatsapp_description,
        paid_links: nextPaidLinks
      }));
    }
  };

  const handleUpdateWhatsappField = (field: "whatsapp_url" | "whatsapp_button_text" | "whatsapp_description", value: string) => {
    cachedWaRef.current[field] = value;
    const filtered = (event.paid_links || []).filter((l: any) => l.type !== "whatsapp_config");
    const currentConfig = {
      type: "whatsapp_config",
      whatsapp_url: field === "whatsapp_url" ? value : (event.whatsapp_url || ""),
      whatsapp_button_text: field === "whatsapp_button_text" ? value : (event.whatsapp_button_text || ""),
      whatsapp_description: field === "whatsapp_description" ? value : (event.whatsapp_description || "")
    };
    const nextPaidLinks = [...filtered, currentConfig];
    setEvent((prev: any) => ({
      ...prev,
      [field]: value,
      paid_links: nextPaidLinks
    }));
  };

  // Excluir si es evento cerrado con pago_cupo activo (el carrito manda a checkout en ese caso)
  const isClosed = (event.initial_status ?? "confirmed") === "pending";
  const pagoCupoTag = systemTags.find((t: any) => t.slug === "pago_cupo");
  const isPagoCupo = isClosed && pagoCupoTag && event.tag_ids?.includes(pagoCupoTag.id);

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

        {/* Toggle para Enlace Alternativo a Paso 2 (TYP Externa) */}
        {!isPagoCupo && (
          <>
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-foreground">Enlace Alternativo al Paso 2 (TYP Externa)</Label>
                <p className="text-xs text-muted-foreground">
                  Registra al usuario normalmente, avanza a Paso 2 en pantalla y abre esta página externa de agradecimiento en una nueva ventana.
                </p>
              </div>
              <Switch
                checked={showTypUrl}
                onCheckedChange={handleToggleTypUrl}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {showTypUrl && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">URL de Página de Agradecimiento (TYP)</Label>
                  <InfoTooltip content="URL externa donde será enviado el usuario en una nueva pestaña tras registrarse exitosamente en este evento." />
                </div>
                <Input
                  required={showTypUrl}
                  type="url"
                  value={currentTypConfig.external_typ_url || event.external_typ_url || ""}
                  onChange={(e) => handleUpdateTypUrl(e.target.value)}
                  className="rounded-xl border-border bg-background h-12 focus:bg-background transition-all shadow-sm"
                  placeholder="https://hyenukchu.com/gracias-por-registrarte"
                />
              </div>
            )}
          </>
        )}

        {/* Toggle para Paso 3: Comunidad / WhatsApp */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-foreground">Habilitar Paso 3: Comunidad / WhatsApp</Label>
            <p className="text-xs text-muted-foreground">
              Agrega un paso 3 dinámico en "¿Qué sigue?" del Paso 2 con botón de enlace a tu grupo o comunidad de WhatsApp.
            </p>
          </div>
          <Switch
            checked={showWhatsapp}
            onCheckedChange={handleToggleWhatsapp}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {showWhatsapp && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 p-4 bg-muted/40 rounded-2xl border border-border/60">
            {/* URL del grupo/comunidad */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Enlace de la Comunidad / WhatsApp</Label>
                <InfoTooltip content="URL directa del grupo o canal de WhatsApp (ej: https://chat.whatsapp.com/...)." />
              </div>
              <Input
                required={showWhatsapp}
                type="url"
                value={event.whatsapp_url || ""}
                onChange={(e) => handleUpdateWhatsappField("whatsapp_url", e.target.value)}
                className="rounded-xl border-border bg-background h-12 focus:bg-background transition-all shadow-sm"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>

            {/* Texto del Botón */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Texto del Botón</Label>
                <InfoTooltip content="Texto que aparecerá en el botón verde de acción (por defecto: Unirse al grupo de WhatsApp)." />
              </div>
              <Input
                type="text"
                value={event.whatsapp_button_text || ""}
                onChange={(e) => handleUpdateWhatsappField("whatsapp_button_text", e.target.value)}
                className="rounded-xl border-border bg-background h-12 focus:bg-background transition-all shadow-sm"
                placeholder="Unirse al grupo de WhatsApp"
              />
            </div>

            {/* Descripción del Paso 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Texto Explicativo del Paso 3</Label>
                <InfoTooltip content="Mensaje descriptivo que leerá el usuario sobre por qué unirse al grupo de este evento." />
              </div>
              <Textarea
                value={event.whatsapp_description || ""}
                onChange={(e) => handleUpdateWhatsappField("whatsapp_description", e.target.value)}
                className="rounded-xl border-border bg-background min-h-[80px] focus:bg-background transition-all shadow-sm"
                placeholder="Únete al grupo de WhatsApp de este evento para recibir avisos importantes, recordatorios y contenido exclusivo."
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
