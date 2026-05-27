"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { EventFlag } from "@/components/ui/event-flag";
import { AVAILABLE_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "../event-dialog";

interface IdentitySectionProps {
  event: any;
  setEvent: (event: any) => void;
  categories: any[];
  systemTags: any[];
  isOnline: boolean;
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  event,
  setEvent,
  categories,
  systemTags,
  isOnline,
  isUploading,
  handleFileUpload,
}) => {
  return (
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

        {(() => {
          const selectedCat = categories.find((c: any) => c.id.toString() === event.category_id?.toString());
          const currentParentId = selectedCat?.parent_category_id ? selectedCat.parent_category_id : selectedCat?.id;
          const parentCategories = categories.filter((c: any) => !c.parent_category_id);
          const subcategories = categories.filter((c: any) => c.parent_category_id === currentParentId);
          
          const currentParentName = parentCategories.find((c: any) => c.id === currentParentId)?.name || "Seleccionar categoría padre";
          
          const selectedSubCat = selectedCat?.parent_category_id ? selectedCat : null;
          const currentSubName = selectedSubCat?.name || "Sin subcategoría (Opcional)";

          return (
            <>
              {/* Selector Padre */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Categoría Principal</Label>
                  <InfoTooltip content="Agrupa el evento para los filtros principales (Ej. Giras, Eventos en Línea)." />
                </div>
                <Select
                  value={currentParentId?.toString()}
                  onValueChange={(v) => {
                    const cat = categories.find((c: any) => c.id.toString() === v);
                    const isOnlineCat = cat?.slug === "online" || cat?.slug === "eventos-en-linea";
                    setEvent({
                      ...event,
                      category_id: v, // Se asigna al padre por defecto
                      is_virtual: isOnlineCat,
                      flag: isOnlineCat ? "WEB" : event.flag,
                    });
                  }}
                >
                  <SelectTrigger className="rounded-xl border-border bg-muted/50 h-12">
                    <SelectValue placeholder="Seleccionar categoría">{currentParentName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border shadow-xl bg-popover">
                    {parentCategories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg cursor-pointer">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bandera / Imagen Personalizada */}
              <div className="space-y-2 relative">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground whitespace-nowrap">Imagen o Bandera</Label>
                  <InfoTooltip content="Sube una imagen cuadrada (1:1) máximo 2MB, o usa un código ISO de 2 letras del país. Ej: PE = Perú, MX = México." />
                </div>

                <div className="flex gap-2 items-center">
                  {isOnline ? (
                    <Popover>
                      <PopoverTrigger className="shrink-0 group outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50 transition-all">
                        <EventFlag 
                          flag={event.flag?.startsWith("icon:") ? event.flag : "WEB"} 
                          imageUrl={event.image_url}
                          className="size-12 rounded-xl ring-1 ring-inset ring-border/50 group-hover:ring-primary/50 transition-all shadow-none pointer-events-none" 
                          bgClass="bg-muted/50" 
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 bg-popover border-border shadow-xl rounded-2xl" side="bottom" align="start">
                        <p className="text-xs font-bold text-muted-foreground mb-2">Seleccionar ícono</p>
                        <div className="grid grid-cols-4 gap-2">
                          {AVAILABLE_ICONS.map((item) => {
                            const IconComponent = item.icon;
                            // Considerar WEB como el equivalente a Globe por retrocompatibilidad visual
                            const isWebDefault = item.name === "Globe" && (!event.flag || event.flag === "WEB" || !event.flag.startsWith("icon:"));
                            const isActive = event.flag === `icon:${item.name}` || isWebDefault;
                            
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => setEvent({ ...event, flag: `icon:${item.name}` })}
                                className={cn(
                                  "p-2 rounded-xl flex items-center justify-center transition-all outline-none",
                                  isActive 
                                    ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary" 
                                    : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                              >
                                <IconComponent className="size-5" strokeWidth={1.5} />
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <EventFlag 
                      flag={event.flag} 
                      imageUrl={event.image_url}
                      className="size-12 rounded-xl shrink-0 border border-border/50" 
                      bgClass="bg-muted" 
                    />
                  )}
                  {isOnline ? (
                    <div className="flex-1 h-12 rounded-xl bg-muted border border-border flex items-center px-4">
                      <span className="text-sm font-bold text-muted-foreground">Evento Global (Web)</span>
                    </div>
                  ) : (
                    <Input
                      required={!event.image_url}
                      value={event.flag}
                      onChange={(e) => setEvent({ ...event, flag: e.target.value.toUpperCase() })}
                      className="rounded-xl border-border bg-muted/50 h-12 font-mono flex-1 focus:bg-background transition-all"
                      placeholder="PE"
                      maxLength={2}
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-1">
                  <Label htmlFor="event-image-upload" className="cursor-pointer text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5">
                    {isUploading ? "Subiendo..." : "Subir Imagen Personalizada"}
                  </Label>
                  <Input 
                    id="event-image-upload" 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {event.image_url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      type="button"
                      className="h-7 px-2 text-destructive hover:bg-destructive/10 text-[10px] rounded-full"
                      onClick={() => setEvent({ ...event, image_url: null })}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>

              {/* Selector Hijo (Subcategoría) - Abarcando todo el ancho */}
              {subcategories.length > 0 && (
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-black uppercase text-muted-foreground">Subcategoría</Label>
                    <InfoTooltip content="Clasificación específica (Ej. Webinar, Retiro). Si no seleccionas ninguna, quedará solo en la categoría principal." />
                  </div>
                  <Select
                    value={selectedSubCat ? selectedSubCat.id.toString() : "none"}
                    onValueChange={(v) => {
                      if (v === "none") {
                        setEvent({ ...event, category_id: currentParentId });
                      } else {
                        setEvent({ ...event, category_id: v });
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-border bg-muted/50 h-12">
                      <SelectValue placeholder="Sin subcategoría">{currentSubName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border shadow-xl bg-popover">
                      <SelectItem value="none" className="rounded-lg cursor-pointer italic text-muted-foreground">
                        Sin subcategoría (Opcional)
                      </SelectItem>
                      {subcategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg cursor-pointer">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          );
        })()}

        {/* Selector de Tags */}
        <div className="md:col-span-2 space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-black uppercase text-muted-foreground">Etiquetas del Sistema (Tags)</Label>
            <InfoTooltip content="Selecciona etiquetas especiales para habilitar comportamientos del sistema (como redirecciones de pago)." />
          </div>
          <div className="flex flex-wrap gap-2">
            {systemTags.map((tag: any) => {
              const isSelected = event.tag_ids?.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    const currentTags = event.tag_ids || [];
                    const nextTags = isSelected
                      ? currentTags.filter((id: string) => id !== tag.id)
                      : [...currentTags, tag.id];
                    setEvent({ ...event, tag_ids: nextTags });
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                      : "bg-muted/40 hover:bg-muted/80 text-muted-foreground border-border"
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
            {systemTags.length === 0 && (
              <span className="text-xs italic text-muted-foreground">No hay etiquetas de sistema disponibles.</span>
            )}
          </div>
        </div>

        {/* Campos condicionales para Pago */}
        {(() => {
          const pagoTag = systemTags.find((t: any) => t.slug === "pago");
          const isPaidEvent = pagoTag && event.tag_ids?.includes(pagoTag.id);
          if (!isPaidEvent) return null;
          return (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-primary/5 rounded-[24px] border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-300 mt-4">
              <div className="md:col-span-2 space-y-1">
                <h4 className="text-xs font-black uppercase text-primary tracking-wide">Configuración de Evento Pago</h4>
                <p className="text-[11px] text-muted-foreground">Este evento redirigirá a un enlace externo en lugar del flujo de registro local.</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Enlace de Compra / Redirección</Label>
                  <span className="text-[10px] text-red-500 font-bold">*</span>
                </div>
                <Input
                  required={isPaidEvent}
                  type="url"
                  value={event.external_url || ""}
                  onChange={(e) => setEvent({ ...event, external_url: e.target.value })}
                  className="rounded-xl border-border bg-background h-12 focus:bg-background transition-all shadow-sm"
                  placeholder="https://hotmart.com/... o https://pay.chu.com/..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Texto del Botón</Label>
                </div>
                <Input
                  value={event.external_button_text || ""}
                  onChange={(e) => setEvent({ ...event, external_button_text: e.target.value })}
                  className="rounded-xl border-border bg-background h-12 focus:bg-background transition-all shadow-sm"
                  placeholder="Adquiere tu entrada (Por defecto)"
                />
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
