"use client";

import React, { useState } from "react";
import { EventFlag } from "@/components/ui/event-flag";
import { toast } from "sonner";
import { uploadImage } from "@/app/actions/upload-image";
import { convertToWebP } from "@/lib/image-utils";
import { AVAILABLE_ICONS } from "@/lib/icons";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { KeapTagPicker } from "./keap-tag-picker";

import { StatusSection } from "./event-dialog-sections/status-section";
import { IdentitySection } from "./event-dialog-sections/identity-section";
import { LocationSection } from "./event-dialog-sections/location-section";
import { CapacityPriceSection } from "./event-dialog-sections/capacity-price-section";
import { AdditionalInfoSection } from "./event-dialog-sections/additional-info-section";
import { VisualSection } from "./event-dialog-sections/visual-section";
import { KeapSection } from "./event-dialog-sections/keap-section";

/** Ícono circular "i" con tooltip para guiar a nuevos admins */
export function InfoTooltip({ content }: { content: string }) {
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
  systemTags?: any[];
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

const TIMEZONE_LABELS: Record<string, string> = {
  "none": "Sin huso horario",
  "America/Mexico_City": "Ciudad de México (CDMX)",
  "America/Bogota": "Bogotá / Lima / Quito",
  "America/New_York": "Miami / Nueva York (EST)",
  "America/Argentina/Buenos_Aires": "Buenos Aires (ARG)",
  "America/Santiago": "Santiago (CHL)",
  "Europe/Madrid": "Madrid (España)",
};

export const EventDialog: React.FC<EventDialogProps> = ({
  isOpen,
  setIsOpen,
  event,
  setEvent,
  categories,
  systemTags = [],
  keapTags,
  isTagsLoading,
  onRefreshTags,
  isSubmitting,
  onSubmit,
}) => {
  const isTimeConfirm = event.time === "Por confirmar";
  const isDateConfirm = event.start_date?.startsWith("2099");
  const isDurationConfirm = event.duration === "Por confirmar";
  // Evento Abierto (confirmed) puede ser ilimitado. Evento Cerrado (pending) no.
  const isOpenMode = (event.initial_status ?? "confirmed") !== "pending";
  const isUnlimited = (event.capacity ?? 0) >= 9999;
  // Detectar si la categoría seleccionada es "Eventos en linea" por su slug
  const selectedCategory = categories.find(
    (c: any) => c.id.toString() === event.category_id?.toString()
  );
  const parentCategory = selectedCategory?.parent_category_id 
    ? categories.find((c: any) => c.id === selectedCategory.parent_category_id) 
    : null;
    
  const isOnline = selectedCategory?.slug === "online" || 
                   selectedCategory?.slug === "eventos-en-linea" ||
                   parentCategory?.slug === "online" || 
                   parentCategory?.slug === "eventos-en-linea" ||
                   !!event.is_virtual;

  const [isUploading, setIsUploading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showInfoUrl, setShowInfoUrl] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShowDescription(!!event.description);
      setShowInfoUrl(!!event.info_url);
    }
  }, [isOpen, event.description, event.info_url]);

  const handleToggleDescription = (checked: boolean) => {
    setShowDescription(checked);
    if (!checked) {
      setEvent((prev: any) => ({ ...prev, description: "" }));
    }
  };

  const handleToggleInfoUrl = (checked: boolean) => {
    setShowInfoUrl(checked);
    if (!checked) {
      setEvent((prev: any) => ({ ...prev, info_url: "" }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validación de tamaño original (Máximo 10MB para permitir que el conversor actúe sobre fotos pesadas)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen original es demasiado gigante. Máximo 10MB permitido.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Transformar a WebP (Codex) con max 800px para que pese súper poco
      toast.info("Optimizando imagen...");
      const optimizedFile = await convertToWebP(file, 800, 0.8);

      // 2. Subir el archivo ya optimizado
      const formData = new FormData();
      formData.append("file", optimizedFile);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setEvent({ ...event, image_url: res.url });
        toast.success("Imagen de evento subida con éxito.");
      } else {
        toast.error(res.error || "Error al subir imagen.");
      }
    } catch (_error) {
      toast.error("Error al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

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
              <StatusSection event={event} setEvent={setEvent} />

              {/* ── Sección 1: Identidad ── */}
              <IdentitySection
                event={event}
                setEvent={setEvent}
                categories={categories}
                systemTags={systemTags}
                isOnline={isOnline}
                isUploading={isUploading}
                handleFileUpload={handleFileUpload}
              />

              {/* ── Sección 2: Lugar y Fecha ── */}
              <LocationSection event={event} setEvent={setEvent} isOnline={isOnline} />

              {/* ── Sección 3: Capacidad y Precio ── */}
              <CapacityPriceSection event={event} setEvent={setEvent} isOpenMode={isOpenMode} />

              {/* ── Sección 3.5: Información Adicional (Opcional) ── */}
              <AdditionalInfoSection event={event} setEvent={setEvent} />

              {/* ── Sección 4: Visual ── */}
              <VisualSection event={event} setEvent={setEvent} />

              {/* ── Sección 5: Integración Keap ── */}
              <KeapSection
                event={event}
                setEvent={setEvent}
                keapTags={keapTags}
                isTagsLoading={isTagsLoading}
                onRefreshTags={onRefreshTags}
              />

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
