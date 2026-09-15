"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackGTMEvent } from "@/lib/gtm-utils";

interface ShareSectionProps {
  selectedCityId: string;
  eventTitle?: string;
  userId?: string;
  userName?: string;
}

export function ShareSection({ selectedCityId, eventTitle, userId, userName }: ShareSectionProps) {
  const getShareLink = () => {
    // Generar slug limpio del evento a partir del título (ej. "gira-bogota-2026")
    const cleanEventSlug = eventTitle
      ? eventTitle
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : selectedCityId;

    let link = `${window.location.origin}?event=${cleanEventSlug || selectedCityId}`;

    // Generar referencia limpia legible (ej. "juan-perez" o fallback a ID)
    const cleanUserSlug = userName
      ? userName
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : userId;

    if (cleanUserSlug) {
      link += `&ref=${cleanUserSlug}`;
    }
    return link;
  };

  const handleWhatsapp = () => {
    trackGTMEvent("event_shared", { share_method: "whatsapp" });
    const link = getShareLink();
    const titleText = eventTitle ? `"${eventTitle}"` : "la gira de HyenUk Chu";
    const text = encodeURIComponent(
      `¡Hola! Me acabo de registrar para el evento ${titleText}. Te comparto el link para que también te registres y apartes tu cupo: ${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    trackGTMEvent("event_shared", { share_method: "copy_link" });
    const link = getShareLink();
    navigator.clipboard.writeText(link).then(() => {
      toast.success("¡Enlace copiado al portapapeles!");
    });
  };

  return (
    <div className="max-w-[1372px] mx-auto mt-12 bg-muted dark:bg-muted/50 border border-border rounded-[32px] p-8 md:p-12 lg:p-20 shadow-none">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        <div className="space-y-3 text-center lg:text-left">
          <h3 className="text-xl md:text-2xl font-extrabold text-foreground">
            ¿Conoces a alguien que deba estar en esta reunión?
          </h3>
          <p className="text-base md:text-xl text-muted-foreground font-light">
            Comparte el link de registro con otros inversores de tu ciudad
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full lg:w-auto">
          <Button
            onClick={handleWhatsapp}
            variant="outline"
            className="h-14 px-6 rounded-2xl border-primary text-primary font-bold text-base md:text-lg hover:bg-primary/10 w-full sm:w-[240px] transform backface-visibility-hidden antialiased"
          >
            Enviar por whatsapp
          </Button>
          <Button
            onClick={handleCopyLink}
            className="h-14 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-base md:text-lg hover:bg-primary/90 w-full sm:w-[240px] transform backface-visibility-hidden antialiased shadow-lg shadow-primary/10"
          >
            Copiar link
          </Button>
        </div>
      </div>
    </div>
  );
}
