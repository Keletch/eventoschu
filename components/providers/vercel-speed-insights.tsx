"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";

export function VercelSpeedInsights() {
  const pathname = usePathname();

  // Excluir rutas de administración si prefieres (siguiendo el patrón de analytics)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <SpeedInsights />;
}
