"use client";

import React from "react";
import { EventFlag } from "@/components/ui/event-flag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { KeapTagPicker } from "./keap-tag-picker";

/** Ícono circular "i" con tooltip para guiar a nuevos admins */
function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="size-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-black hover:bg-primary/10 hover:text-primary transition-all cursor-help shrink-0 border border-border"
      >
        i
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  event: any;
  setEvent: (event: any) => void;
  categories: any[];
  keapTags: any[];
  isTagsLoading: boolean;
  onRefreshTags: () => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const BG_COLOR_OPTIONS = [
  { value: "bg-sky-100", label: "Azul Cielo", preview: "bg-sky-200" },
  { value: "bg-emerald-100", label: "Verde Esmeralda", preview: "bg-emerald-200" },
  { value: "bg-amber-100", label: "Ámbar", preview: "bg-amber-200" },
  { value: "bg-rose-100", label: "Rosa", preview: "bg-rose-200" },
  { value: "bg-purple-100", label: "Púrpura", preview: "bg-purple-200" },
  { value: "custom", label: "Personalizado", preview: "bg-gradient-to-tr from-red-400 via-green-400 to-blue-400" },
];

export const EventDialog: React.FC<EventDialogProps> = ({
  isOpen,
  setIsOpen,
  event,
  setEvent,
  categories,
  keapTags,
  isTagsLoading,
  onRefreshTags,
  isSubmitting,
  onSubmit,
}) => {
  const isTimeConfirm = event.time === "Por confirmar";
  const isDateConfirm = event.start_date?.startsWith("2099");
  // Evento Abierto (confirmed) puede ser ilimitado. Evento Cerrado (pending) no.
  const isOpenMode = (event.initial_status ?? "confirmed") !== "pending";
  const isUnlimited = (event.capacity ?? 0) >= 9999;
  // Detectar si la categoría seleccionada es "Eventos en linea" por su slug
  const selectedCategory = categories.find(
    (c: any) => c.id.toString() === event.category_id?.toString()
  );
  const isOnline = selectedCategory?.slug === "online" || !!event.is_virtual;

  return (
    <TooltipProvider delay={200}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] border-none shadow-2xl p-0 dialog-content-anim">
          <div className="overflow-y-auto max-h-[90vh] no-scrollbar">
            {/* Header */}
            <DialogHeader className="p-8 bg-secondary text-secondary-foreground relative overflow-hidden shrink-0 border-b border-border">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] brightness-0 invert" />
              <div className="relative z-10">
                <DialogTitle className="text-3xl font-black">
                  {event.id ? "Editar Evento" : "Crear Nuevo Evento"}
                </DialogTitle>
                <DialogDescription className="text-secondary-foreground/70 font-medium">
                  Configura los detalles del evento para tus usuarios.
                </DialogDescription>
              </div>
            </DialogHeader>

            <form onSubmit={onSubmit} className="p-8 space-y-8 bg-card text-foreground">
              {/* ── Sección 0: Tipo de Evento ── */}
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
                      if (v === "pending" && event.keap_pending_tag_id === null) {
                        updates.keap_pending_tag_id = "";
                      } else if (v === "confirmed") {
                        updates.keap_pending_tag_id = null;
                      }
                      if (v === "pending" && (event.capacity ?? 0) >= 9999) {
                        updates.capacity = 50;
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

              {/* ── Sección 1: Identidad ── */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                  Identidad del Evento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-black uppercase text-muted-foreground">Título del Evento</Label>
                      <InfoTooltip content="El nombre público que verán los usuarios en la tarjeta del evento en el Home." />
                    </div>
                    <Input
                      required
                      value={event.title}
                      onChange={(e) => setEvent({ ...event, title: e.target.value })}
                      className="rounded-xl border-border bg-muted/50 h-12 focus:bg-background transition-all"
                      placeholder="Ej: Meetup: Lima"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-black uppercase text-muted-foreground">Categoría</Label>
                      <InfoTooltip content="Agrupa el evento para los filtros de la web (Gira, Taller, Meetup). Determina en qué pestaña aparece." />
                    </div>
                    <Select
                      value={event.category_id?.toString()}
                      onValueChange={(v) => {
                        const cat = categories.find((c: any) => c.id.toString() === v);
                        const isOnlineCat = cat?.slug === "online";
                        setEvent({
                          ...event,
                          category_id: v,
                          is_virtual: isOnlineCat,
                          flag: isOnlineCat ? "WEB" : event.flag,
                        });
                      }}
                    >
                      <SelectTrigger className="rounded-xl border-border bg-muted/50 h-12">
                        <SelectValue placeholder="Seleccionar categoría">
                          {categories.find(c => c.id.toString() === event.category_id?.toString())?.name ?? "Seleccionar categoría"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border shadow-xl bg-popover">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg cursor-pointer">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-black uppercase text-muted-foreground">Código de Bandera (ISO)</Label>
                      <InfoTooltip content="Código ISO de 2 letras del país. Ej: PE = Perú, MX = México, CO = Colombia, ES = España." />
                    </div>
                    <div className="flex gap-2 items-center">
                      <EventFlag 
                        flag={isOnline ? "WEB" : event.flag} 
                        className="size-12 rounded-xl shrink-0 border border-border/50" 
                        bgClass="bg-muted" 
                      />
                      {isOnline ? (
                        <div className="flex-1 h-12 rounded-xl bg-muted border border-border flex items-center px-4">
                          <span className="text-sm font-bold text-muted-foreground">Evento Global (Web)</span>
                        </div>
                      ) : (
                        <Input
                          required
                          value={event.flag}
                          onChange={(e) => setEvent({ ...event, flag: e.target.value.toUpperCase() })}
                          className="rounded-xl border-border bg-muted/50 h-12 font-mono flex-1 focus:bg-background transition-all"
                          placeholder="PE"
                          maxLength={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Sección 2: Lugar y Fecha ── */}
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
                        "rounded-xl h-12 transition-all border-border",
                        isTimeConfirm
                          ? "bg-muted text-muted-foreground opacity-60 border-dashed"
                          : "bg-muted/50 focus:bg-background"
                      )}
                    />
                    <div className="flex items-center justify-end gap-2">
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

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-black uppercase text-muted-foreground">Duración</Label>
                      <InfoTooltip content="Tiempo estimado del evento. Se muestra como texto libre. Ej: 'Aproximadamente 2 horas', '1 día completo'." />
                    </div>
                    <Input
                      required
                      value={event.duration || ""}
                      onChange={(e) => setEvent({ ...event, duration: e.target.value })}
                      className="rounded-xl border-border bg-muted/50 h-12 focus:bg-background transition-all"
                      placeholder="Ej: Aproximadamente 2 horas"
                    />
                  </div>
                </div>
              </section>

              {/* ── Sección 3: Capacidad y Precio ── */}
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

              {/* ── Sección 4: Visual ── */}
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

              {/* ── Sección 5: Integración Keap ── */}
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

              <DialogFooter className="pt-2 gap-3 p-8 bg-muted/30 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl h-12 px-6 font-bold hover:bg-muted transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (event.initial_status === "pending" && !event.keap_pending_tag_id) || !event.keap_tag_id}
                  className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {event.id ? "Guardar Cambios" : "Publicar Evento"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
