"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface DotScrollbarProps {
  /** Ref a un elemento HTML (scroll de contenedor) o "window" (scroll de página) */
  scrollTarget?: React.RefObject<HTMLElement | null> | "window";
  /** Posicionamiento CSS del wrapper */
  position?: "fixed" | "absolute";
  /** Token CSS del color de los puntos (sin var()) */
  colorVar?: string;
  /** Si true, escucha los eventos globales "app-loading-start/stop" para la ola de carga */
  showLoadingWave?: boolean;
  /** Clases extras para el wrapper externo */
  className?: string;
}

const DOT_COUNT = 40;

export function DotScrollbar({
  scrollTarget = "window",
  position = "absolute",
  colorVar = "--scrollbar-sidebar-dot",
  showLoadingWave = false,
  className = "",
}: DotScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const loadingTl = useRef<gsap.core.Timeline | null>(null);

  const dotArray = Array.from({ length: DOT_COUNT });

  useGSAP(() => {
    const isWindow = scrollTarget === "window";
    const scrollEl = isWindow ? null : (scrollTarget as React.RefObject<HTMLElement>).current;

    // Si es un ref y todavía no tiene el elemento, salimos
    if (!isWindow && !scrollEl) return;

    const dots = dotsRef.current.filter(Boolean) as HTMLDivElement[];

    // Estado inicial: tenues
    gsap.set(dots, { scale: 0.8, opacity: 0.3, x: 0 });
    gsap.set(containerRef.current, { visibility: "visible", opacity: 1 });

    // ── Lógica de actualización de puntos ──────────────────────
    const updateDots = (indexOverride?: number) => {
      const maxScroll = isWindow
        ? document.documentElement.scrollHeight - window.innerHeight
        : (scrollEl!.scrollHeight - scrollEl!.clientHeight);
      const scrollPos = isWindow ? window.scrollY : scrollEl!.scrollTop;
      const scrollPercent = maxScroll > 0 ? scrollPos / maxScroll : 0;
      const scrollIndex = scrollPercent * (DOT_COUNT - 1);
      const activeIndex = indexOverride !== undefined ? indexOverride : scrollIndex;

      dots.forEach((dot, i) => {
        const distance = Math.abs(i - activeIndex);
        const scale = gsap.utils.mapRange(0, 4, 1.8, 0.6, Math.min(distance, 4));
        const xOffset = gsap.utils.mapRange(0, 4, -8, 0, Math.min(distance, 4));
        const opacity = gsap.utils.mapRange(0, 4, 1, 0.15, Math.min(distance, 4));

        gsap.to(dot, {
          scale,
          x: xOffset,
          opacity,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    // ── Elasticidad por velocidad ──────────────────────────────
    let lastPos = isWindow ? window.scrollY : scrollEl!.scrollTop;
    const onScroll = () => {
      const isWaveActive = loadingTl.current?.isActive();
      if (!isWaveActive) updateDots();

      const currentPos = isWindow ? window.scrollY : scrollEl!.scrollTop;
      const velocity = Math.abs(currentPos - lastPos);
      lastPos = currentPos;

      if (velocity > 10 && !isWaveActive) {
        gsap.to(dots, {
          x: (i) => (i % 2 === 0 ? -velocity / 15 : velocity / 30),
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(dots, { x: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
          },
        });
      }
    };

    // ── Ola de carga: misma curva que el scroll, aplicada instantáneamente ──
    // gsap.set() en lugar de gsap.to() evita que los tweens se corten entre sí.
    // El pulseObj viaja de 0 a DOT_COUNT en loop; en cada frame aplica
    // el mismo perfil scale/opacity/x que usa el scroll, pero sin demora.
    const snapDots = (activeIndex: number) => {
      dots.forEach((dot, i) => {
        const distance = Math.abs(i - activeIndex);
        const scale = gsap.utils.mapRange(0, 4, 1.8, 0.6, Math.min(distance, 4));
        const xOffset = gsap.utils.mapRange(0, 4, -8, 0, Math.min(distance, 4));
        const opacity = gsap.utils.mapRange(0, 4, 1, 0.15, Math.min(distance, 4));
        gsap.set(dot, { scale, x: xOffset, opacity });
      });
    };

    const startLoadingWave = () => {
      if (loadingTl.current) loadingTl.current.kill();

      const pulseObj = { index: 0 };
      loadingTl.current = gsap.timeline({ repeat: -1 });
      loadingTl.current.to(pulseObj, {
        index: DOT_COUNT - 1,
        duration: 1.8,
        ease: "sine.inOut",
        onUpdate: () => snapDots(pulseObj.index),
      });
    };

    const stopLoadingWave = () => {
      if (loadingTl.current) {
        loadingTl.current.kill();
        loadingTl.current = null;
      }
      // Transición suave de vuelta al estado de scroll real
      gsap.to(dots, {
        scale: 0.8,
        x: 0,
        opacity: 0.3,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => updateDots(),
      });
    };

    // ── Registro de eventos ────────────────────────────────────
    if (isWindow) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      scrollEl!.addEventListener("scroll", onScroll);
    }

    if (showLoadingWave) {
      window.addEventListener("app-loading-start", startLoadingWave);
      window.addEventListener("app-loading-stop", stopLoadingWave);
    }

    updateDots(); // render inicial

    return () => {
      if (isWindow) {
        window.removeEventListener("scroll", onScroll);
      } else {
        scrollEl?.removeEventListener("scroll", onScroll);
      }
      if (showLoadingWave) {
        window.removeEventListener("app-loading-start", startLoadingWave);
        window.removeEventListener("app-loading-stop", stopLoadingWave);
      }
      dotsRef.current = [];
    };
  }, {
    scope: containerRef,
    dependencies: [scrollTarget, showLoadingWave],
  });

  const positionClass = position === "fixed"
    ? "fixed right-1 top-0 bottom-0 h-[100dvh] py-4"
    : "absolute right-1 top-2 bottom-2";

  return (
    <div
      ref={containerRef}
      className={`${positionClass} w-6 pointer-events-none opacity-0 ${className}`}
    >
      <div className="flex flex-col h-full justify-between items-end pr-1">
        {dotArray.map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className="w-1 h-1 rounded-full"
            style={{
              backgroundColor: `var(${colorVar})`,
              boxShadow: `0 0 4px color-mix(in srgb, var(${colorVar}) 40%, transparent)`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </div>
  );
}
