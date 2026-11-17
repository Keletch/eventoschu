"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { KeapTagPicker } from "../keap-tag-picker";
import { EventKind, membershipLinks } from "../../../utils/event-kind";

interface SalesSectionProps {
  event: any;
  setEvent: (event: any) => void;
  systemTags: any[];
  keapTags: any[];
  kind: EventKind;
}

/**
 * 💳 Configuración de venta según el tipo: enlace de compra y enlaces por membresía (venta externa)
 * o checkout y lista de espera (pago con cupo). Va justo debajo del selector de tipo.
 * No renderiza nada en los tipos gratuitos.
 */
export const SalesSection: React.FC<SalesSectionProps> = ({ event, setEvent, systemTags, keapTags = [], kind }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 empty:hidden">
        {/* Campos condicionales para Pago */}
        {(() => {
          const isClosed = (event.initial_status ?? "confirmed") === "pending";
          if (isClosed) return null;

          const pagoTag = systemTags.find((t: any) => t.slug === "pago");
          const isPaidEvent = pagoTag && event.tag_ids?.includes(pagoTag.id);
          if (!isPaidEvent) return null;

          // Solo enlaces por membresía; las configuraciones (typ/whatsapp/pago_cupo) se conservan aparte
          const paidLinks = membershipLinks(event);
          const configs = (event.paid_links || []).filter((l: any) => l.type);
          const savePaidLinks = (updated: any[]) => setEvent({ ...event, paid_links: [...configs, ...updated] });

          const handleAddPaidLink = () => {
            savePaidLinks([...paidLinks, { url: "", button_text: "", keap_tag_id: "" }]);
          };

          const handleUpdatePaidLink = (index: number, field: string, value: string) => {
            const updated = [...paidLinks];
            updated[index] = { ...updated[index], [field]: value };
            savePaidLinks(updated);
          };

          const handleRemovePaidLink = (index: number) => {
            savePaidLinks(paidLinks.filter((_: any, i: number) => i !== index));
          };

          return (
            <div className="md:col-span-2 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 mt-4">

              {/* ── Enlace predeterminado (para todos). "Solo miembros" no lo tiene. ── */}
              {kind !== "venta_exclusiva" && (
              <div className="p-5 bg-muted/30 rounded-[20px] border border-border/50 space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase text-foreground tracking-wide">Enlace Predeterminado</h4>
                  <p className="text-[11px] text-muted-foreground">Es el enlace que verán todos los usuarios sin membresía o sin tag asignado. Obligatorio si el evento es de pago.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">URL del enlace de compra</Label>
                    <Input
                      value={event.external_url || ""}
                      onChange={(e) => setEvent({ ...event, external_url: e.target.value })}
                      className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all"
                      placeholder="https://hotmart.com/... o # si aún no hay enlace"
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
              )}

              {/* ── Links condicionados por tag de Keap ("Venta pública" no los usa) ── */}
              {kind !== "venta" && (
              <div className="p-5 bg-muted/30 rounded-[20px] border border-border/50 space-y-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase text-foreground tracking-wide">Enlaces por Membresía</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {kind === "venta_exclusiva"
                      ? "Solo quien tenga el tag de Keap verá su enlace. Sin el tag, el botón aparece bloqueado."
                      : "Quien tenga el tag de Keap verá este enlace y precio en lugar del general."}
                    {" "}Se evalúan en cascada: el último que coincida gana.
                  </p>
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
                          value={link.url || ""}
                          onChange={(e) => handleUpdatePaidLink(index, "url", e.target.value)}
                          className="rounded-xl border-border h-12 text-xs bg-muted/50 focus:bg-background transition-all"
                          placeholder="https://hotmart.com/... o # si aún no hay enlace"
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
              </div>
              )}
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
  );
};
