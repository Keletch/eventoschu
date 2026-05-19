"use client";

import { DotScrollbar } from "./dot-scrollbar";

interface SidebarScrollbarProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Scrollbar del sidemenu. Delegado a DotScrollbar con:
 * - scroll de un elemento contenedor
 * - posición absolute
 * - color: token del sidebar
 * - sin ola de carga
 */
export function SidebarScrollbar({ scrollContainerRef }: SidebarScrollbarProps) {
  return (
    <DotScrollbar
      scrollTarget={scrollContainerRef as React.RefObject<HTMLElement | null>}
      position="absolute"
      colorVar="--scrollbar-sidebar-dot"
      showLoadingWave={false}
      className="z-[100]"
    />
  );
}
