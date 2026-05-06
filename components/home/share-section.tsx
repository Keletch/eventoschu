"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareSectionProps {
  selectedCityId: string;
  cityName: string;
  userId?: string;
}

export function ShareSection({ selectedCityId, cityName, userId }: ShareSectionProps) {
  const getShareLink = () => {
    let link = `${window.location.origin}?city=${selectedCityId}`;
    if (userId) {
      link += `&ref=${userId}`;
    }
    return link;
  };

  const handleWhatsapp = () => {
    const link = getShareLink();
    const text = encodeURIComponent(
      `¡Hola! Me acabo de registrar para la gira de HyenUk Chu en ${cityName || "mi ciudad"}. Te comparto el link para que también te registres: ${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link).then(() => {
      toast.success("¡Enlace copiado al portapapeles!");
    });
  };

  return (
    <div className="max-w-[1372px] mx-auto mt-12 bg-[#F5F6F9] rounded-[32px] p-8 md:p-12 lg:p-20">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        <div className="space-y-3 text-center lg:text-left">
          <h3 className="text-xl md:text-2xl font-extrabold text-black">
            ¿Conoces a alguien que deba estar en esta reunión?
          </h3>
          <p className="text-base md:text-xl text-gray-500 font-light">
            Comparte el link de registro con otros inversores de tu ciudad
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full lg:w-auto">
          <Button
            onClick={handleWhatsapp}
            variant="outline"
            className="h-14 px-10 rounded-2xl border-[#3154DC] text-[#3154DC] font-bold text-lg md:text-xl hover:bg-[#3154DC]/10 w-full sm:w-auto transform backface-visibility-hidden antialiased"
          >
            Enviar por whatsapp
          </Button>
          <Button
            onClick={handleCopyLink}
            className="h-14 px-10 rounded-2xl bg-[#3154DC] text-white font-bold text-lg md:text-xl hover:bg-[#3154DC]/90 w-full sm:w-auto transform backface-visibility-hidden antialiased shadow-lg shadow-[#3154DC]/10"
          >
            Copiar link
          </Button>
        </div>
      </div>
    </div>
  );
}
