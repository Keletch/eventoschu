"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface HeroSectionProps {
  isSignedIn: boolean | undefined;
  user: any;
  isCheckMode: boolean;
  revalidateStatus: (email: string) => Promise<void>;
  setIsCheckMode: (val: boolean) => void;
}

export function HeroSection({
  isSignedIn,
  user,
  isCheckMode,
  revalidateStatus,
  setIsCheckMode,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Word Rotator Interno (Mantenemos GSAP puro para esto)
    const words = ["Giras", "Eventos", "Talleres", "Reuniones"];
    let currentIndex = 0;
    const rotator = document.querySelector(".word-rotator");

    if (rotator) {
      const rotate = () => {
        const nextIndex = (currentIndex + 1) % words.length;
        const nextWord = words[nextIndex];
        const tlRotator = gsap.timeline({
          onComplete: () => {
            currentIndex = nextIndex;
            setTimeout(rotate, 1200);
          }
        });

        tlRotator.to(rotator, {
          y: 120, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power2.in",
          onComplete: () => {
            rotator.textContent = nextWord;
            gsap.set(rotator, { y: -120, filter: "blur(10px)" });
          }
        }).to(rotator, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "back.out(1.2)" });
      };
      setTimeout(rotate, 1500);
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto text-center space-y-8">
      {/* Badge de lista de espera */}
      <Tooltip>
        <TooltipTrigger>
          <div 
            className="hero-badge animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out inline-flex items-center gap-3 px-6 py-2 bg-[#3154DC]/10 rounded-full border border-[#3154DC]/20 cursor-help transition-colors hover:bg-[#3154DC]/20"
            style={{ animationFillMode: "both" }}
          >
            <div className="w-2 h-2 bg-[#3154DC] rounded-full animate-pulse" />
            <span className="text-[#3154DC] font-semibold text-base">
              Lista de espera para reservar cupo
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px] p-4 rounded-xl text-center">
          El registro no garantiza el acceso inmediato, pero asegura tu lugar en la fila.
        </TooltipContent>
      </Tooltip>

      {/* Título animado */}
      <h1 
        className="hero-title animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[200ms] ease-out font-extrabold tracking-tight leading-[0.9] text-black text-center flex flex-col items-center"
        style={{ animationFillMode: "both" }}
      >
        <div className="h-[70px] sm:h-[100px] lg:h-[150px] overflow-hidden flex items-center justify-center mask-fade-vertical">
          <span className="word-rotator block text-5xl sm:text-7xl lg:text-[120px] text-black leading-none">
            Giras
          </span>
        </div>
        <div className="text-4xl sm:text-6xl lg:text-[88px] -mt-2 sm:-mt-4 lg:-mt-6 whitespace-nowrap">
          HyenUk Chu
        </div>
      </h1>

      {/* Descripción */}
      <p 
        className="hero-desc animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[400ms] ease-out max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 font-medium leading-relaxed px-4"
        style={{ animationFillMode: "both" }}
      >
        Espacio relajado con Hyenuk Chu para compartir, conocernos mejor y fortalecer conexiones auténticas.
      </p>

      {/* CTAs */}
      <div 
        className="hero-check animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[500ms] ease-out flex flex-col items-center gap-6 pt-6"
        style={{ animationFillMode: "both" }}
      >
        {isSignedIn && (
          <Button
            onClick={() => {
              const email = user?.primaryEmailAddress?.emailAddress;
              if (email) revalidateStatus(email);
            }}
            className="bg-[#3154DC] text-white font-bold h-14 px-10 rounded-2xl shadow-[0_10px_20px_-5px_rgba(49,84,220,0.2)] hover:scale-[1.03] hover:bg-[#3154DC]/90 transition-all flex items-center gap-3 text-lg transform backface-visibility-hidden antialiased"
          >
            <Ticket className="size-6" />
            Mis registros
          </Button>
        )}

        {true && (
          <Button
            onClick={() => setIsCheckMode(true)}
            variant="link"
            className="text-[#3154DC] font-bold text-lg hover:no-underline hover:text-[#3154DC]/80 transform backface-visibility-hidden antialiased"
          >
            <span className="underline decoration-[#007AFF] text-[#007AFF] cursor-pointer hover:opacity-80 transition-opacity font-bold">
              ¿Ya te registraste? Consulta el estatus
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
