import { MessageCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistrationHeroProps {
  title: string;
  description: string;
  whatsappUrl?: string | null;
  whatsappButtonText?: string | null;
}

export function RegistrationHero({ 
  title, 
  description,
  whatsappUrl,
  whatsappButtonText = "Unirme al grupo de WhatsApp"
}: RegistrationHeroProps) {
  const hasWhatsapp = !!whatsappUrl && whatsappUrl.trim().length > 0;

  return (
    <div className="max-w-[1372px] mx-auto text-center space-y-8">
      <h2 className="text-4xl sm:text-6xl lg:text-[88px] font-extrabold tracking-tighter leading-[0.95] text-foreground whitespace-pre-line">
        {title}
      </h2>
      <div className="space-y-6">
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed px-4">
          {description}
        </p>

        {hasWhatsapp && (
          <div className="flex flex-col items-center gap-3 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-sm md:text-base font-medium text-muted-foreground/80">
              O si prefieres, únete al grupo de WhatsApp de este evento:
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-[20px] text-base md:text-lg font-black transition-all duration-300",
                "shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.5)]",
                "hover:scale-[1.03] active:scale-95 cursor-pointer"
              )}
            >
              <MessageCircle className="size-5 shrink-0" />
              <span>{whatsappButtonText || "Unirme al grupo de WhatsApp"}</span>
              <ArrowUpRight className="size-4 shrink-0 opacity-80" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
