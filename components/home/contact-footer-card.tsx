"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SUPPORT_EMAIL = "soporte@elclubdeinversionistas.com";
const SUPPORT_WHATSAPP = "573164770410";

export function ContactFooterCard() {
  const handleEmail = () => {
    const subject = encodeURIComponent("Consulta Registro Giras HyenUk Chu");
    const body = encodeURIComponent("Hola equipo de soporte,\n\nTengo la siguiente duda sobre mi registro:");
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  };

  const handleWhatsapp = () => {
    const text = encodeURIComponent("¡Hola! Tengo una duda sobre mi registro para las giras de HyenUk Chu. ¿Podrían ayudarme?");
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-[1372px] mx-auto mt-12 bg-[#3154DC] rounded-[32px] py-12 md:py-16 lg:py-20 px-8 md:px-12 text-center text-white space-y-10 md:space-y-12">
      <h3 className="text-xl md:text-3xl font-bold">¿Dudas? contáctanos</h3>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8">
        <Button
          onClick={handleEmail}
          variant="outline"
          className="h-14 md:h-16 px-8 md:px-12 rounded-2xl border-white bg-transparent text-white font-bold text-lg md:text-xl hover:bg-white/10 transition-colors w-full sm:w-auto"
        >
          Correo electrónico
        </Button>
        <Button
          onClick={handleWhatsapp}
          className="h-14 md:h-16 px-8 md:px-12 rounded-2xl bg-white text-[#3154DC] font-bold text-lg md:text-xl hover:bg-white/90 transition-colors w-full sm:w-auto"
        >
          Whatsapp
        </Button>
      </div>
    </div>
  );
}
