"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface SidebarScrollbarProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function SidebarScrollbar({ scrollContainerRef }: SidebarScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  const dotCount = 40; // Más densidad para que se vea como la original
  const dotArray = Array.from({ length: dotCount });

  useGSAP(() => {
    const scrollTarget = scrollContainerRef.current;
    if (!scrollTarget) return;

    const dots = dotsRef.current.filter(Boolean) as HTMLDivElement[];
    
    // ESTADO INICIAL: Puntos pequeños y tenues antes de revelar
    gsap.set(dots, { scale: 0.8, opacity: 0.3, x: 0 });

    // Revelar el componente
    gsap.set(containerRef.current, { visibility: "visible", opacity: 1 });

    const updateDots = () => {
      const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;
      const scrollPercent = maxScroll > 0 ? scrollTarget.scrollTop / maxScroll : 0;
      const activeIndex = scrollPercent * (dotCount - 1);

      dots.forEach((dot, i) => {
        const distance = Math.abs(i - activeIndex);
        
        // PARAMETROS ORIGINALES (Clonando la lógica global)
        const scale = gsap.utils.mapRange(0, 4, 1.8, 0.6, Math.min(distance, 4));
        const xOffset = gsap.utils.mapRange(0, 4, -8, 0, Math.min(distance, 4));
        const opacity = gsap.utils.mapRange(0, 4, 1, 0.15, Math.min(distance, 4));

        gsap.to(dot, {
          scale,
          x: xOffset,
          opacity,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    };

    let lastY = scrollTarget.scrollTop;
    const onScroll = () => {
      updateDots();
      const currentY = scrollTarget.scrollTop;
      const velocity = Math.abs(currentY - lastY);
      lastY = currentY;

      // Velocidad reactiva original
      if (velocity > 10) {
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

    scrollTarget.addEventListener("scroll", onScroll);
    updateDots();

    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
    };
  }, { scope: containerRef, dependencies: [scrollContainerRef] });

  return (
    <div 
      ref={containerRef}
      className="absolute right-1 top-2 bottom-2 w-6 z-[100] pointer-events-none flex items-center justify-end opacity-0"
    >
      <div className="flex flex-col h-full justify-between items-end pr-1">
        {dotArray.map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.4)]"
            style={{
              willChange: "transform, opacity"
            }}
          />
        ))}
      </div>
    </div>
  );
}
