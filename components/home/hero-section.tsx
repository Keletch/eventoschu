"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";

const WordRotator = dynamic(() => import("./word-rotator").then(mod => mod.WordRotator), { ssr: false });
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

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

  // GSAP animation logic moved to dynamically imported WordRotator component

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto text-center space-y-8">
      {/* Badge de lista de espera */}
      <div 
        className="hero-badge animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out inline-flex items-center gap-3 px-6 py-2 bg-hero-badge-bg rounded-full border border-hero-badge-border transition-colors"
        style={{ animationFillMode: "both" }}
      >
        <div className="w-2 h-2 bg-hero-badge-text rounded-full animate-pulse" />
        <span className="text-hero-badge-text font-semibold text-base">
          Lista de espera para reservar cupo
        </span>
      </div>

      {/* Título animado */}
      <h1 
        className="hero-title animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[200ms] ease-out font-extrabold tracking-tight leading-[0.9] text-hero-title text-center flex flex-col items-center transition-none"
        style={{ animationFillMode: "both" }}
      >
        <div className="h-[70px] sm:h-[100px] lg:h-[150px] overflow-hidden flex items-center justify-center mask-fade-vertical">
          <WordRotator />
        </div>
        <div className="text-4xl sm:text-6xl lg:text-[88px] -mt-2 sm:-mt-4 lg:-mt-6 whitespace-nowrap transition-none">
          HyenUk Chu
        </div>
      </h1>

      {/* Descripción */}
      <p 
        className="hero-desc animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[400ms] ease-out max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-hero-desc font-medium leading-relaxed px-4"
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
            className="bg-hero-btn-bg text-hero-btn-text font-bold h-14 px-10 rounded-2xl shadow-lg shadow-hero-btn-bg/20 hover:scale-[1.03] hover:opacity-90 transition-all flex items-center gap-3 text-lg transform backface-visibility-hidden antialiased"
          >
            <Ticket className="size-6" />
            Mis registros
          </Button>
        )}

        {true && (
          <Button
            onClick={() => setIsCheckMode(true)}
            variant="link"
            className="text-primary font-bold text-lg hover:no-underline hover:text-primary/80 transform backface-visibility-hidden antialiased"
          >
            <span className="underline decoration-secondary text-secondary cursor-pointer hover:opacity-80 transition-opacity font-bold">
              ¿Ya te registraste? Consulta el estatus
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
