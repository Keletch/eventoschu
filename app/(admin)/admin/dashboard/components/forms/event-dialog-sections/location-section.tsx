"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "../event-dialog";

interface LocationSectionProps {
  event: any;
  setEvent: (event: any) => void;
  isOnline: boolean;
}

const TIMEZONE_LABELS: Record<string, string> = {
  "none": "Sin huso horario",
  "America/Mexico_City": "Ciudad de México (CDMX)",
  "America/Bogota": "Bogotá / Lima / Quito",
  "America/New_York": "Miami / Nueva York (EST)",
  "America/Argentina/Buenos_Aires": "Buenos Aires (ARG)",
  "America/Santiago": "Santiago (CHL)",
  "Europe/Madrid": "Madrid (España)",
};

export const LocationSection: React.FC<LocationSectionProps> = ({ event, setEvent, isOnline }) => {
  const isTimeConfirm = event.time === "Por confirmar";
  const isDateConfirm = event.start_date?.startsWith("2099");
  const isDurationConfirm = event.duration === "Por confirmar";

  return (
    <section className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
        Lugar y Fecha
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {!isOnline && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Ciudad</Label>
                <InfoTooltip content="Nombre de la ciudad donde se realizará el evento. Se muestra en la tarjeta pública bajo el título." />
              </div>
              <Input
                required
                value={event.city}
                onChange={(e) => setEvent({ ...event, city: e.target.value })}
                className="rounded-xl border-border bg-muted/50 h-12 focus:bg-background transition-all"
                placeholder="Ej: Lima"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">País</Label>
                <InfoTooltip content="País donde se celebra el evento. Se muestra junto a la ciudad en la tarjeta. Ej: Perú, México, Colombia." />
              </div>
              <Input
                required
                value={event.country}
                onChange={(e) => setEvent({ ...event, country: e.target.value })}
                className="rounded-xl border-border bg-muted/50 h-12 focus:bg-background transition-all"
                placeholder="Ej: Perú"
              />
            </div>
          </>
        )}

        {/* Ubicación — condicional según modalidad */}
        {isOnline ? (
          <>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Título del Enlace (Plataforma)</Label>
                <InfoTooltip content="Texto del botón o enlace que verá el usuario. Ej: 'Unirse al Webinar', 'Acceder al Zoom'." />
              </div>
              <Input
                value={event.subtitle || ""}
                onChange={(e) => setEvent({ ...event, subtitle: e.target.value })}
                className="rounded-xl border-border bg-muted/50 h-12 focus:bg-background transition-all"
                placeholder="Ej: Unirse al Webinar de Trading"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">URL de la Plataforma</Label>
                <InfoTooltip content="URL completa del evento online (Zoom, Google Meet, Teams, etc.). Debe empezar con https://." />
              </div>
              <Input
                type={event.is_virtual ? "url" : "text"}
                value={event.location || ""}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                className="rounded-xl border-border bg-muted/50 h-12 font-mono text-sm focus:bg-background transition-all"
                placeholder={event.is_virtual ? "https://zoom.us/j/123456789" : "Ej: Por definir, #"}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
              <div>
                <Label className="text-sm font-bold text-foreground">Acceso a la plataforma</Label>
                <p className="text-xs text-muted-foreground italic">Al desactivar, el enlace aparece bloqueado en la tarjeta.</p>
              </div>
              <div className="flex items-center gap-2">
                <InfoTooltip content="Controla si el enlace es clickeable. Útil para publicar el evento antes de que el link esté listo." />
                <Switch
                  checked={!!event.is_virtual}
                  onCheckedChange={(v) => setEvent({ ...event, is_virtual: v })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-black uppercase text-muted-foreground">Ubicación / Venue</Label>
              <InfoTooltip content="Dirección o nombre completo del lugar. Se muestra en la tarjeta como 'Sitio'. Si aún no está definido, escribe 'Sitio por confirmar en [Ciudad]'." />
            </div>
            <Input
              required
              value={event.location || ""}
              onChange={(e) => setEvent({ ...event, location: e.target.value })}
              className="rounded-xl border-border bg-muted/50 h-12 focus:bg-background transition-all"
              placeholder="Ej: Hotel Estelar, Sala Principal"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-black uppercase text-muted-foreground">Fecha de Inicio</Label>
            <InfoTooltip content="Si la fecha aún no está confirmada, activa el toggle '¿Por confirmar?'. El sistema guarda la fecha 2099-12-31 y muestra 'Por confirmar' al usuario." />
          </div>
          <Input
            type={isDateConfirm ? "text" : "date"}
            required={!isDateConfirm}
            value={isDateConfirm ? "Por confirmar" : (event.start_date || "")}
            onChange={(e) => setEvent({ ...event, start_date: e.target.value })}
            disabled={isDateConfirm}
            className={cn(
              "rounded-xl h-12 transition-all border-border",
              isDateConfirm
                ? "bg-muted text-muted-foreground opacity-60 border-dashed"
                : "bg-muted/50 focus:bg-background"
            )}
          />
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              ¿Por confirmar?
            </span>
            <Switch
              checked={isDateConfirm}
              onCheckedChange={(val) =>
                setEvent({ ...event, start_date: val ? "2099-12-31" : "" })
              }
              className="scale-[0.75] data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Hora con toggle "Por confirmar" */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-black uppercase text-muted-foreground">Hora</Label>
            <InfoTooltip content="Hora local del evento en el país destino. Si aún no se ha definido, activa el toggle '¿Por confirmar?' para mostrar ese texto al usuario." />
          </div>
          <Input
            type={isTimeConfirm ? "text" : "time"}
            required={!isTimeConfirm}
            value={event.time || ""}
            onChange={(e) => setEvent({ ...event, time: e.target.value })}
            disabled={isTimeConfirm}
            className={cn(
              "rounded-xl h-12 transition-all border-border w-full",
              isTimeConfirm
                ? "bg-muted text-muted-foreground opacity-60 border-dashed"
                : "bg-muted/50 focus:bg-background"
            )}
          />
          <div className="flex items-center justify-end gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              ¿Por confirmar?
            </span>
            <Switch
              checked={isTimeConfirm}
              onCheckedChange={(val) =>
                setEvent({ ...event, time: val ? "Por confirmar" : "19:00" })
              }
              className="scale-[0.75] data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Huso Horario */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-black uppercase text-muted-foreground">Zona Horaria</Label>
            <InfoTooltip content="Huso horario oficial del evento. Sirve para estandarizar la hora y generar recordatorios o enlaces de calendario." />
          </div>
          <Select
            value={event.timezone || "none"}
            onValueChange={(v) => setEvent({ ...event, timezone: v === "none" ? null : v })}
            disabled={isTimeConfirm}
          >
            <SelectTrigger className={cn(
              "rounded-xl h-12 border-border w-full truncate pr-2",
              isTimeConfirm ? "bg-muted text-muted-foreground opacity-60 border-dashed" : "bg-muted/50 focus:bg-background transition-all"
            )}>
              <SelectValue placeholder="Zona Horaria">
                {TIMEZONE_LABELS[event.timezone || "none"] || "Zona Horaria"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-popover shadow-xl">
              <SelectItem value="none" className="italic text-muted-foreground rounded-lg cursor-pointer">Sin huso horario (Opcional)</SelectItem>
              <SelectItem value="America/Mexico_City" className="rounded-lg cursor-pointer">Ciudad de México (CDMX)</SelectItem>
              <SelectItem value="America/Bogota" className="rounded-lg cursor-pointer">Bogotá / Lima / Quito</SelectItem>
              <SelectItem value="America/New_York" className="rounded-lg cursor-pointer">Miami / Nueva York (EST)</SelectItem>
              <SelectItem value="America/Argentina/Buenos_Aires" className="rounded-lg cursor-pointer">Buenos Aires (ARG)</SelectItem>
              <SelectItem value="America/Santiago" className="rounded-lg cursor-pointer">Santiago (CHL)</SelectItem>
              <SelectItem value="Europe/Madrid" className="rounded-lg cursor-pointer">Madrid (España)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duración */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-black uppercase text-muted-foreground">Duración</Label>
            <InfoTooltip content="Tiempo estimado del evento. Se muestra como texto libre. Ej: 'Aproximadamente 2 horas', '1 día completo'." />
          </div>
          <Input
            required={!isDurationConfirm}
            value={isDurationConfirm ? "Por confirmar" : (event.duration || "")}
            onChange={(e) => setEvent({ ...event, duration: e.target.value })}
            disabled={isDurationConfirm}
            className={cn(
              "rounded-xl border-border h-12 transition-all w-full",
              isDurationConfirm
                ? "bg-muted text-muted-foreground opacity-60 border-dashed"
                : "bg-muted/50 focus:bg-background"
            )}
            placeholder="Ej: Aproximadamente 2 horas"
          />
          <div className="flex items-center justify-end gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              ¿Por confirmar?
            </span>
            <Switch
              checked={isDurationConfirm}
              onCheckedChange={(val) =>
                setEvent({ ...event, duration: val ? "Por confirmar" : "Aproximadamente 2 horas" })
              }
              className="scale-[0.75] data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
