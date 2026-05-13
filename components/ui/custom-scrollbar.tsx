"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CustomScrollbar() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const loadingTl = useRef<gsap.core.Timeline | null>(null);
  const [isCurrentlyLoading, setIsCurrentlyLoading] = useState(false);

  const isDark = resolvedTheme === "dark";

  const isAdmin = pathname?.startsWith("/admin");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dotCount = 40; // Igualamos la densidad del sidebar
  const dotArray = Array.from({ length: dotCount });

  useGSAP(() => {
    if (isAdmin || isMobile) return;
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
        const scale = gsap.utils.mapRange(0, 4, 1.8, 0.6, Math.min(distance, 4));
        const xOffset = gsap.utils.mapRange(0, 4, -8, 0, Math.min(distance, 4));
        const opacity = gsap.utils.mapRange(0, 4, 1, 0.15, Math.min(distance, 4));

        // Detectar si es synthwave buscando la clase en el html
        const isSynthwave = document.documentElement.classList.contains('synthwave');

        let bgColor = "#818CF8";
        let glowColor = "rgba(129, 140, 248, 0.3)";

        if (isSynthwave) {
          bgColor = i % 5 === 0 ? "#bd00ff" : "#ff71ce"; 
          glowColor = i % 5 === 0 ? "rgba(189, 0, 255, 0.6)" : "rgba(255, 113, 206, 0.4)";
        } else if (isDark) {
          bgColor = i % 5 === 0 ? "#E6E2D3" : "#A19A8E";
          glowColor = i % 5 === 0 ? "rgba(230, 226, 211, 0.4)" : "rgba(161, 154, 142, 0.2)";
        } else {
          bgColor = i % 5 === 0 ? "#3154DC" : "#818CF8";
          glowColor = i % 5 === 0 ? "rgba(49, 84, 220, 0.6)" : "rgba(129, 140, 248, 0.3)";
        }

        gsap.to(dot, {
          scale,
          x: xOffset,
          opacity,
          duration: 0.3, 
          ease: "power2.out",
          overwrite: "auto",
          backgroundColor: bgColor,
          boxShadow: `0 0 ${gsap.utils.mapRange(0, 4, 12, 0, Math.min(distance, 4))}px ${glowColor}`
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
    const onScroll = () => {
      // Solo actualizamos por scroll si NO estamos en modo carga
      const isWaveActive = loadingTl.current && loadingTl.current.isActive();
      if (!isWaveActive) {
        updateDots();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateDots(); // Render inicial

    return () => {
      window.removeEventListener("app-loading-start", startLoadingWave);
      window.removeEventListener("app-loading-stop", stopLoadingWave);
      window.removeEventListener("scroll", onScroll);
      dotsRef.current = [];
    };
  }, [isAdmin, isDark, isMobile]);

  if (isAdmin || isMobile) return null;

  return (
    <div 
      ref={containerRef}
      style={{ visibility: "hidden" }}
      className="fixed right-1 inset-y-0 h-screen w-6 z-[45] pointer-events-none flex items-center justify-end"
    >
      <div className="flex flex-col h-full justify-between items-end pr-1 py-8">
        {dotArray.map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className="w-1 h-1 rounded-full"
            style={{ 
              willChange: "transform, opacity",
              transform: "translateZ(0)"
            }}
          />
        ))}
      </div>
    </div>
  );
}
