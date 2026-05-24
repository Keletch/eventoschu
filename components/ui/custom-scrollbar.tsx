"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DotScrollbar } from "./dot-scrollbar";

/**
 * Scrollbar global de página. Delegado a DotScrollbar con:
 * - scroll de window
 * - posición fixed
 * - color: token primario del tema
 * - ola de carga activada (showLoadingWave)
 */
export function CustomScrollbar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = pathname?.startsWith("/admin");
  if (isAdmin || isMobile) return null;

  return (
    <DotScrollbar
      scrollTarget="window"
      position="fixed"
      colorVar="--scrollbar-dot"
      showLoadingWave
      className="z-[45]"
    />
  );
}
