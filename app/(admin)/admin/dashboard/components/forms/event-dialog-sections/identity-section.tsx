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
import { Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { KeapTagPicker } from "../keap-tag-picker";

interface IdentitySectionProps {
  event: any;
  setEvent: (event: any) => void;
  categories: any[];
  systemTags: any[];
  keapTags: any[];
  isOnline: boolean;
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  event,
  setEvent,
  categories,
  systemTags,
  keapTags = [],
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
            {(() => {
              const isClosed = (event.initial_status ?? "confirmed") === "pending";
              return systemTags.map((tag: any) => {
                const isPagoTag = tag.slug === "pago";
                const isPagoCupoTag = tag.slug === "pago_cupo";
                // Pago tradicional solo para Abierto. Pago con cupo solo para Cerrado.
                const isDisabled = (isClosed && isPagoTag) || (!isClosed && isPagoCupoTag);
                const isSelected = event.tag_ids?.includes(tag.id) && !isDisabled;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      const currentTags = event.tag_ids || [];
                      const nextTags = isSelected
                        ? currentTags.filter((id: string) => id !== tag.id)
                        : [...currentTags, tag.id];
                      setEvent({ ...event, tag_ids: nextTags });
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                      isDisabled
                        ? "opacity-35 cursor-not-allowed bg-muted/20 text-muted-foreground/60 border-border/40"
                        : isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105 cursor-pointer"
                        : "bg-muted/40 hover:bg-muted/80 text-muted-foreground border-border cursor-pointer"
                    )}
                  >
                    {tag.name}
                  </button>
                );
              });
            })()}
            {systemTags.length === 0 && (
              <span className="text-xs italic text-muted-foreground">No hay etiquetas de sistema disponibles.</span>
            )}
          </div>
        </div>

        {/* Campos condicionales para Pago */}
        {(() => {
          const isClosed = (event.initial_status ?? "confirmed") === "pending";
          if (isClosed) return null;

          const pagoTag = systemTags.find((t: any) => t.slug === "pago");
          const isPaidEvent = pagoTag && event.tag_ids?.includes(pagoTag.id);
          if (!isPaidEvent) return null;

          const paidLinks = event.paid_links || [];

          const handleAddPaidLink = () => {
            const updated = [...paidLinks, { url: "", button_text: "", keap_tag_id: "" }];
            setEvent({ ...event, paid_links: updated });
          };

          const handleUpdatePaidLink = (index: number, field: string, value: string) => {
            const updated = [...paidLinks];
            updated[index] = { ...updated[index], [field]: value };
            setEvent({ ...event, paid_links: updated });
          };

          const handleRemovePaidLink = (index: number) => {
            const updated = paidLinks.filter((_: any, i: number) => i !== index);
            setEvent({ ...event, paid_links: updated });
          };

          return (
            <div className="md:col-span-2 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 mt-4">

              {/* ── Enlace predeterminado (para todos) ── */}
              <div className="p-5 bg-muted/30 rounded-[20px] border border-border/50 space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase text-foreground tracking-wide">Enlace Predeterminado</h4>
                  <p className="text-[11px] text-muted-foreground">Es el enlace que verán todos los usuarios sin membresía o sin tag asignado. Obligatorio si el evento es de pago.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">URL del enlace de compra</Label>
                    <Input
                      type="url"
                      value={event.external_url || ""}
                      onChange={(e) => setEvent({ ...event, external_url: e.target.value })}
                      className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all"
                      placeholder="https://hotmart.com/... o https://pay.chu.com/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Texto del Botón</Label>
                    <Input
                      value={event.external_button_text || ""}
                      onChange={(e) => setEvent({ ...event, external_button_text: e.target.value })}
                      className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all"
                      placeholder="Adquirir entrada"
                    />
                  </div>
                </div>
              </div>

              {/* ── Links condicionados por tag de Keap ── */}
              <div className="p-5 bg-muted/30 rounded-[20px] border border-border/50 space-y-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase text-foreground tracking-wide">Enlaces Exclusivos por Membresía (Opcional)</h4>
                  <p className="text-[11px] text-muted-foreground">Configura enlaces adicionales con cupones o accesos especiales. Solo los verán los usuarios que tengan el tag de Keap correspondiente. Se evalúan en cascada: el último que coincida gana.</p>
                </div>

              {paidLinks.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-border rounded-xl space-y-2">
                  <p className="text-xs text-muted-foreground">No hay enlaces condicionados configurados.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPaidLink}
                    className="rounded-xl text-xs"
                  >
                    <Plus className="size-3.5 mr-1" /> Agregar Enlace
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paidLinks.map((link: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-background/50 rounded-xl border border-border/50 items-end">
                      <div className="md:col-span-5 space-y-2">
                        <div className="flex items-center min-h-6">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground">URL del Enlace Exclusivo</Label>
                        </div>
                        <Input
                          required
                          type="url"
                          value={link.url || ""}
                          onChange={(e) => handleUpdatePaidLink(index, "url", e.target.value)}
                          className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all"
                          placeholder="https://hotmart.com/... o https://pay.chu.com/..."
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <div className="flex items-center min-h-6">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground">Precio Especial (Opcional)</Label>
                        </div>
                        <Input
                          value={link.price || ""}
                          onChange={(e) => handleUpdatePaidLink(index, "price", e.target.value)}
                          className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all"
                          placeholder="Ej: 197 USD"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <KeapTagPicker
                          label="Tag Requerido (Keap)"
                          value={link.keap_tag_id || ""}
                          onChange={(tagId) => handleUpdatePaidLink(index, "keap_tag_id", tagId)}
                          tags={keapTags}
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-center pb-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePaidLink(index)}
                          className="text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer size-10"
                          title="Eliminar enlace"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPaidLink}
                      className="rounded-xl text-xs"
                    >
                      <Plus className="size-3.5 mr-1" /> Agregar Enlace
                    </Button>
                  </div>
                </div>
              )}
              </div>{/* end bg-muted/30 */}
            </div>
          );
        })()}

        {/* Campos condicionales para Pago con Cupo (Eventos Cerrados) */}
        {(() => {
          const isClosed = (event.initial_status ?? "confirmed") === "pending";
          if (!isClosed) return null;

          const pagoCupoTag = systemTags.find((t: any) => t.slug === "pago_cupo");
          const isPagoCupoActive = pagoCupoTag && event.tag_ids?.includes(pagoCupoTag.id);
          if (!isPagoCupoActive) return null;

          const paidLinks = event.paid_links || [];
          const currentConfig = paidLinks.find((l: any) => l.type === "pago_cupo_config") || {
            type: "pago_cupo_config",
            url: "",
            checkout_url: "",
            checkout_button_text: "Adquirir entrada",
            waitlist_button_text: "Únete a la lista de espera",
            use_external_waitlist: false,
            paid_waitlist_url: ""
          };

          const updateConfig = (field: string, value: any) => {
            const nextConfig = { ...currentConfig, [field]: value };
            if (field === "checkout_url") {
              nextConfig.url = value;
            }
            const filtered = paidLinks.filter((l: any) => l.type !== "pago_cupo_config");
            setEvent({ ...event, paid_links: [...filtered, nextConfig] });
          };

          return (
            <div className="md:col-span-2 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 mt-4">
              <div className="p-5 bg-muted/30 rounded-[20px] border border-border/50 space-y-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <h4 className="text-xs font-black uppercase text-foreground tracking-wide">Configuración de Pago con Cupo</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Define la URL de compra donde se enviarán los usuarios mientras existan cupos, el texto de los botones y la lista de espera externa en caso de cupos agotados.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">URL de Venta / Pasarela (Checkout) <span className="text-destructive">*</span></Label>
                    <Input
                      type="url"
                      required
                      value={currentConfig.checkout_url || currentConfig.url || ""}
                      onChange={(e) => updateConfig("checkout_url", e.target.value)}
                      className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all text-foreground"
                      placeholder="https://pay.hotmart.com/... o https://pay.chu.com/..."
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Texto del Botón de Compra</Label>
                    <Input
                      value={currentConfig.checkout_button_text || ""}
                      onChange={(e) => updateConfig("checkout_button_text", e.target.value)}
                      className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all text-foreground"
                      placeholder="Adquirir entrada"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Texto en Lista de Espera</Label>
                    <Input
                      value={currentConfig.waitlist_button_text || ""}
                      onChange={(e) => updateConfig("waitlist_button_text", e.target.value)}
                      className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all text-foreground"
                      placeholder="Únete a la lista de espera"
                    />
                  </div>
                </div>

                {/* Toggle: Lista de Espera Externa */}
                <div className="pt-3 border-t border-border/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-foreground">Redirigir a enlace externo si se agotan los cupos</Label>
                      <p className="text-[11px] text-muted-foreground">
                        Si se activa y el aforo está lleno, el usuario no se registrará en el sistema y será enviado directamente a la URL externa con sus datos pre-llenados.
                      </p>
                    </div>
                    <Switch
                      checked={!!currentConfig.use_external_waitlist}
                      onCheckedChange={(checked) => updateConfig("use_external_waitlist", checked)}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>

                  {currentConfig.use_external_waitlist && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground">URL Externa de Lista de Espera <span className="text-destructive">*</span></Label>
                      <Input
                        type="url"
                        required
                        value={currentConfig.paid_waitlist_url || ""}
                        onChange={(e) => updateConfig("paid_waitlist_url", e.target.value)}
                        className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all text-foreground"
                        placeholder="https://hyenukchu.com/lista-de-espera o enlace de registro externo"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
