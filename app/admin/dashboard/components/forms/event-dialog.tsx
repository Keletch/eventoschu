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
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { KeapTagPicker } from "./keap-tag-picker";

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
  { value: "bg-neutral-100", label: "Gris Neutro", preview: "bg-neutral-300" },
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] border-none shadow-2xl p-0 dialog-content-anim">
        <div className="overflow-y-auto max-h-[90vh] no-scrollbar">
        {/* Header */}
        <DialogHeader className="p-8 bg-neutral-900 text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="relative z-10">
            <DialogTitle className="text-3xl font-black">
              {event.id ? "Editar Evento" : "Crear Nuevo Evento"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400 font-medium">
              Configura los detalles del evento para tus usuarios.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-8 space-y-8 bg-white">

          {/* ── Sección 1: Identidad ── */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">
              Identidad del Evento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Título — ancho completo */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Título del Evento</Label>
                <Input
                  required
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  className="rounded-xl border-neutral-100 bg-neutral-50 h-12"
                  placeholder="Ej: Meetup: Lima"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Categoría</Label>
                <Select
                  value={event.category_id?.toString()}
                  onValueChange={(v) => setEvent({ ...event, category_id: v })}
                >
                  <SelectTrigger className="rounded-xl border-neutral-100 bg-neutral-50 h-12">
                    <SelectValue placeholder="Seleccionar categoría">
                      {categories.find(c => c.id.toString() === event.category_id?.toString())?.name ?? "Seleccionar categoría"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-neutral-100 shadow-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg cursor-pointer">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bandera ISO con preview SVG */}
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Código de Bandera (ISO)</Label>
                <div className="flex gap-2 items-center">
                  <EventFlag 
                    flag={event.flag} 
                    className="size-12 rounded-xl" 
                    bgClass="bg-neutral-100" 
                  />
                  <Input
                    required
                    value={event.flag}
                    onChange={(e) => setEvent({ ...event, flag: e.target.value.toUpperCase() })}
                    className="rounded-xl border-neutral-100 bg-neutral-50 h-12 font-mono flex-1"
                    placeholder="PE"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Sección 2: Lugar y Fecha ── */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">
              Lugar y Fecha
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Ciudad</Label>
                <Input
                  required
                  value={event.city}
                  onChange={(e) => setEvent({ ...event, city: e.target.value })}
                  className="rounded-xl border-neutral-100 bg-neutral-50 h-12"
                  placeholder="Ej: Lima"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">País</Label>
                <Input
                  required
                  value={event.country}
                  onChange={(e) => setEvent({ ...event, country: e.target.value })}
                  className="rounded-xl border-neutral-100 bg-neutral-50 h-12"
                  placeholder="Ej: Perú"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Ubicación / Venue</Label>
                <Input
                  required
                  value={event.location}
                  onChange={(e) => setEvent({ ...event, location: e.target.value })}
                  className="rounded-xl border-neutral-100 bg-neutral-50 h-12"
                  placeholder="Ej: Hotel Estelar, Sala Principal"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Fecha de Inicio</Label>
                <Input
                  type={isDateConfirm ? "text" : "date"}
                  required={!isDateConfirm}
                  value={isDateConfirm ? "Por confirmar" : event.start_date}
                  onChange={(e) => setEvent({ ...event, start_date: e.target.value })}
                  disabled={isDateConfirm}
                  className={cn(
                    "rounded-xl h-12 transition-all border-neutral-100",
                    isDateConfirm
                      ? "bg-neutral-100 text-neutral-400 opacity-60 border-dashed"
                      : "bg-neutral-50"
                  )}
                />
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    ¿Por confirmar?
                  </span>
                  <Switch
                    checked={isDateConfirm}
                    onCheckedChange={(val) =>
                      setEvent({ ...event, start_date: val ? "2099-12-31" : "" })
                    }
                    className="scale-[0.75] data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>

              {/* Hora con toggle "Por confirmar" */}
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Hora</Label>
                <Input
                  type={isTimeConfirm ? "text" : "time"}
                  required={!isTimeConfirm}
                  value={event.time}
                  onChange={(e) => setEvent({ ...event, time: e.target.value })}
                  disabled={isTimeConfirm}
                  className={cn(
                    "rounded-xl h-12 transition-all border-neutral-100",
                    isTimeConfirm
                      ? "bg-neutral-100 text-neutral-400 opacity-60 border-dashed"
                      : "bg-neutral-50"
                  )}
                />
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    ¿Por confirmar?
                  </span>
                  <Switch
                    checked={isTimeConfirm}
                    onCheckedChange={(val) =>
                      setEvent({ ...event, time: val ? "Por confirmar" : "19:00" })
                    }
                    className="scale-[0.75] data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Duración</Label>
                <Input
                  required
                  value={event.duration}
                  onChange={(e) => setEvent({ ...event, duration: e.target.value })}
                  className="rounded-xl border-neutral-100 bg-neutral-50 h-12"
                  placeholder="Ej: Aproximadamente 2 horas"
                />
              </div>
            </div>
          </section>

          {/* ── Sección 3: Capacidad y Precio ── */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">
              Capacidad y Precio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Precio</Label>
                <Input
                  required
                  value={event.price}
                  onChange={(e) => setEvent({ ...event, price: e.target.value })}
                  className="rounded-xl border-neutral-100 bg-neutral-50 h-12"
                  placeholder="Ej: 30 USD"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-neutral-400">Capacidad Máxima</Label>
                <Input
                  type="number"
                  required
                  value={event.capacity}
                  onChange={(e) => setEvent({ ...event, capacity: parseInt(e.target.value) || 0 })}
                  className="rounded-xl border-neutral-100 bg-neutral-50 h-12"
                />
              </div>
            </div>
          </section>

          {/* ── Sección 4: Visual ── */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">
              Apariencia Visual
            </h3>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-neutral-400">Color de Fondo de la Tarjeta</Label>
              <div className="grid grid-cols-3 gap-2">
                {BG_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEvent({ ...event, bg_class: opt.value })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                      event.bg_class === opt.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-neutral-100 bg-neutral-50 text-neutral-500 hover:border-neutral-200"
                    )}
                  >
                    <span className={cn("w-4 h-4 rounded-full shrink-0", opt.preview)} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Sección 5: Integración Keap ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Integración Keap CRM
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefreshTags}
                disabled={isTagsLoading}
                className="h-6 gap-2 text-blue-600 hover:bg-blue-50 rounded-lg px-2"
              >
                <RefreshCw className={cn("h-3 w-3", isTagsLoading && "animate-spin")} />
                <span className="text-[10px] font-bold uppercase">Sincronizar Tags</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-xs font-black uppercase text-neutral-400">
                    Tag: Pendiente {event.initial_status === "pending" && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
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
                  <div className="h-12 flex items-center justify-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                    <span className="text-xs text-neutral-400 italic">Tag de pendiente deshabilitado</span>
                  </div>
                )}
                {event.initial_status === "pending" && !event.keap_pending_tag_id && (
                  <p className="text-[10px] text-red-500 font-bold animate-pulse px-1">Debes seleccionar un tag para el modo cerrado</p>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center min-h-[24px] px-1">
                  <Label className="text-xs font-black uppercase text-neutral-400">Tag: Confirmado <span className="text-red-500">*</span></Label>
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

          {/* ── Sección 6: Estado y Prioridad ── */}
          <div className="space-y-6 p-6 bg-neutral-50 rounded-[32px] border border-neutral-100">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="size-2 rounded-full bg-blue-500" />
                <Label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Método de Captura</Label>
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
                  setEvent({ ...event, ...updates });
                }}
              >
                <SelectTrigger className="rounded-xl border-neutral-200 bg-white h-12 shadow-sm">
                  <SelectValue placeholder="Seleccionar método">
                    {event.initial_status === "pending" ? "Evento Cerrado" : "Evento Abierto"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-neutral-100 shadow-xl">
                  <SelectItem value="confirmed" className="rounded-lg cursor-pointer py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-600">Evento Abierto</span>
                      <span className="text-[10px] text-neutral-500">Confirmación automática hasta límite de cupo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending" className="rounded-lg cursor-pointer py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-amber-600">Evento Cerrado</span>
                      <span className="text-[10px] text-neutral-500">Lista de espera y validación manual</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200/60">
              <div>
                <Label className="text-sm font-bold text-neutral-800">Visibilidad del Evento</Label>
                <p className="text-xs text-neutral-500 italic">¿Deseas que este evento sea visible en la web?</p>
              </div>
              <Switch
                checked={event.active}
                onCheckedChange={(v) => setEvent({ ...event, active: v })}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl h-12 px-6 font-bold hover:bg-neutral-100 transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (event.initial_status === "pending" && !event.keap_pending_tag_id) || !event.keap_tag_id}
              className="rounded-xl h-12 px-8 bg-blue-700 hover:bg-blue-800 text-white font-black shadow-lg shadow-blue-200 transition-all gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {event.id ? "Guardar Cambios" : "Publicar Evento"}
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
