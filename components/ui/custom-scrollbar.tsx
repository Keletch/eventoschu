"use client";

import { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CustomScrollbar() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const loadingTl = useRef<gsap.core.Timeline | null>(null);
  const [isCurrentlyLoading, setIsCurrentlyLoading] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");
  const dotCount = 30;
  const dotArray = Array.from({ length: dotCount });

  useGSAP(() => {
    if (isAdmin) return;
    gsap.registerPlugin(ScrollTrigger);
    const dots = dotsRef.current.filter(Boolean) as HTMLDivElement[];
    
    // 1. ESTADO INICIAL: Silencioso y oculto
    gsap.set(dots, { scale: 0.6, opacity: 0.15, x: 0 });
    gsap.set(containerRef.current, { visibility: "visible", opacity: 1 });

    const updateDots = (indexOverride?: number) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const scrollIndex = scrollPercent * (dotCount - 1);
      const activeIndex = indexOverride !== undefined ? indexOverride : scrollIndex;

      dots.forEach((dot, i) => {
        const distance = Math.abs(i - activeIndex);
        const scale = gsap.utils.mapRange(0, 5, 2, 0.6, Math.min(distance, 5));
        const xOffset = gsap.utils.mapRange(0, 5, -8, 0, Math.min(distance, 5));
        const opacity = gsap.utils.mapRange(0, 5, 1, 0.15, Math.min(distance, 5));

        gsap.to(dot, {
          scale,
          x: xOffset,
          opacity,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
          backgroundColor: i % 5 === 0 ? "#3154DC" : "#818CF8",
          boxShadow: i % 5 === 0 
            ? `0 0 ${gsap.utils.mapRange(0, 5, 12, 0, Math.min(distance, 5))}px rgba(49, 84, 220, 0.6)` 
            : `0 0 ${gsap.utils.mapRange(0, 5, 6, 0, Math.min(distance, 5))}px rgba(129, 140, 248, 0.3)`
        });
      });
    };

    // Lógica de Ola (Pulse Wave)
    const startLoadingWave = () => {
      setIsCurrentlyLoading(true);
      if (loadingTl.current) loadingTl.current.kill();

      const pulseObj = { index: -5 };
      loadingTl.current = gsap.timeline({
        repeat: -1,
        onUpdate: () => updateDots(pulseObj.index)
      });

      loadingTl.current.to(pulseObj, {
        index: dotCount + 5,
        duration: 2.2,
        ease: "sine.inOut"
      });
    };

    const stopLoadingWave = () => {
      setIsCurrentlyLoading(false);
      if (loadingTl.current && loadingTl.current.isActive()) {
        loadingTl.current.repeat(0); // Finaliza el ciclo actual hasta abajo
        loadingTl.current.eventCallback("onComplete", () => {
          updateDots(); // Al terminar, vuelve al scroll real
        });
      } else {
        updateDots();
      }
    };

    // Eventos Globales de Carga
    window.addEventListener("app-loading-start", startLoadingWave);
    window.addEventListener("app-loading-stop", stopLoadingWave);

    // Scroll Original
    let lastY = window.scrollY;
    const onScroll = () => {
      // Solo actualizamos por scroll si NO estamos en modo carga u onda finalizando
      const isWaveActive = loadingTl.current && loadingTl.current.isActive();
      if (!isWaveActive) {
        updateDots();
      }

      const currentY = window.scrollY;
      const velocity = Math.abs(currentY - lastY);
      lastY = currentY;

      if (velocity > 60 && !isWaveActive) {
        gsap.to(dots, {
          x: (i) => (i % 2 === 0 ? -velocity / 15 : velocity / 30),
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(dots, { x: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
          }
        });
      }
    };

    window.addEventListener("scroll", onScroll);
    updateDots(); // Render inicial

    return () => {
      window.removeEventListener("app-loading-start", startLoadingWave);
      window.removeEventListener("app-loading-stop", stopLoadingWave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <div 
      ref={containerRef}
      style={{ visibility: "hidden" }}
      className="fixed right-1 top-2 bottom-2 w-6 z-[45] pointer-events-none flex items-center justify-end"
    >
      <div className="flex flex-col h-full justify-between items-end pr-1">
        {dotArray.map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className={`w-1 h-1 rounded-full ${i % 3 !== 0 ? "hidden md:block" : ""}`}
            style={{ willChange: "transform, opacity" }}
          />
        ))}
      </div>
    </div>
  );
}
